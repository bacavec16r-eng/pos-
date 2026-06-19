use rusqlite::{Connection, Result as SqlResult, params};
use chrono::Utc;
use uuid::Uuid;

pub struct Database {
    path: String,
}

impl Database {
    pub fn new(path: &str) -> SqlResult<Self> {
        Ok(Database {
            path: path.to_string(),
        })
    }

    pub fn init(&self) -> SqlResult<()> {
        let conn = Connection::open(&self.path)?;

        // Enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON", [])?;

        // Users/Auth
        conn.execute(
            "CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1
            )",
            [],
        )?;

        // Products
        conn.execute(
            "CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                sku TEXT UNIQUE NOT NULL,
                barcode TEXT UNIQUE,
                category_id TEXT NOT NULL,
                price REAL NOT NULL,
                cost_price REAL NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0,
                unit TEXT NOT NULL DEFAULT 'piece',
                description TEXT,
                image_url TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )",
            [],
        )?;

        // Categories
        conn.execute(
            "CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        // Inventory
        conn.execute(
            "CREATE TABLE IF NOT EXISTS inventory (
                id TEXT PRIMARY KEY,
                product_id TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                warehouse TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )",
            [],
        )?;

        // Sales
        conn.execute(
            "CREATE TABLE IF NOT EXISTS sales (
                id TEXT PRIMARY KEY,
                cashier_id TEXT NOT NULL,
                customer_id TEXT,
                total_amount REAL NOT NULL,
                discount_amount REAL NOT NULL DEFAULT 0,
                tax_amount REAL NOT NULL DEFAULT 0,
                payment_method TEXT NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (cashier_id) REFERENCES users(id),
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )",
            [],
        )?;

        // Sales Items
        conn.execute(
            "CREATE TABLE IF NOT EXISTS sales_items (
                id TEXT PRIMARY KEY,
                sale_id TEXT NOT NULL,
                product_id TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                discount REAL NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (sale_id) REFERENCES sales(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )",
            [],
        )?;

        // Customers
        conn.execute(
            "CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                address TEXT,
                loyalty_points INTEGER NOT NULL DEFAULT 0,
                total_spent REAL NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        // Customer Debts
        conn.execute(
            "CREATE TABLE IF NOT EXISTS customer_debts (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                amount REAL NOT NULL,
                paid_amount REAL NOT NULL DEFAULT 0,
                due_date TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )",
            [],
        )?;

        // Suppliers
        conn.execute(
            "CREATE TABLE IF NOT EXISTS suppliers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                address TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        // Settings
        conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        // Backup records
        conn.execute(
            "CREATE TABLE IF NOT EXISTS backups (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                created_at TEXT NOT NULL,
                size INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'success'
            )",
            [],
        )?;

        // Create indexes for better performance
        conn.execute("CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sales_cashier ON sales(cashier_id)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sales_items_sale ON sales_items(sale_id)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_customer_debts_customer ON customer_debts(customer_id)", [])?;

        Ok(())
    }

    pub fn get_connection(&self) -> SqlResult<Connection> {
        Connection::open(&self.path)
    }
}
