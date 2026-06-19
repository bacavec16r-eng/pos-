use tauri::command;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use rusqlite::Connection;
use crate::utils::validation;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Product {
    pub id: String,
    pub name: String,
    pub sku: String,
    pub barcode: Option<String>,
    pub category_id: String,
    pub price: f64,
    pub cost_price: f64,
    pub quantity: i32,
    pub unit: String,
    pub description: Option<String>,
    pub image_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub is_active: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateProductRequest {
    pub name: String,
    pub sku: String,
    pub barcode: Option<String>,
    pub category_id: String,
    pub price: f64,
    pub cost_price: f64,
    pub quantity: i32,
    pub unit: String,
    pub description: Option<String>,
}

#[command]
pub async fn get_products(search: Option<String>, category_id: Option<String>) -> Result<Vec<Product>, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let query = if let Some(category) = category_id {
        format!(
            "SELECT id, name, sku, barcode, category_id, price, cost_price, quantity, unit, description, image_url, created_at, updated_at, is_active 
             FROM products WHERE category_id = ? AND is_active = 1 ORDER BY name ASC"
        )
    } else if let Some(term) = search {
        format!(
            "SELECT id, name, sku, barcode, category_id, price, cost_price, quantity, unit, description, image_url, created_at, updated_at, is_active 
             FROM products WHERE (name LIKE ? OR sku LIKE ? OR barcode LIKE ?) AND is_active = 1 ORDER BY name ASC"
        )
    } else {
        "SELECT id, name, sku, barcode, category_id, price, cost_price, quantity, unit, description, image_url, created_at, updated_at, is_active 
         FROM products WHERE is_active = 1 ORDER BY name ASC".to_string()
    };

    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Query error: {}", e))?;

    let products = if let Some(_category) = category_id {
        stmt.query_map([&_category], |row| parse_product_row(row))
    } else if let Some(term) = search {
        let search_term = format!("%{}%", term);
        stmt.query_map(rusqlite::params![&search_term, &search_term, &search_term], |row| parse_product_row(row))
    } else {
        stmt.query_map([], |row| parse_product_row(row))
    }
    .map_err(|e| format!("Query error: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Collection error: {}", e))?;

    Ok(products)
}

#[command]
pub async fn get_product_by_barcode(barcode: String) -> Result<Product, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let product = conn.query_row(
        "SELECT id, name, sku, barcode, category_id, price, cost_price, quantity, unit, description, image_url, created_at, updated_at, is_active 
         FROM products WHERE barcode = ? AND is_active = 1",
        [&barcode],
        |row| parse_product_row(row),
    ).map_err(|_| "Product not found".to_string())?;

    Ok(product)
}

#[command]
pub async fn create_product(request: CreateProductRequest) -> Result<Product, String> {
    // Validate inputs
    if !validation::validate_sku(&request.sku) {
        return Err("Invalid SKU".to_string());
    }

    if !validation::validate_price(request.price) {
        return Err("Invalid price".to_string());
    }

    if !validation::validate_quantity(request.quantity) {
        return Err("Invalid quantity".to_string());
    }

    if let Some(ref barcode) = request.barcode {
        if !validation::validate_barcode(barcode) {
            return Err("Invalid barcode".to_string());
        }
    }

    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO products (id, name, sku, barcode, category_id, price, cost_price, quantity, unit, description, image_url, created_at, updated_at, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, 1)",
        rusqlite::params![
            &id, &request.name, &request.sku, &request.barcode, &request.category_id,
            request.price, request.cost_price, request.quantity, &request.unit,
            &request.description, &now, &now
        ],
    ).map_err(|e| format!("Failed to create product: {}", e))?;

    Ok(Product {
        id,
        name: request.name,
        sku: request.sku,
        barcode: request.barcode,
        category_id: request.category_id,
        price: request.price,
        cost_price: request.cost_price,
        quantity: request.quantity,
        unit: request.unit,
        description: request.description,
        image_url: None,
        created_at: now.clone(),
        updated_at: now,
        is_active: true,
    })
}

#[command]
pub async fn update_product(id: String, request: CreateProductRequest) -> Result<Product, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE products SET name = ?, sku = ?, barcode = ?, category_id = ?, price = ?, cost_price = ?, quantity = ?, unit = ?, description = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![
            &request.name, &request.sku, &request.barcode, &request.category_id,
            request.price, request.cost_price, request.quantity, &request.unit,
            &request.description, &now, &id
        ],
    ).map_err(|e| format!("Failed to update product: {}", e))?;

    let product = conn.query_row(
        "SELECT id, name, sku, barcode, category_id, price, cost_price, quantity, unit, description, image_url, created_at, updated_at, is_active FROM products WHERE id = ?",
        [&id],
        |row| parse_product_row(row),
    ).map_err(|_| "Product not found".to_string())?;

    Ok(product)
}

#[command]
pub async fn delete_product(id: String) -> Result<bool, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE products SET is_active = 0, updated_at = ? WHERE id = ?",
        rusqlite::params![&now, &id],
    ).map_err(|e| format!("Failed to delete product: {}", e))?;

    Ok(true)
}

#[command]
pub async fn update_product_quantity(product_id: String, quantity: i32) -> Result<bool, String> {
    if !validation::validate_quantity(quantity) {
        return Err("Invalid quantity".to_string());
    }

    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE products SET quantity = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![quantity, &now, &product_id],
    ).map_err(|e| format!("Failed to update quantity: {}", e))?;

    Ok(true)
}

fn parse_product_row(row: &rusqlite::Row) -> rusqlite::Result<Product> {
    Ok(Product {
        id: row.get(0)?,
        name: row.get(1)?,
        sku: row.get(2)?,
        barcode: row.get(3)?,
        category_id: row.get(4)?,
        price: row.get(5)?,
        cost_price: row.get(6)?,
        quantity: row.get(7)?,
        unit: row.get(8)?,
        description: row.get(9)?,
        image_url: row.get(10)?,
        created_at: row.get(11)?,
        updated_at: row.get(12)?,
        is_active: row.get::<_, i32>(13)? == 1,
    })
}
