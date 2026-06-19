use tauri::command;
use chrono::Utc;
use std::fs;
use std::path::Path;

#[command]
pub async fn create_backup(backup_path: String) -> Result<String, String> {
    let db_path = "BelleBeaute.db";
    
    if !Path::new(db_path).exists() {
        return Err("Database not found".to_string());
    }

    let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("BelleBeaute_backup_{}.db", timestamp);
    let destination = Path::new(&backup_path).join(&filename);

    fs::copy(db_path, &destination)
        .map_err(|e| e.to_string())?;

    Ok(destination.to_string_lossy().to_string())
}

#[command]
pub async fn restore_backup(backup_file: String) -> Result<bool, String> {
    let db_path = "BelleBeaute.db";
    
    if !Path::new(&backup_file).exists() {
        return Err("Backup file not found".to_string());
    }

    // Create a safety backup before restoring
    let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let safety_backup = format!("BelleBeaute_before_restore_{}.db", timestamp);
    
    if Path::new(db_path).exists() {
        fs::copy(db_path, &safety_backup)
            .map_err(|e| e.to_string())?;
    }

    fs::copy(&backup_file, db_path)
        .map_err(|e| e.to_string())?;

    Ok(true)
}
