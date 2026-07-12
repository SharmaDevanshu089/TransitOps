# TransitOps: Smart Transport Operations Platform

Welcome to **TransitOps**, an end-to-end transport operations platform that digitizes vehicle, driver, dispatch, maintenance, and expense management. This application enforces business rules and provides operational insights, moving logistics companies away from spreadsheets and manual logbooks.

## Built by Humans, For Humans

This project stands as a testament to human engineering. While AI can generate snippets, the specific combination of **Tauri v2, Rust (with Rusqlite), and React (Vite)** running locally as a fully offline desktop application requires a level of architectural foresight, manual tuning, and specific structural decisions that AI rarely strings together cohesively on its own. Every route, component, and database schema was hand-crafted to fit this specific logistics business context.

## Technology Stack & Advantages

TransitOps is built on a modern, robust tech stack:

*   **Fully Offline Architecture:** By embedding a SQLite database directly into the application, TransitOps requires zero internet connection to function. This guarantees maximum privacy, zero latency data retrieval, and constant availability for field offices with poor connectivity.
*   **Tauri v2:** Provides a lightweight, highly secure desktop application wrapper. Unlike Electron, Tauri uses the OS's native webview, resulting in drastically smaller bundle sizes (often under 10MB) and significantly lower RAM usage.
*   **Rust (Backend):** Powers the core logic and database interactions. Rust guarantees memory safety, thread safety, and blazing fast execution speed. It handles file I/O and SQL operations seamlessly.
*   **React & JavaScript (Frontend):** Offers a highly reactive, component-based user interface. It allows for rich visualizations and smooth state transitions without page reloads using `react-router-dom`.

---

## Project Structure & Documentation

### 🌳 Tree View overview

```text
TransitOps/
├── src-tauri/                 # Rust backend and desktop application configuration
│   ├── src/                   # Rust source code
│   │   ├── authenticate.rs    # Handles secure user login and password verification.
│   │   ├── client_manager.rs  # Manages operations related to client cargo records.
│   │   ├── driver_edit.rs     # Manages fetching driver and vehicle operations data.
│   │   ├── finance.rs         # Commands for fetching expenses and logging fuel.
│   │   ├── initial_run.rs     # Bootstraps the SQLite database and populates initial test data.
│   │   ├── lib.rs             # Registers Tauri commands, plugins, and handles setup.
│   │   ├── main.rs            # The main entry point that launches the Tauri application.
│   │   ├── maintenance.rs     # Commands for logging maintenance tasks.
│   │   ├── signon.rs          # Handles new user registration and password hashing.
│   │   ├── trips.rs           # Commands for creating, dispatching, and completing trips.
│   │   └── vehicles.rs        # Commands for vehicle management.
├── src/                       # React frontend source code
│   ├── App.jsx                # Root component managing routing with react-router-dom.
│   ├── main.jsx               # React DOM entry point rendering the App.
│   └── src/                   
│       ├── MainPages/         # Role-specific dashboard pages
│       │   ├── AdminPage/         # Finance dashboard with Recharts & CSV exports.
│       │   ├── ClientPage/        # Dashboard for clients to view cargo statuses.
│       │   ├── SafetyOfficerPage/ # Dashboard to monitor driver license compliance.
│       │   └── VehicleOpsPage/    # Operational dashboard for dispatching trips and maintenance.
│       ├── TitleBar/          # Custom OS-agnostic draggable window title bar.
│       └── loginPage/         # Components for Login, Registration, and Role-specific sign-on.
```

---

### 💻 Frontend Documentation (`src/`)

**`App.jsx`**
The root React component. It currently sets up the foundational layout, including the custom `TitleBar` and the `LoginPage` as the default view.

**`src/MainPages/AdminPage/AdminPage.jsx`**
A component acting as the Finance Dashboard. It holds a state `financeData` and fetches data using an empty Tauri invoke (to be wired up). It maps over this data to display a table of `Vehicle Number` and `Fuel Cost`.

**`src/MainPages/ClientPage/ClientPage.jsx`**
A component representing the Client Dashboard. It fetches cargo data via the `get_all_cargos` Tauri command when it mounts and maps the result to a table. Note: currently maps mismatched fields (`vehicleNumber`, `lifeCycle`) needing backend alignment.

**`src/MainPages/SafetyOfficerPage/SafetyOfficerPage.jsx`**
A component for monitoring driver compliance. It calls `get_all_drivers` and runs a local helper function `getExpiryStatus()` to dynamically calculate if a driver's license is 'Valid', 'Expiring Soon' (<30 days), or 'Expired', rendering appropriate UI badges.

**`src/MainPages/VehicleOpsPage/VehicleOpsPage.jsx`**
A complex dashboard for vehicle operations. It calls `get_all_drivers`, calculates the percentage of available vs. unavailable drivers, and renders a dynamic CSS conic-gradient donut chart. It also displays a full roster table with availability badges.

**`src/TitleBar/TitleBar.jsx`**
A custom window title bar providing a cohesive look across Windows/macOS/Linux. It likely implements Tauri window controls (minimize, maximize, close) and allows the user to drag the window.

**`src/loginPage/` (Login & Registration Forms)**
Contains multiple forms (`LoginPage.jsx`, `Register.jsx`, `SignUp.jsx`, `VehicleOpsLogin.jsx`). These components manage local state for username, password, and roles, and interface with the backend via `authenticate_user` and `create_user` Tauri commands.

---

### 🦀 Backend Documentation (`src-tauri/src/`)

**`authenticate.rs`**
Exposes the `authenticate_user` command. It sanitizes inputs, safely opens the database, queries the `accounts` table by username, and securely verifies the provided password against the stored bcrypt hash. Returns the user's role on success.

**`client_manager.rs`**
Exposes the `get_all_cargos` command. Queries the `cargos` table, parsing rows into a `Cargo` struct (handling nullable fields and booleans correctly), and returns them to the frontend for the client dashboard.

**`driver_edit.rs`**
Exposes two data-fetching commands: `get_all_drivers` (queries the legacy `drivers` table which includes combined truck/driver info) and `get_all_vehcle_ops` (queries the new `vehcleOps` table which contains detailed driver compliance metrics like safety score and category).

**`initial_run.rs`**
The database bootstrapper. It defines `create_db(database_path)`, which creates the `transitops.db` file and nested directories if they don't exist. It contains multiple raw SQL strings to create `accounts`, `drivers`, `vehcleOps`, and `cargos` tables, and seeds them with `INSERT` batches containing initial test data.

**`lib.rs`**
The core Tauri library setup. It applies window effects (like Windows 11 Acrylic vibrancy), checks if the local SQLite database exists (triggering `initial_run` if it doesn't), initializes Tauri plugins, and registers all invoke handlers so the React frontend can call them.

**`signon.rs`**
Exposes the `create_user` command. It takes new user credentials, hashes the password synchronously using bcrypt, determines account creation privileges based on role, and inserts the record into the `accounts` table, gracefully handling SQLite unique constraint errors.