pub mod cpm;

use cpm::models::{Activity, Relationship, Calendar};
use cpm::engine::CpmEngine;

#[tauri::command]
fn calculate_cpm(activities: Vec<Activity>, relationships: Vec<Relationship>, calendars: Vec<Calendar>) -> Result<Vec<Activity>, String> {
    let mut engine = CpmEngine::new(activities, relationships, calendars);
    engine.calculate()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![calculate_cpm])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
