// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::State;

mod db;
mod commands;
mod utils;

use db::Database;

struct AppState {
    db: Mutex<Option<Database>>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
async fn init_database(state: State<'_, AppState>) -> Result<bool, String> {
    let db = Database::new("BelleBeaute.db")
        .map_err(|e| e.to_string())?;
    
    db.init().map_err(|e| e.to_string())?;
    
    let mut app_state = state.db.lock().unwrap();
    *app_state = Some(db);
    
    Ok(true)
}

#[tauri::command]
async fn check_database() -> Result<bool, String> {
    std::path::Path::new("BelleBeaute.db").exists();
    Ok(true)
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            init_database,
            check_database,
            commands::backup::create_backup,
            commands::backup::restore_backup,
            commands::products::get_products,
            commands::products::add_product,
            commands::sales::create_sale,
            commands::auth::login,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
