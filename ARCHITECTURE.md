# Belle Beauté POS - Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│              Windows Desktop Application (Tauri)        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         React Frontend (TypeScript)              │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  Components (UI/UX Layer)                  │ │  │
│  │  │  - Login, Dashboard, POS, Inventory, etc  │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  Zustand Stores (State Management)        │ │  │
│  │  │  - authStore, posStore, productStore     │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  Custom Hooks (API Layer)                 │ │  │
│  │  │  - useAuth, useDatabase, usePOS          │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↕                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Tauri Bridge (IPC Commands)                  │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↕                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Rust Backend (Tauri)                         │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  Commands (Business Logic)                 │ │  │
│  │  │  - auth, products, sales, backup          │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  Database Module                          │ │  │
│  │  │  - Schema initialization                  │ │  │
│  │  │  - Connection pooling                     │ │  │
│  │  │  - Query builders                         │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  Utilities                                 │ │  │
│  │  │  - Crypto (hashing)                       │ │  │
│  │  │  - Validation                             │ │  │
│  │  │  - File operations                        │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↕                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │    SQLite Database (Local File)                 │  │
│  │    BelleBeaute.db                              │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↕                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Windows File System                          │  │
│  │  - Database file                              │  │
│  │  - Backups folder                             │  │
│  │  - Settings                                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App (root)
├── Splash (initialization screen)
├── LoginPage (authentication)
└── Dashboard (main interface)
    ├── Sidebar Navigation
    ├── Header
    └── Content Area
        ├── POS Module
        ├── Products Module
        ├── Inventory Module
        ├── Customers Module
        ├── Debts Module
        ├── Reports Module
        └── Settings Module
```

### State Management

We use **Zustand** for global state:

1. **authStore**: User authentication state
   - `user`: Current logged-in user
   - `isLoggedIn`: Authentication status
   - `login()`: Authenticate
   - `logout()`: Sign out

2. **posStore**: POS shopping cart
   - `cart`: Items in cart
   - `currentCustomer`: Selected customer
   - `total`, `discount`, `tax`: Calculations
   - `addToCart()`: Add product
   - `removeFromCart()`: Remove product
   - `clearCart()`: Reset cart

## Data Flow

```
User Action
    ↓
React Component
    ↓
Custom Hook (useAuth, useDatabase, etc.)
    ↓
Zustand Store (state update)
    ↓
Tauri IPC Command
    ↓
Rust Backend
    ↓
SQLite Database
    ↓
Result returned
    ↓
State updated → UI re-renders
```

## Backend Architecture (Rust/Tauri)

### Command Structure

All backend operations are exposed as Tauri commands:

```rust
#[tauri::command]
pub async fn operation_name(param1: Type1, param2: Type2) -> Result<ReturnType, String> {
    // Implementation
}
```

## Database Design

### Schema Overview

The application uses SQLite with the following tables:
- **users**: User accounts and authentication
- **products**: Product catalog with categories
- **inventory**: Stock tracking by warehouse
- **sales**: Transaction records
- **sales_items**: Line items in each sale
- **customers**: Customer profiles
- **customer_debts**: Debt tracking
- **suppliers**: Supplier information
- **settings**: Application configuration
- **backups**: Backup records

All tables include timestamps (`created_at`, `updated_at`) and use UUID primary keys for sync-friendly design.

## Offline-First Strategy

### Design Principles

1. **Local-First Data**: All data stored locally, no sync required
2. **Async Operations**: All DB operations non-blocking
3. **Graceful Degradation**: Features work without internet

### Future Sync Architecture (Planned)

When cloud sync is added later, the design will support:
- Change tracking log for sync detection
- Incremental sync capabilities
- Conflict resolution
- Remote API integration

## Getting Started with Development

1. **Install Dependencies**: `npm install`
2. **Start Development**: `npm run dev`
3. **Build for Windows**: `npm run build:release`

## Next Steps

Key modules to implement:
1. Complete authentication system
2. Products management module
3. POS checkout workflow
4. Inventory tracking
5. Reporting system
6. Receipt printing
7. Backup automation
