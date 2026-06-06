use crate::cpm::models::{Activity, Relationship, RelType, Calendar};
use petgraph::graph::{DiGraph, NodeIndex};
use std::collections::HashMap;

pub struct CpmEngine {
    activities: Vec<Activity>,
    relationships: Vec<Relationship>,
    calendars: HashMap<String, Calendar>,
}

impl CpmEngine {
    pub fn new(activities: Vec<Activity>, relationships: Vec<Relationship>, cals: Vec<Calendar>) -> Self {
        let mut calendars = HashMap::new();
        // Insert default calendar
        calendars.insert("DEFAULT".to_string(), Calendar::default());
        
        for c in cals {
            calendars.insert(c.id.clone(), c);
        }

        CpmEngine {
            activities,
            relationships,
            calendars,
        }
    }

    fn add_working_days(&self, start_day: u32, duration: u32, cal_id: &Option<String>) -> u32 {
        if duration == 0 { return start_day; }
        
        let default_cal = Calendar::default();
        let cal = cal_id.as_ref()
            .and_then(|id| self.calendars.get(id))
            .unwrap_or(&default_cal);

        let mut current_day = start_day;
        let mut days_added = 0;

        // Skip initial non-working days if we are starting a task
        while !cal.work_days[(current_day % 7) as usize] {
            current_day += 1;
        }

        while days_added < duration {
            current_day += 1;
            if cal.work_days[(current_day % 7) as usize] {
                days_added += 1;
            }
        }
        current_day
    }

    fn subtract_working_days(&self, end_day: u32, duration: u32, cal_id: &Option<String>) -> u32 {
        if duration == 0 { return end_day; }
        
        let default_cal = Calendar::default();
        let cal = cal_id.as_ref()
            .and_then(|id| self.calendars.get(id))
            .unwrap_or(&default_cal);

        let mut current_day = end_day;
        let mut days_subtracted = 0;

        while days_subtracted < duration && current_day > 0 {
            current_day -= 1;
            if cal.work_days[(current_day % 7) as usize] {
                days_subtracted += 1;
            }
        }
        current_day
    }

    pub fn calculate(&mut self) -> Result<Vec<Activity>, String> {
        let mut graph = DiGraph::<String, ()>::new();
        let mut node_map: HashMap<String, NodeIndex> = HashMap::new();
        let mut act_map: HashMap<String, Activity> = HashMap::new();

        // 1. Build Graph
        for act in &self.activities {
            let idx = graph.add_node(act.id.clone());
            node_map.insert(act.id.clone(), idx);
            act_map.insert(act.id.clone(), act.clone());
        }

        for rel in &self.relationships {
            let source = node_map.get(&rel.source_id).ok_or(format!("Source ID {} not found", rel.source_id))?;
            let target = node_map.get(&rel.target_id).ok_or(format!("Target ID {} not found", rel.target_id))?;
            graph.add_edge(*source, *target, ());
        }

        // 2. Topological Sort (Cycle Detection)
        let sorted_nodes = match petgraph::algo::toposort(&graph, None) {
            Ok(nodes) => nodes,
            Err(cycle) => {
                let cycle_node = graph.node_weight(cycle.node_id()).unwrap();
                return Err(format!("Cycle detected at node {}", cycle_node));
            }
        };

        // 3. Forward Pass (ES, EF)
        for idx in &sorted_nodes {
            let node_id = graph.node_weight(*idx).unwrap().clone();
            
            // Default early start is 0
            let mut max_early_finish_of_preds: u32 = 0;
            
            // Check predecessors
            for pred_idx in graph.neighbors_directed(*idx, petgraph::Direction::Incoming) {
                let pred_id = graph.node_weight(pred_idx).unwrap();
                let pred_ef = act_map.get(pred_id).unwrap().early_finish.unwrap_or(0);
                
                // Simplified for Finish-to-Start only for now.
                // Complete P6 logic would handle SS, FF, SF and Lags here.
                if pred_ef > max_early_finish_of_preds {
                    max_early_finish_of_preds = pred_ef;
                }
            }

            let act = act_map.get_mut(&node_id).unwrap();
            act.early_start = Some(max_early_finish_of_preds);
            act.early_finish = Some(self.add_working_days(max_early_finish_of_preds, act.duration, &act.calendar_id));
        }

        // 4. Backward Pass (LS, LF)
        let mut max_ef: u32 = 0;
        for act in act_map.values() {
            if let Some(ef) = act.early_finish {
                if ef > max_ef {
                    max_ef = ef;
                }
            }
        }

        for idx in sorted_nodes.iter().rev() {
            let node_id = graph.node_weight(*idx).unwrap().clone();
            
            let mut min_late_start_of_succs: u32 = max_ef;
            let mut min_es_of_succs: u32 = max_ef;
            
            let has_successors = graph.neighbors_directed(*idx, petgraph::Direction::Outgoing).count() > 0;

            if has_successors {
                for succ_idx in graph.neighbors_directed(*idx, petgraph::Direction::Outgoing) {
                    let succ_id = graph.node_weight(succ_idx).unwrap();
                    
                    let succ_ls = act_map.get(succ_id).unwrap().late_start.unwrap_or(max_ef);
                    if succ_ls < min_late_start_of_succs {
                        min_late_start_of_succs = succ_ls;
                    }
                    
                    let succ_es = act_map.get(succ_id).unwrap().early_start.unwrap_or(max_ef);
                    if succ_es < min_es_of_succs {
                        min_es_of_succs = succ_es;
                    }
                }
            }

            let act = act_map.get_mut(&node_id).unwrap();
            act.late_finish = Some(min_late_start_of_succs);
            act.late_start = Some(self.subtract_working_days(min_late_start_of_succs, act.duration, &act.calendar_id));
            
            // Calculate Floats (in calendar days for now, P6 calculates float in working days but this is a start)
            act.total_float = Some(act.late_finish.unwrap().saturating_sub(act.early_finish.unwrap()));
            act.free_float = Some(min_es_of_succs.saturating_sub(act.early_finish.unwrap()));
        }

        // Return updated activities
        let mut result = Vec::new();
        for act in &self.activities {
            if let Some(updated_act) = act_map.get(&act.id) {
                result.push(updated_act.clone());
            }
        }

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cpm::models::{Activity, Relationship, RelType};

    #[test]
    fn test_simple_cpm_calculation() {
        let acts = vec![
            Activity { id: "A".to_string(), name: "Task A".to_string(), duration: 2, early_start: None, early_finish: None, late_start: None, late_finish: None, total_float: None, free_float: None },
            Activity { id: "B".to_string(), name: "Task B".to_string(), duration: 3, early_start: None, early_finish: None, late_start: None, late_finish: None, total_float: None, free_float: None },
            Activity { id: "C".to_string(), name: "Task C".to_string(), duration: 1, early_start: None, early_finish: None, late_start: None, late_finish: None, total_float: None, free_float: None },
        ];

        let rels = vec![
            Relationship { source_id: "A".to_string(), target_id: "B".to_string(), rel_type: RelType::FS, lag: 0 },
            Relationship { source_id: "B".to_string(), target_id: "C".to_string(), rel_type: RelType::FS, lag: 0 },
        ];

        let mut engine = CpmEngine::new(acts, rels, vec![]);
        let result = engine.calculate().unwrap();

        let a = result.iter().find(|x| x.id == "A").unwrap();
        assert_eq!(a.early_start, Some(0));
        assert_eq!(a.early_finish, Some(2));
        assert_eq!(a.late_start, Some(0));
        assert_eq!(a.late_finish, Some(2));
        assert_eq!(a.total_float, Some(0));

        let c = result.iter().find(|x| x.id == "C").unwrap();
        assert_eq!(c.early_start, Some(5)); // A(2) + B(3)
        assert_eq!(c.early_finish, Some(6));
    }
}

