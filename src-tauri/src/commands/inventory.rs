use tauri::command;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use rusqlite::Connection;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Inventory {
    pub id: String,
    pub product_id: String,
    pub quantity: i32,
    pub warehouse: String,
    pub created_at: String,
    pub updated_at: String,
}

#[command]
pub async fn get_inventory(warehouse: Option<String>) -> Result<Vec<Inventory>, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let query = if warehouse.is_some() {
        "SELECT id, product_id, quantity, warehouse, created_at, updated_at FROM inventory WHERE warehouse = ? ORDER BY created_at DESC"
    } else {
        "SELECT id, product_id, quantity, warehouse, created_at, updated_at FROM inventory ORDER BY created_at DESC"
    };

    let mut stmt = conn.prepare(query)
        .map_err(|e| format!("Query error: {}", e))?;

    let inventory = if let Some(wh) = warehouse {
        stmt.query_map([&wh], |row| parse_inventory_row(row))
    } else {
        stmt.query_map([], |row| parse_inventory_row(row))
    }
    .map_err(|e| format!("Query error: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Collection error: {}", e))?;

    Ok(inventory)
}

#[command]
pub async fn adjust_inventory(product_id: String, quantity_change: i32, warehouse: String, notes: Option<String>) -> Result<bool, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    // Add or update inventory record
    conn.execute(
        "INSERT INTO inventory (id, product_id, quantity, warehouse, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET quantity = quantity + ?, updated_at = ?",
        rusqlite::params![
            &id, &product_id, quantity_change, &warehouse, &now, &now,
            quantity_change, &now
        ],
    ).map_err(|e| format!("Failed to adjust inventory: {}", e))?;

    Ok(true)
}

#[command]
pub async fn transfer_stock(product_id: String, from_warehouse: String, to_warehouse: String, quantity: i32) -> Result<bool, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let now = Utc::now().to_rfc3339();

    // Reduce from source warehouse
    conn.execute(
        "UPDATE inventory SET quantity = quantity - ?, updated_at = ? WHERE product_id = ? AND warehouse = ?",
        rusqlite::params![quantity, &now, &product_id, &from_warehouse],
    ).map_err(|e| format!("Failed to reduce inventory: {}", e))?;

    // Increase to destination warehouse
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO inventory (id, product_id, quantity, warehouse, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)",
        rusqlite::params![&id, &product_id, quantity, &to_warehouse, &now, &now],
    ).map_err(|e| format!("Failed to add to inventory: {}", e))?;

    Ok(true)
}

fn parse_inventory_row(row: &rusqlite::Row) -> rusqlite::Result<Inventory> {
    Ok(Inventory {
        id: row.get(0)?,
        product_id: row.get(1)?,
        quantity: row.get(2)?,
        warehouse: row.get(3)?,
        created_at: row.get(4)?,
        updated_at: row.get(5)?,
    })
}
