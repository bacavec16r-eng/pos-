mod db;
mod commands;
mod utils;
mod scheduler;

use std::sync::Mutex;
use tauri::State;
use db::Database;

struct AppState {
    db: Mutex<Option<Database>>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
async fn init_database(state: State<'_, AppState>) -> Result<bool, String> {
    let db = Database::new("BelleBeaute.db")
        .map_err(|e| e.to_string())?;
    
    db.init().map_err(|e| e.to_string())?;
    
    let mut app_state = state.db.lock().unwrap();
    *app_state = Some(db);
    
    // Setup auto backup
    scheduler::setup_auto_backup().await;
    
    Ok(true)
}

#[tauri::command]
async fn check_database() -> Result<bool, String> {
    Ok(std::path::Path::new("BelleBeaute.db").exists())
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            init_database,
            check_database,
            // Auth commands
            commands::auth::login,
            commands::auth::register,
            commands::auth::change_password,
            commands::auth::get_user,
            commands::auth::list_users,
            commands::auth::deactivate_user,
            // Products commands
            commands::products::get_products,
            commands::products::get_product_by_barcode,
            commands::products::create_product,
            commands::products::update_product,
            commands::products::delete_product,
            commands::products::update_product_quantity,
            // Sales commands
            commands::sales::create_sale,
            commands::sales::get_sale,
            commands::sales::get_sales,
            // Inventory commands
            commands::inventory::get_inventory,
            commands::inventory::adjust_inventory,
            commands::inventory::transfer_stock,
            // Customers commands
            commands::customers::create_customer,
            commands::customers::get_customer,
            commands::customers::get_customers,
            commands::customers::add_customer_debt,
            commands::customers::get_customer_debts,
            commands::customers::pay_customer_debt,
            // Reports commands
            commands::reports::get_daily_report,
            commands::reports::get_monthly_report,
            commands::reports::get_category_report,
            commands::reports::get_top_products,
            // Backup commands
            commands::backup::create_backup,
            commands::backup::create_backup_zip,
            commands::backup::restore_backup,
            commands::backup::list_backups,
            commands::backup::delete_backup,
            commands::backup::setup_auto_backup,
            commands::backup::get_auto_backup_enabled,
            // Receipt commands
            commands::receipt::get_receipt,
            commands::receipt::print_receipt,
            commands::receipt::export_receipt_pdf,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
