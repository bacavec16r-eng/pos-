use tauri::command;
use serde::{Deserialize, Serialize};
use rusqlite::Connection;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DailySalesReport {
    pub date: String,
    pub total_sales: f64,
    pub total_items: i32,
    pub total_discount: f64,
    pub total_tax: f64,
    pub transactions_count: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MonthlySalesReport {
    pub month: String,
    pub total_sales: f64,
    pub total_items: i32,
    pub total_discount: f64,
    pub total_tax: f64,
    pub transactions_count: i32,
    pub avg_transaction: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CategoryReport {
    pub category: String,
    pub total_sold: i32,
    pub revenue: f64,
    pub profit: f64,
}

#[command]
pub async fn get_daily_report(date: String) -> Result<DailySalesReport, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let date_prefix = date.split('T').next().unwrap_or(&date);

    let report = conn.query_row(
        "SELECT 
            COUNT(*) as transactions,
            COALESCE(SUM(total_amount), 0) as total_sales,
            COALESCE(SUM(si.quantity), 0) as total_items,
            COALESCE(SUM(discount_amount), 0) as total_discount,
            COALESCE(SUM(tax_amount), 0) as total_tax
         FROM sales s
         LEFT JOIN sales_items si ON s.id = si.sale_id
         WHERE DATE(s.created_at) = ?",
        [date_prefix],
        |row| {
            Ok(DailySalesReport {
                date: date_prefix.to_string(),
                total_sales: row.get(1)?,
                total_items: row.get(2)?,
                total_discount: row.get(3)?,
                total_tax: row.get(4)?,
                transactions_count: row.get(0)?,
            })
        },
    ).unwrap_or_else(|_| DailySalesReport {
        date: date_prefix.to_string(),
        total_sales: 0.0,
        total_items: 0,
        total_discount: 0.0,
        total_tax: 0.0,
        transactions_count: 0,
    });

    Ok(report)
}

#[command]
pub async fn get_monthly_report(month: String) -> Result<MonthlySalesReport, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let month_prefix = format!("{}%", month); // Format: YYYY-MM

    let report = conn.query_row(
        "SELECT 
            COUNT(*) as transactions,
            COALESCE(SUM(total_amount), 0) as total_sales,
            COALESCE(SUM(si.quantity), 0) as total_items,
            COALESCE(SUM(discount_amount), 0) as total_discount,
            COALESCE(SUM(tax_amount), 0) as total_tax
         FROM sales s
         LEFT JOIN sales_items si ON s.id = si.sale_id
         WHERE s.created_at LIKE ?",
        [&month_prefix],
        |row| {
            let transactions: i32 = row.get(0)?;
            let total_sales: f64 = row.get(1)?;
            Ok(MonthlySalesReport {
                month: month.clone(),
                total_sales,
                total_items: row.get(2)?,
                total_discount: row.get(3)?,
                total_tax: row.get(4)?,
                transactions_count: transactions,
                avg_transaction: if transactions > 0 { total_sales / transactions as f64 } else { 0.0 },
            })
        },
    ).unwrap_or_else(|_| MonthlySalesReport {
        month,
        total_sales: 0.0,
        total_items: 0,
        total_discount: 0.0,
        total_tax: 0.0,
        transactions_count: 0,
        avg_transaction: 0.0,
    });

    Ok(report)
}

#[command]
pub async fn get_category_report() -> Result<Vec<CategoryReport>, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let mut stmt = conn.prepare(
        "SELECT c.name, COALESCE(SUM(si.quantity), 0) as total_sold, COALESCE(SUM(si.unit_price * si.quantity), 0) as revenue,
                COALESCE(SUM((si.unit_price - p.cost_price) * si.quantity), 0) as profit
         FROM categories c
         LEFT JOIN products p ON c.id = p.category_id
         LEFT JOIN sales_items si ON p.id = si.product_id
         GROUP BY c.id, c.name
         ORDER BY revenue DESC"
    ).map_err(|e| format!("Query error: {}", e))?;

    let reports = stmt.query_map([], |row| {
        Ok(CategoryReport {
            category: row.get(0)?,
            total_sold: row.get(1)?,
            revenue: row.get(2)?,
            profit: row.get(3)?,
        })
    }).map_err(|e| format!("Query error: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Collection error: {}", e))?;

    Ok(reports)
}

#[command]
pub async fn get_top_products(limit: i32) -> Result<Vec<serde_json::Value>, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let mut stmt = conn.prepare(
        "SELECT p.id, p.name, SUM(si.quantity) as total_sold, SUM(si.unit_price * si.quantity) as revenue
         FROM products p
         JOIN sales_items si ON p.id = si.product_id
         GROUP BY p.id, p.name
         ORDER BY total_sold DESC
         LIMIT ?"
    ).map_err(|e| format!("Query error: {}", e))?;

    let products = stmt.query_map([limit], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "name": row.get::<_, String>(1)?,
            "total_sold": row.get::<_, i32>(2)?,
            "revenue": row.get::<_, f64>(3)?,
        }))
    }).map_err(|e| format!("Query error: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Collection error: {}", e))?;

    Ok(products)
}
