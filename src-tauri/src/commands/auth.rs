use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub id: String,
    pub username: String,
    pub role: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[command]
pub async fn login(request: LoginRequest) -> Result<User, String> {
    // TODO: Implement authentication
    Err("Not implemented".to_string())
}
