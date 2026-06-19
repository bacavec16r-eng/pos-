use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Sale {
    pub id: String,
    pub cashier_id: String,
    pub customer_id: Option<String>,
    pub total_amount: f64,
    pub discount_amount: f64,
    pub tax_amount: f64,
    pub payment_method: String,
    pub notes: Option<String>,
    pub created_at: String,
}

#[command]
pub async fn create_sale(sale: Sale) -> Result<Sale, String> {
    // TODO: Implement database insert
    Ok(sale)
}
