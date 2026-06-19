use tauri::command;
use serde::{Deserialize, Serialize};

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

#[command]
pub async fn get_products() -> Result<Vec<Product>, String> {
    // TODO: Implement database query
    Ok(vec![])
}

#[command]
pub async fn add_product(product: Product) -> Result<Product, String> {
    // TODO: Implement database insert
    Ok(product)
}
