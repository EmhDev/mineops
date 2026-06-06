pub mod cpm_grpc {
    tonic::include_proto!("cpm");
}

use cpm_grpc::cpm_service_server::CpmService;
use cpm_grpc::{CpmRequest, CpmResponse, ActivityMessage};
use tonic::{Request, Response, Status};

use crate::cpm::models::{Activity, Relationship, RelType, Calendar};
use crate::cpm::engine::CpmEngine;

#[derive(Debug, Default)]
pub struct CpmGrpcServer {}

#[tonic::async_trait]
impl CpmService for CpmGrpcServer {
    async fn run_cpm(
        &self,
        request: Request<CpmRequest>,
    ) -> Result<Response<CpmResponse>, Status> {
        let req = request.into_inner();

        let activities: Vec<Activity> = req.activities.into_iter().map(|a| Activity {
            id: a.id,
            name: a.name,
            duration: a.duration,
            calendar_id: a.calendar_id,
            early_start: None,
            early_finish: None,
            late_start: None,
            late_finish: None,
            total_float: None,
            free_float: None,
        }).collect();

        let relationships: Vec<Relationship> = req.relationships.into_iter().map(|r| Relationship {
            source_id: r.source_id,
            target_id: r.target_id,
            rel_type: match r.rel_type.as_str() {
                "SS" => RelType::SS,
                "FF" => RelType::FF,
                "SF" => RelType::SF,
                _ => RelType::FS,
            },
            lag: r.lag as i32,
        }).collect();

        let calendars: Vec<Calendar> = req.calendars.into_iter().map(|c| Calendar {
            id: c.id,
            name: c.name,
            work_days: [
                c.work_days.get(0).copied().unwrap_or(true),
                c.work_days.get(1).copied().unwrap_or(true),
                c.work_days.get(2).copied().unwrap_or(true),
                c.work_days.get(3).copied().unwrap_or(true),
                c.work_days.get(4).copied().unwrap_or(true),
                c.work_days.get(5).copied().unwrap_or(false),
                c.work_days.get(6).copied().unwrap_or(false),
            ],
        }).collect();

        let mut engine = CpmEngine::new(activities, relationships, calendars);
        
        match engine.calculate() {
            Ok(result_activities) => {
                let grpc_activities = result_activities.into_iter().map(|a| ActivityMessage {
                    id: a.id,
                    name: a.name,
                    duration: a.duration,
                    calendar_id: a.calendar_id,
                    early_start: a.early_start,
                    early_finish: a.early_finish,
                    late_start: a.late_start,
                    late_finish: a.late_finish,
                    total_float: a.total_float,
                    free_float: a.free_float,
                }).collect();

                Ok(Response::new(CpmResponse { activities: grpc_activities }))
            },
            Err(e) => Err(Status::internal(format!("CPM Engine Error: {}", e))),
        }
    }
}
