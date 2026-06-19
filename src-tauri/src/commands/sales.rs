use tauri::command;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use rusqlite::Connection;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleItem {
    pub id: String,
    pub sale_id: String,
    pub product_id: String,
    pub quantity: i32,
    pub unit_price: f64,
    pub discount: f64,
    pub created_at: String,
}

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
    pub items: Option<Vec<SaleItem>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateSaleRequest {
    pub cashier_id: String,
    pub customer_id: Option<String>,
    pub items: Vec<SaleItemInput>,
    pub discount_amount: f64,
    pub tax_amount: f64,
    pub payment_method: String,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SaleItemInput {
    pub product_id: String,
    pub quantity: i32,
    pub unit_price: f64,
    pub discount: f64,
}

#[command]
pub async fn create_sale(request: CreateSaleRequest) -> Result<Sale, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let sale_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    // Begin transaction
    conn.execute("BEGIN TRANSACTION", [])
        .map_err(|e| format!("Transaction error: {}", e))?;

    // Create sale
    conn.execute(
        "INSERT INTO sales (id, cashier_id, customer_id, total_amount, discount_amount, tax_amount, payment_method, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params![
            &sale_id, &request.cashier_id, &request.customer_id, 0.0,
            request.discount_amount, request.tax_amount, &request.payment_method, &request.notes, &now
        ],
    ).map_err(|e| format!("Failed to create sale: {}", e))?;

    let mut total = 0.0;
    let mut items = Vec::new();

    // Add sale items and update product quantities
    for item in request.items {
        let item_id = Uuid::new_v4().to_string();
        let item_total = (item.unit_price * item.quantity as f64) - item.discount;
        total += item_total;

        conn.execute(
            "INSERT INTO sales_items (id, sale_id, product_id, quantity, unit_price, discount, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![
                &item_id, &sale_id, &item.product_id, item.quantity,
                item.unit_price, item.discount, &now
            ],
        ).map_err(|e| format!("Failed to add item: {}", e))?;

        // Update product quantity
        conn.execute(
            "UPDATE products SET quantity = quantity - ?, updated_at = ? WHERE id = ?",
            rusqlite::params![item.quantity, &now, &item.product_id],
        ).map_err(|e| format!("Failed to update inventory: {}", e))?;

        items.push(SaleItem {
            id: item_id,
            sale_id: sale_id.clone(),
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount,
            created_at: now.clone(),
        });
    }

    // Update total amount
    let final_total = total - request.discount_amount + request.tax_amount;
    conn.execute(
        "UPDATE sales SET total_amount = ? WHERE id = ?",
        rusqlite::params![final_total, &sale_id],
    ).map_err(|e| format!("Failed to update total: {}", e))?;

    // Update customer total spent and loyalty points
    if let Some(ref customer_id) = request.customer_id {
        conn.execute(
            "UPDATE customers SET total_spent = total_spent + ?, loyalty_points = loyalty_points + ? WHERE id = ?",
            rusqlite::params![final_total, (final_total / 10.0) as i32, customer_id],
        ).map_err(|e| format!("Failed to update customer: {}", e))?;
    }

    // Commit transaction
    conn.execute("COMMIT", [])
        .map_err(|e| format!("Commit error: {}", e))?;

    Ok(Sale {
        id: sale_id,
        cashier_id: request.cashier_id,
        customer_id: request.customer_id,
        total_amount: final_total,
        discount_amount: request.discount_amount,
        tax_amount: request.tax_amount,
        payment_method: request.payment_method,
        notes: request.notes,
        created_at: now,
        items: Some(items),
    })
}

#[command]
pub async fn get_sale(sale_id: String) -> Result<Sale, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let sale = conn.query_row(
        "SELECT id, cashier_id, customer_id, total_amount, discount_amount, tax_amount, payment_method, notes, created_at FROM sales WHERE id = ?",
        [&sale_id],
        |row| {
            Ok(Sale {
                id: row.get(0)?,
                cashier_id: row.get(1)?,
                customer_id: row.get(2)?,
                total_amount: row.get(3)?,
                discount_amount: row.get(4)?,
                tax_amount: row.get(5)?,
                payment_method: row.get(6)?,
                notes: row.get(7)?,
                created_at: row.get(8)?,
                items: None,
            })
        },
    ).map_err(|_| "Sale not found".to_string())?;

    Ok(sale)
}

#[command]
pub async fn get_sales(date_from: Option<String>, date_to: Option<String>) -> Result<Vec<Sale>, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let mut stmt = if let (Some(from), Some(to)) = (date_from, date_to) {
        conn.prepare(
            "SELECT id, cashier_id, customer_id, total_amount, discount_amount, tax_amount, payment_method, notes, created_at 
             FROM sales WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC"
        ).map_err(|e| format!("Query error: {}", e))?
    } else {
        conn.prepare(
            "SELECT id, cashier_id, customer_id, total_amount, discount_amount, tax_amount, payment_method, notes, created_at 
             FROM sales ORDER BY created_at DESC LIMIT 100"
        ).map_err(|e| format!("Query error: {}", e))?
    };

    let sales = if let (Some(from), Some(to)) = (date_from.clone(), date_to.clone()) {
        stmt.query_map(rusqlite::params![&from, &to], |row| parse_sale_row(row))
    } else {
        stmt.query_map([], |row| parse_sale_row(row))
    }
    .map_err(|e| format!("Query error: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Collection error: {}", e))?;

    Ok(sales)
}

fn parse_sale_row(row: &rusqlite::Row) -> rusqlite::Result<Sale> {
    Ok(Sale {
        id: row.get(0)?,
        cashier_id: row.get(1)?,
        customer_id: row.get(2)?,
        total_amount: row.get(3)?,
        discount_amount: row.get(4)?,
        tax_amount: row.get(5)?,
        payment_method: row.get(6)?,
        notes: row.get(7)?,
        created_at: row.get(8)?,
        items: None,
    })
}
