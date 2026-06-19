use tauri::command;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use rusqlite::Connection;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Customer {
    pub id: String,
    pub name: String,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub loyalty_points: i32,
    pub total_spent: f64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CustomerDebt {
    pub id: String,
    pub customer_id: String,
    pub amount: f64,
    pub paid_amount: f64,
    pub due_date: Option<String>,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateCustomerRequest {
    pub name: String,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
}

#[command]
pub async fn create_customer(request: CreateCustomerRequest) -> Result<Customer, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO customers (id, name, phone, email, address, loyalty_points, total_spent, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)",
        rusqlite::params![&id, &request.name, &request.phone, &request.email, &request.address, &now, &now],
    ).map_err(|e| format!("Failed to create customer: {}", e))?;

    Ok(Customer {
        id,
        name: request.name,
        phone: request.phone,
        email: request.email,
        address: request.address,
        loyalty_points: 0,
        total_spent: 0.0,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[command]
pub async fn get_customer(customer_id: String) -> Result<Customer, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let customer = conn.query_row(
        "SELECT id, name, phone, email, address, loyalty_points, total_spent, created_at, updated_at FROM customers WHERE id = ?",
        [&customer_id],
        |row| parse_customer_row(row),
    ).map_err(|_| "Customer not found".to_string())?;

    Ok(customer)
}

#[command]
pub async fn get_customers(search: Option<String>) -> Result<Vec<Customer>, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let query = if search.is_some() {
        "SELECT id, name, phone, email, address, loyalty_points, total_spent, created_at, updated_at FROM customers WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? ORDER BY name ASC"
    } else {
        "SELECT id, name, phone, email, address, loyalty_points, total_spent, created_at, updated_at FROM customers ORDER BY name ASC"
    };

    let mut stmt = conn.prepare(query)
        .map_err(|e| format!("Query error: {}", e))?;

    let customers = if let Some(term) = search {
        let search_term = format!("%{}%", term);
        stmt.query_map(rusqlite::params![&search_term, &search_term, &search_term], |row| parse_customer_row(row))
    } else {
        stmt.query_map([], |row| parse_customer_row(row))
    }
    .map_err(|e| format!("Query error: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Collection error: {}", e))?;

    Ok(customers)
}

#[command]
pub async fn add_customer_debt(customer_id: String, amount: f64, due_date: Option<String>) -> Result<CustomerDebt, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO customer_debts (id, customer_id, amount, paid_amount, due_date, status, created_at, updated_at)
         VALUES (?, ?, ?, 0, ?, 'pending', ?, ?)",
        rusqlite::params![&id, &customer_id, amount, &due_date, &now, &now],
    ).map_err(|e| format!("Failed to add debt: {}", e))?;

    Ok(CustomerDebt {
        id,
        customer_id,
        amount,
        paid_amount: 0.0,
        due_date,
        status: "pending".to_string(),
        created_at: now.clone(),
        updated_at: now,
    })
}

#[command]
pub async fn get_customer_debts(customer_id: String) -> Result<Vec<CustomerDebt>, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let mut stmt = conn.prepare(
        "SELECT id, customer_id, amount, paid_amount, due_date, status, created_at, updated_at FROM customer_debts WHERE customer_id = ? ORDER BY created_at DESC"
    ).map_err(|e| format!("Query error: {}", e))?;

    let debts = stmt.query_map([&customer_id], |row| parse_debt_row(row))
        .map_err(|e| format!("Query error: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Collection error: {}", e))?;

    Ok(debts)
}

#[command]
pub async fn pay_customer_debt(debt_id: String, amount: f64) -> Result<CustomerDebt, String> {
    let conn = Connection::open("BelleBeaute.db")
        .map_err(|e| format!("Database error: {}", e))?;

    let now = Utc::now().to_rfc3339();

    // Get current debt
    let (current_paid, total_debt): (f64, f64) = conn.query_row(
        "SELECT paid_amount, amount FROM customer_debts WHERE id = ?",
        [&debt_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).map_err(|_| "Debt not found".to_string())?;

    let new_paid = current_paid + amount;
    let status = if new_paid >= total_debt { "paid" } else { "partial" };

    conn.execute(
        "UPDATE customer_debts SET paid_amount = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_paid, status, &now, &debt_id],
    ).map_err(|e| format!("Failed to update debt: {}", e))?;

    let debt = conn.query_row(
        "SELECT id, customer_id, amount, paid_amount, due_date, status, created_at, updated_at FROM customer_debts WHERE id = ?",
        [&debt_id],
        |row| parse_debt_row(row),
    ).map_err(|_| "Debt not found".to_string())?;

    Ok(debt)
}

fn parse_customer_row(row: &rusqlite::Row) -> rusqlite::Result<Customer> {
    Ok(Customer {
        id: row.get(0)?,
        name: row.get(1)?,
        phone: row.get(2)?,
        email: row.get(3)?,
        address: row.get(4)?,
        loyalty_points: row.get(5)?,
        total_spent: row.get(6)?,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}

fn parse_debt_row(row: &rusqlite::Row) -> rusqlite::Result<CustomerDebt> {
    Ok(CustomerDebt {
        id: row.get(0)?,
        customer_id: row.get(1)?,
        amount: row.get(2)?,
        paid_amount: row.get(3)?,
        due_date: row.get(4)?,
        status: row.get(5)?,
        created_at: row.get(6)?,
        updated_at: row.get(7)?,
    })
}
