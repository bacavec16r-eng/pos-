pub fn validate_sku(sku: &str) -> bool {
    !sku.trim().is_empty() && sku.len() <= 50
}

pub fn validate_barcode(barcode: &str) -> bool {
    !barcode.trim().is_empty() && barcode.len() <= 100
}

pub fn validate_price(price: f64) -> bool {
    price >= 0.0
}

pub fn validate_quantity(quantity: i32) -> bool {
    quantity >= 0
}
