# Belle Beauté POS - Professional Desktop Application

A fully offline desktop point-of-sale and inventory management system for cosmetics stores built with **Tauri + React + TypeScript + SQLite**.

## Features

### Core POS System
- 💳 **Point of Sale**: Fast checkout with barcode scanning support
- 📦 **Inventory Management**: Track products and stock levels
- 👥 **Customer Management**: Manage customer profiles and loyalty programs
- 💰 **Debt Management**: Track customer debts and payment status
- 📊 **Reporting**: Daily, monthly, and annual sales reports
- 📝 **Invoicing**: Professional receipt printing

### Offline First
- ✅ 100% offline operation - no internet required after installation
- ✅ Local SQLite database for permanent data storage
- ✅ Automatic daily backups
- ✅ Manual backup/restore functionality

### Security & Access Control
- 👨‍💼 **Admin Account**: Full system access
- 📋 **Manager Account**: Reports, inventory, and product management
- 💼 **Cashier Account**: POS operations only

### Performance & Compatibility
- ⚡ Lightning-fast performance with 10,000+ products
- 🖥️ Windows 10 & 11 native support
- 🖨️ Thermal printer support (58mm, 80mm)
- 📄 Standard A4 printer support

### Export Features
- 📊 Export to PDF, Excel, and CSV
- 📈 Sales reports
- 📦 Inventory reports
- 💳 Customer debt reports

## System Requirements

### Windows
- Windows 10 or Windows 11
- 4GB RAM minimum (8GB recommended)
- 500MB disk space

## Installation

### From Installer
1. Download the latest `Belle-Beaute-POS-Setup.exe`
2. Run the installer
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

### Development Setup

```bash
# Install dependencies
npm install

# Run development version
npm run dev

# Build release version
npm run build:release
```

## Project Structure

```
├── src/                      # React frontend
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── src-tauri/              # Tauri backend
│   ├── src/
│   │   ├── main.rs         # Main entry point
│   │   ├── db/             # Database module
│   │   ├── commands/       # Tauri commands
│   │   └── utils/          # Utilities
│   └── Cargo.toml
├── public/                 # Static assets
└── index.html             # HTML entry point
```

## Database Schema

### Core Tables
- **users**: User accounts and authentication
- **products**: Product catalog
- **categories**: Product categories
- **inventory**: Stock tracking
- **sales**: Transaction records
- **sales_items**: Line items in sales
- **customers**: Customer profiles
- **customer_debts**: Debt tracking
- **suppliers**: Supplier information
- **settings**: Application settings
- **backups**: Backup records

## Getting Started

### 1. Initial Setup
After launching the application:
1. Create admin account with initial credentials
2. Configure store settings
3. Import or create product catalog

### 2. Demo Credentials
```
Username: admin
Password: password
```

### 3. First Sale
1. Go to POS module
2. Scan or search for products
3. Select customer (optional)
4. Complete payment
5. Print receipt

## API Documentation

### Backend Commands (Rust/Tauri)

#### Database
- `init_database()` - Initialize SQLite database
- `check_database()` - Verify database status

#### Authentication
- `login(username, password)` - Authenticate user

#### Products
- `get_products()` - Retrieve all products
- `add_product(product)` - Add new product

#### Sales
- `create_sale(sale)` - Record a sale

#### Backup
- `create_backup(backup_path)` - Create database backup
- `restore_backup(backup_file)` - Restore from backup

## Configuration

### Settings File
Settings are stored in the SQLite database under the `settings` table.

Key settings:
- `storeName`: Name of the store
- `storeAddress`: Store address
- `taxRate`: Tax percentage
- `currency`: Currency symbol
- `language`: UI language (en, ar, fr)

## Troubleshooting

### Database Initialization Failed
1. Check if `BelleBeaute.db` is accessible
2. Ensure write permissions in application directory
3. Try manually deleting database file and restart

### Barcode Scanner Not Working
1. Verify scanner is configured as keyboard wedge
2. Check scanner focus on search field
3. Ensure scanner is properly connected

### Printing Issues
1. Verify printer is connected and online
2. Check printer settings in Windows
3. Test with standard print dialog

## Backup & Recovery

### Automatic Backups
- Daily backup created at midnight
- Stored in application backups folder
- Last 30 days retained

### Manual Backup
1. Go to Settings → Backup
2. Click "Create Backup"
3. Choose backup location
4. File saved as `BelleBeaute_backup_YYYYMMDD_HHMMSS.db`

### Restore Backup
1. Go to Settings → Backup
2. Click "Restore Backup"
3. Select backup file
4. Confirm restoration (safety backup created)

## Performance Tips

### For Large Databases
- Keep inventory updated regularly
- Archive old sales records (future feature)
- Use reports for analysis instead of manual queries

### Printing Performance
- Pre-configure printer settings
- Use standard templates
- Batch print multiple receipts

## Future Enhancements

### Planned Features
- Cloud synchronization (optional)
- Multi-branch support
- Advanced analytics
- Mobile companion app
- SMS notifications
- Email receipts

### Sync Architecture
The application is designed to support cloud sync without major rewrites. Current offline-only implementation can be extended with:
- Cloud API integration layer
- Conflict resolution system
- Data change tracking
- Incremental sync

## Support

For issues and bug reports:
1. Check troubleshooting section
2. Review application logs
3. Contact support with detailed description

## License

MIT License - See LICENSE file for details

## Development

### Building from Source

```bash
# Install Node dependencies
npm install

# Development with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format

# Production build
npm run build:release
```

### Architecture Notes

- **Frontend**: React 19 with TypeScript for type safety
- **Backend**: Tauri with Rust for native performance
- **Database**: SQLite for reliable local storage
- **State Management**: Zustand for lightweight state
- **UI**: Tailwind CSS for rapid development

## Offline-First Design

The application works completely offline:
- ✅ All data stored locally
- ✅ No API calls required
- ✅ No cloud dependencies
- ✅ Works without internet indefinitely

Designed to be upgraded to cloud-sync later without major architectural changes.
