use tauri::command;
use serde::{Deserialize, Serialize};
use chrono::Utc;
use std::fs;
use std::path::Path;
use rusqlite::Connection;
use uuid::Uuid;
use zip::ZipWriter;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BackupRecord {
    pub id: String,
    pub filename: String,
    pub created_at: String,
    pub size: i64,
    pub status: String,
}

#[command]
pub async fn create_backup(backup_path: String) -> Result<BackupRecord, String> {
    let db_path = "BelleBeaute.db";
    
    if !Path::new(db_path).exists() {
        return Err("Database not found".to_string());
    }

    // Create backups directory if it doesn't exist
    fs::create_dir_all(&backup_path)
        .map_err(|e| format!("Failed to create backup directory: {}", e))?;

    let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("BelleBeaute_backup_{}.db", timestamp);
    let destination = Path::new(&backup_path).join(&filename);

    fs::copy(db_path, &destination)
        .map_err(|e| format!("Failed to copy database: {}", e))?;

    let metadata = fs::metadata(&destination)
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;
    
    let size = metadata.len();

    // Record backup in database
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;
    
    let backup_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO backups (id, filename, created_at, size, status) VALUES (?, ?, ?, ?, 'success')",
        rusqlite::params![&backup_id, &filename, &now, size],
    ).map_err(|e| format!("Failed to record backup: {}", e))?;

    Ok(BackupRecord {
        id: backup_id,
        filename,
        created_at: now,
        size: size as i64,
        status: "success".to_string(),
    })
}

#[command]
pub async fn create_backup_zip(backup_path: String) -> Result<BackupRecord, String> {
    let db_path = "BelleBeaute.db";
    
    if !Path::new(db_path).exists() {
        return Err("Database not found".to_string());
    }

    fs::create_dir_all(&backup_path)
        .map_err(|e| format!("Failed to create backup directory: {}", e))?;

    let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("BelleBeaute_backup_{}.zip", timestamp);
    let destination = Path::new(&backup_path).join(&filename);

    let file = fs::File::create(&destination)
        .map_err(|e| format!("Failed to create zip file: {}", e))?;
    
    let mut zip = ZipWriter::new(file);
    
    let options = zip::write::FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);
    
    zip.start_file("BelleBeaute.db", options)
        .map_err(|e| format!("Failed to add file to zip: {}", e))?;
    
    let db_content = fs::read(db_path)
        .map_err(|e| format!("Failed to read database: {}", e))?;
    
    use std::io::Write;
    zip.write_all(&db_content)
        .map_err(|e| format!("Failed to write to zip: {}", e))?;
    
    zip.finish()
        .map_err(|e| format!("Failed to finalize zip: {}", e))?;

    let metadata = fs::metadata(&destination)
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;
    
    let size = metadata.len();

    // Record backup in database
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;
    
    let backup_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO backups (id, filename, created_at, size, status) VALUES (?, ?, ?, ?, 'success')",
        rusqlite::params![&backup_id, &filename, &now, size],
    ).map_err(|e| format!("Failed to record backup: {}", e))?;

    Ok(BackupRecord {
        id: backup_id,
        filename,
        created_at: now,
        size: size as i64,
        status: "success".to_string(),
    })
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
            .map_err(|e| format!("Failed to create safety backup: {}", e))?;
    }

    // Restore the backup
    fs::copy(&backup_file, db_path)
        .map_err(|e| format!("Failed to restore backup: {}", e))?;

    Ok(true)
}

#[command]
pub async fn list_backups(backup_path: String) -> Result<Vec<BackupRecord>, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let mut stmt = conn.prepare(
        "SELECT id, filename, created_at, size, status FROM backups ORDER BY created_at DESC LIMIT 100"
    ).map_err(|e| format!("Query error: {}", e))?;

    let backups = stmt.query_map([], |row| {
        Ok(BackupRecord {
            id: row.get(0)?,
            filename: row.get(1)?,
            created_at: row.get(2)?,
            size: row.get(3)?,
            status: row.get(4)?,
        })
    }).map_err(|e| format!("Query error: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Collection error: {}", e))?;

    Ok(backups)
}

#[command]
pub async fn delete_backup(backup_id: String, filename: String, backup_path: String) -> Result<bool, String> {
    let file_path = Path::new(&backup_path).join(&filename);
    
    if file_path.exists() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("Failed to delete backup file: {}", e))?;
    }

    // Remove from database
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    conn.execute(
        "DELETE FROM backups WHERE id = ?",
        [&backup_id],
    ).map_err(|e| format!("Failed to delete backup record: {}", e))?;

    Ok(true)
}

#[command]
pub async fn setup_auto_backup(enabled: bool) -> Result<bool, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let now = Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('auto_backup_enabled', ?, ?)",
        rusqlite::params![if enabled { "true" } else { "false" }, &now],
    ).map_err(|e| format!("Failed to update setting: {}", e))?;

    Ok(true)
}

#[command]
pub async fn get_auto_backup_enabled() -> Result<bool, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let enabled = conn.query_row(
        "SELECT value FROM settings WHERE key = 'auto_backup_enabled'",
        [],
        |row| {
            let value: String = row.get(0)?;
            Ok(value == "true")
        },
    ).unwrap_or(false);

    Ok(enabled)
}
