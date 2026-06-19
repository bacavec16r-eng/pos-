use tauri::command;
use serde::{Deserialize, Serialize};
use rusqlite::Connection;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Receipt {
    pub sale_id: String,
    pub store_name: String,
    pub cashier: String,
    pub date_time: String,
    pub items: Vec<ReceiptItem>,
    pub subtotal: f64,
    pub discount: f64,
    pub tax: f64,
    pub total: f64,
    pub payment_method: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ReceiptItem {
    pub name: String,
    pub quantity: i32,
    pub price: f64,
    pub total: f64,
}

#[command]
pub async fn get_receipt(sale_id: String) -> Result<Receipt, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    // Get sale info
    let sale_info: (String, String, String, f64, f64, f64) = conn.query_row(
        "SELECT s.id, u.username, s.created_at, s.total_amount, s.discount_amount, s.tax_amount FROM sales s JOIN users u ON s.cashier_id = u.id WHERE s.id = ?",
        [&sale_id],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?, row.get(5)?)),
    ).map_err(|_| "Sale not found".to_string())?;

    // Get store name
    let store_name: String = conn.query_row(
        "SELECT value FROM settings WHERE key = 'storeName'",
        [],
        |row| row.get(0),
    ).unwrap_or_else(|_| "Belle Beauté".to_string());

    // Get sale items
    let mut stmt = conn.prepare(
        "SELECT p.name, si.quantity, si.unit_price, (si.unit_price * si.quantity) - si.discount FROM sales_items si JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?"
    ).map_err(|e| format!("Query error: {}", e))?;

    let items = stmt.query_map([&sale_id], |row| {
        Ok(ReceiptItem {
            name: row.get(0)?,
            quantity: row.get(1)?,
            price: row.get(2)?,
            total: row.get(3)?,
        })
    }).map_err(|e| format!("Query error: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Collection error: {}", e))?;

    let subtotal = items.iter().map(|i| i.total).sum::<f64>() + sale_info.4;

    Ok(Receipt {
        sale_id: sale_info.0,
        store_name,
        cashier: sale_info.1,
        date_time: sale_info.2,
        items,
        subtotal,
        discount: sale_info.4,
        tax: sale_info.5,
        total: sale_info.3,
        payment_method: "Cash".to_string(),
    })
}

#[command]
pub async fn print_receipt(sale_id: String, printer_name: Option<String>) -> Result<bool, String> {
    // Get receipt data
    let receipt = get_receipt(sale_id).await?;

    // Generate receipt text
    let mut receipt_text = String::new();
    receipt_text.push_str(&format!("{}\n", receipt.store_name));
    receipt_text.push_str("================================\n");
    receipt_text.push_str(&format!("Date: {}\n", receipt.date_time));
    receipt_text.push_str(&format!("Cashier: {}\n", receipt.cashier));
    receipt_text.push_str("================================\n\n");

    for item in &receipt.items {
        receipt_text.push_str(&format!(
            "{:<20} {}x ${:>8.2} = ${:>8.2}\n",
            &item.name[..item.name.len().min(20)],
            item.quantity,
            item.price,
            item.total
        ));
    }

    receipt_text.push_str("\n================================\n");
    receipt_text.push_str(&format!("Subtotal:    ${:>8.2}\n", receipt.subtotal));
    receipt_text.push_str(&format!("Discount:    ${:>8.2}\n", receipt.discount));
    receipt_text.push_str(&format!("Tax:         ${:>8.2}\n", receipt.tax));
    receipt_text.push_str("================================\n");
    receipt_text.push_str(&format!("TOTAL:       ${:>8.2}\n", receipt.total));
    receipt_text.push_str(&format!("Payment:     {}\n", receipt.payment_method));
    receipt_text.push_str("================================\n");
    receipt_text.push_str("Thank you for your purchase!\n");
    receipt_text.push_str(&format!("Receipt ID: {}\n", receipt.sale_id));

    // TODO: Implement actual printer support
    // For now, save to file
    let filename = format!("receipt_{}.txt", receipt.sale_id);
    std::fs::write(&filename, &receipt_text)
        .map_err(|e| format!("Failed to save receipt: {}", e))?;

    Ok(true)
}

#[command]
pub async fn export_receipt_pdf(sale_id: String) -> Result<String, String> {
    let receipt = get_receipt(sale_id.clone()).await?;

    let filename = format!("receipt_{}.pdf", sale_id);
    
    // TODO: Implement PDF generation using pdf-lib or similar
    // For now, return filename
    Ok(filename)
}
