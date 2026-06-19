use tauri::command;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use rusqlite::Connection;
use crate::utils::crypto;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub id: String,
    pub username: String,
    pub role: String,
    #[serde(skip_serializing)]
    pub password_hash: Option<String>,
    pub created_at: String,
    pub is_active: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RegisterRequest {
    pub username: String,
    pub password: String,
    pub role: String, // "admin", "manager", "cashier"
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AuthResponse {
    pub user: User,
    pub token: String,
}

#[command]
pub async fn login(request: LoginRequest) -> Result<AuthResponse, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash, role, created_at, is_active 
         FROM users WHERE username = ? AND is_active = 1"
    ).map_err(|e| format!("Query error: {}", e))?;

    let user = stmt.query_row([&request.username], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, i32>(5)?,
        ))
    }).map_err(|_| "Invalid username or password".to_string())?;

    // Verify password
    if !crypto::verify_password(&request.password, &user.2) {
        return Err("Invalid username or password".to_string());
    }

    let user_obj = User {
        id: user.0,
        username: user.1,
        password_hash: None,
        role: user.3,
        created_at: user.4,
        is_active: user.5 == 1,
    };

    // Generate simple JWT token (in production, use proper JWT library)
    let token = format!("token_{}", Uuid::new_v4());

    Ok(AuthResponse {
        user: user_obj,
        token,
    })
}

#[command]
pub async fn register(request: RegisterRequest) -> Result<User, String> {
    // Validate role
    if !["admin", "manager", "cashier"].contains(&request.role.as_str()) {
        return Err("Invalid role".to_string());
    }

    if request.username.len() < 3 {
        return Err("Username must be at least 3 characters".to_string());
    }

    if request.password.len() < 6 {
        return Err("Password must be at least 6 characters".to_string());
    }

    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let password_hash = crypto::hash_password(&request.password);

    conn.execute(
        "INSERT INTO users (id, username, password_hash, role, created_at, updated_at, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)",
        rusqlite::params![&id, &request.username, &password_hash, &request.role, &now, &now],
    ).map_err(|e| format!("Failed to create user: {}", e))?;

    Ok(User {
        id,
        username: request.username,
        password_hash: None,
        role: request.role,
        created_at: now,
        is_active: true,
    })
}

#[command]
pub async fn change_password(user_id: String, old_password: String, new_password: String) -> Result<bool, String> {
    if new_password.len() < 6 {
        return Err("Password must be at least 6 characters".to_string());
    }

    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    // Verify old password
    let password_hash: String = conn.query_row(
        "SELECT password_hash FROM users WHERE id = ?",
        [&user_id],
        |row| row.get(0),
    ).map_err(|_| "User not found".to_string())?;

    if !crypto::verify_password(&old_password, &password_hash) {
        return Err("Old password is incorrect".to_string());
    }

    let new_hash = crypto::hash_password(&new_password);
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![&new_hash, &now, &user_id],
    ).map_err(|e| format!("Failed to update password: {}", e))?;

    Ok(true)
}

#[command]
pub async fn get_user(user_id: String) -> Result<User, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let user = conn.query_row(
        "SELECT id, username, role, created_at, is_active FROM users WHERE id = ?",
        [&user_id],
        |row| {
            Ok(User {
                id: row.get(0)?,
                username: row.get(1)?,
                role: row.get(2)?,
                password_hash: None,
                created_at: row.get(3)?,
                is_active: row.get::<_, i32>(4)? == 1,
            })
        },
    ).map_err(|_| "User not found".to_string())?;

    Ok(user)
}

#[command]
pub async fn list_users() -> Result<Vec<User>, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let mut stmt = conn.prepare(
        "SELECT id, username, role, created_at, is_active FROM users ORDER BY created_at DESC"
    ).map_err(|e| format!("Query error: {}", e))?;

    let users = stmt.query_map([], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            role: row.get(2)?,
            password_hash: None,
            created_at: row.get(3)?,
            is_active: row.get::<_, i32>(4)? == 1,
        })
    }).map_err(|e| format!("Query error: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Collection error: {}", e))?;

    Ok(users)
}

#[command]
pub async fn deactivate_user(user_id: String) -> Result<bool, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?",
        rusqlite::params![&now, &user_id],
    ).map_err(|e| format!("Failed to deactivate user: {}", e))?;

    Ok(true)
}
