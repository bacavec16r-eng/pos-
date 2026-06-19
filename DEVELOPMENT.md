# Development Guide

## Setup

### Prerequisites
- Node.js 16+
- Rust 1.70+
- Windows 10 or 11

### Installation

```bash
# Install dependencies
npm install

# Install Tauri CLI globally
npm install -g @tauri-apps/cli
```

## Development

### Start Development Server

```bash
# Terminal 1: Start Vite dev server
npm run web

# Terminal 2: Start Tauri dev server
npm run dev
```

## Available Commands

### Frontend (React)
- `npm run web` - Start development server
- `npm run web:build` - Build frontend
- `npm run lint` - Lint code
- `npm run format` - Format code

### Backend (Tauri/Rust)
- `npm run dev` - Start development app
- `npm run build` - Build for production
- `npm run build:release` - Create Windows installer

## Project Structure

```
src/
├── pages/
│   ├── modules/
│   │   ├── POS.tsx
│   │   ├── Products.tsx
│   │   ├── Customers.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── Splash.tsx
│   ├── LoginPage.tsx
│   └── Dashboard.tsx
├── store/
│   ├── authStore.ts
│   └── posStore.ts
├── hooks/
│   ├── useAuth.ts
│   └── useDatabase.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx

src-tauri/src/
├── commands/
│   ├── auth.rs
│   ├── products.rs
│   ├── sales.rs
│   ├── customers.rs
│   ├── inventory.rs
│   ├── reports.rs
│   ├── backup.rs
│   └── receipt.rs
├── db/
│   └── mod.rs
├── utils/
│   ├── crypto.rs
│   └── validation.rs
├── scheduler.rs
└── main.rs
```

## Database

### Initialize Database
The database is automatically created on first app launch with all tables initialized.

### Database File
- Location: `BelleBeaute.db`
- Type: SQLite
- Backups: `backups/` directory

## Testing

### Demo Credentials
```
Username: admin
Password: password
```

## Building for Production

```bash
# Create Windows installer
npm run build:release

# Output files:
# - Windows installer: src-tauri/target/release/bundle/nsis/Belle Beauté POS_*.exe
# - Portable: src-tauri/target/release/belle_beaute_pos.exe
```

## Troubleshooting

### Development
- Clear node_modules: `rm -r node_modules && npm install`
- Clear Tauri build: `rm -rf src-tauri/target`
- Check Rust: `rustc --version` and `cargo --version`

### Database
- Delete corrupted DB: `rm BelleBeaute.db`
- Reset on next launch: App will recreate database

## API Documentation

All backend commands are exposed via Tauri IPC. Call from frontend:

```typescript
import { invoke } from "@tauri-apps/api/core";

// Example: Login
const response = await invoke("login", {
  username: "admin",
  password: "password"
});

// Example: Get Products
const products = await invoke("get_products", {
  search: "cream"
});
```

## Performance Tips

1. Use search/filter instead of loading all data
2. Implement pagination for large lists
3. Use indexes on frequently queried columns
4. Keep database backups regular
5. Archive old sales records periodically

## Security Notes

1. Passwords are hashed using SHA256
2. All database queries use parameterized statements
3. Role-based access control implemented
4. Input validation on frontend and backend
5. Backup encryption recommended for sensitive data

## Next Steps

1. **Testing**: Add unit and integration tests
2. **Localization**: Add multi-language support (AR, FR)
3. **Advanced Features**:
   - Supplier management
   - Stock transfers
   - Advanced analytics
   - PDF reports
4. **Cloud Sync**: Prepare architecture for optional cloud sync
5. **Mobile**: Consider companion mobile app

## Support

For issues:
1. Check logs in app data directory
2. Review troubleshooting section
3. Check database integrity
4. Test with clean database
