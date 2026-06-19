use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::async_runtime::spawn;
use rusqlite::Connection;
use chrono::Utc;

pub async fn setup_auto_backup() {
    spawn(async {
        loop {
            // Check every hour if backup is needed
            tokio::time::sleep(tokio::time::Duration::from_secs(3600)).await;
            
            if should_backup_today() {
                let _ = perform_backup().await;
            }
        }
    });
}

fn should_backup_today() -> bool {
    let backup_dir = "backups";
    let today = Utc::now().format("%Y%m%d").to_string();

    if !std::path::Path::new(backup_dir).exists() {
        return true;
    }

    // Check if backup exists for today
    if let Ok(entries) = fs::read_dir(backup_dir) {
        for entry in entries.flatten() {
            if let Ok(filename) = entry.file_name().into_string() {
                if filename.contains(&today) {
                    return false;
                }
            }
        }
    }

    true
}

async fn perform_backup() -> Result<(), String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("BelleBeaute_backup_{}.db", timestamp);
    let backup_path = std::path::PathBuf::from("backups").join(&filename);

    fs::create_dir_all("backups")
        .map_err(|e| format!("Failed to create backup dir: {}", e))?;

    fs::copy("BelleBeaute.db", &backup_path)
        .map_err(|e| format!("Failed to backup: {}", e))?;

    // Record in database
    let backup_id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let size = fs::metadata(&backup_path)
        .map_err(|e| format!("Failed to get metadata: {}", e))?
        .len();

    conn.execute(
        "INSERT INTO backups (id, filename, created_at, size, status) VALUES (?, ?, ?, ?, 'success')",
        rusqlite::params![&backup_id, &filename, &now, size],
    ).map_err(|e| format!("Failed to record backup: {}", e))?;

    Ok(())
}
