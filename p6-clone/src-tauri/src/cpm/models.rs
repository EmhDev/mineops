use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Activity {
    pub id: String,
    pub name: String,
    pub duration: u32,
    
    // Calculated CPM values
    pub early_start: Option<u32>,
    pub early_finish: Option<u32>,
    pub late_start: Option<u32>,
    pub late_finish: Option<u32>,
    pub total_float: Option<u32>,
    pub free_float: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RelType {
    FS, // Finish to Start
    SS, // Start to Start
    FF, // Finish to Finish
    SF, // Start to Finish
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relationship {
    pub source_id: String,
    pub target_id: String,
    pub rel_type: RelType,
    pub lag: i32,
}
