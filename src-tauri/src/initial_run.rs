// This file will be used to Handle Initial Run of the application and build database

use rusqlite::{params, Connection, OpenFlags, Result};
use std::fs;
use std::path::Path;
use std::path::PathBuf;

const INITIAL_SQL_PROMPT: &str = "CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Admin', 'VehicleOps', 'Safety Officer', 'Client')),
    can_create_account INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);";

const INITIAL_CREATE_PROMPT: &str =
    "INSERT INTO accounts (username, password, role, can_create_account) VALUES
('admin_finance1', 'financepass123', 'Admin', 0),
('vehops_user1', 'vehops123', 'VehicleOps', 1),
('vehops_user2', 'vehops456', 'VehicleOps', 1),
('safety_officer1', 'safety123', 'Safety Officer', 0),
('client_user1', 'clientpass1', 'Client', 1),
('client_user2', 'clientpass2', 'Client', 1);
";

const INITIAL_DRIVERS_PROMPT: &str = "CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dob DATE NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    truck_number TEXT UNIQUE NOT NULL,
    truck_capacity_kg REAL NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1,
    account_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);";

const INITIAL_VEHCLE_OPS_PROMPT: &str = "CREATE TABLE IF NOT EXISTS vehcleOps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  license_number TEXT UNIQUE,
  license_category TEXT,
  license_expiry DATE,
  contact_number TEXT,
  email TEXT UNIQUE,
  safety_score INTEGER DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'Available', -- Available, On Trip, Off Duty, Suspended
  is_active INTEGER NOT NULL DEFAULT 1,     -- 1 = active, 0 = inactive (soft-delete)
  notes TEXT,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vehcleOps_status ON vehcleOps(status);
CREATE INDEX IF NOT EXISTS idx_vehcleOps_license_expiry ON vehcleOps(license_expiry);
CREATE INDEX IF NOT EXISTS idx_vehcleOps_active ON vehcleOps(is_active);";

const VEHCLE_OPS_TEST_VALUES: &str = "
INSERT INTO vehcleOps (name, license_number, license_category, license_expiry, contact_number, email, safety_score, status, is_active, notes)
VALUES ('Rajesh Kumar', 'DL-2019-12345', 'Heavy Vehicle', '2026-12-31', '9876543210', 'rajesh.kumar@example.com', 95, 'Available', 1, 'Experienced long-haul driver.');
INSERT INTO vehcleOps (name, license_number, license_category, license_expiry, contact_number, email, safety_score, status, is_active, notes)
VALUES ('Priya Singh', 'DL-2018-54321', 'Medium Vehicle', '2025-06-30', '9876543211', 'priya.singh@example.com', 98, 'Available', 1, 'Excellent safety record.');
INSERT INTO vehcleOps (name, license_number, license_category, license_expiry, contact_number, email, safety_score, status, is_active, notes)
VALUES ('Amit Patel', 'DL-2020-67890', 'Light Vehicle', '2027-09-15', '9876543212', 'amit.patel@example.com', 85, 'Off Duty', 1, 'Currently on leave.');
";

const DRIVERS_TEST_VALUES: &str = "
INSERT INTO drivers (name, dob, license_number, license_expiry, truck_number, truck_capacity_kg, is_available)
VALUES ('Rajesh Kumar', '1985-03-15', 'DL-2019-12345', '2026-12-31', 'HR26AB1234', 5000.0, 1);
INSERT INTO drivers (name, dob, license_number, license_expiry, truck_number, truck_capacity_kg, is_available)
VALUES ('Priya Singh', '1988-07-22', 'DL-2018-54321', '2025-06-30', 'HR26CD5678', 8000.0, 1);
INSERT INTO drivers (name, dob, license_number, license_expiry, truck_number, truck_capacity_kg, is_available)
VALUES ('Amit Patel', '1990-11-10', 'DL-2020-67890', '2027-09-15', 'GJ08EF9012', 6500.0, 0);
";

const INITIAL_CARGO_PROMPT: &str = "
CREATE TABLE IF NOT EXISTS cargos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cargo_name TEXT NOT NULL,                       
  description TEXT,                               
  date_available DATE NOT NULL,                   
  is_currently_available INTEGER NOT NULL DEFAULT 1, 
  weight_kg REAL,                                 
  driver_id INTEGER,                              
  driver_name TEXT DEFAULT 'UnAssigned',          
  created_at DATETIME DEFAULT (datetime('now')),                         
  FOREIGN KEY(driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);";

const CARGO_TEST_VALUES: &str = "
INSERT INTO cargos (cargo_name, description, date_available, weight_kg)
VALUES ('Electronics Batch A', 'Assorted consumer electronics', '2026-07-12', 420.5);
INSERT INTO cargos (cargo_name, description, date_available, is_currently_available, weight_kg, driver_id, driver_name)
VALUES ('Furniture Pallet', 'Office desks and chairs', '2026-07-10', 1, 1200.0, 2, 'Priya');
INSERT INTO cargos (cargo_name, description, date_available, is_currently_available, weight_kg)
VALUES ('Reserved Chemicals', 'Reserved for project X', '2026-07-01', 0, 300.0);
";

pub fn create_db(database_path: PathBuf) {
    println!("Creating Database at : {:?}", database_path);
    // Creating new db file if it doesn't exists
    if let Some(parent) = database_path.parent() {
        std::fs::create_dir_all(parent).expect("failed to create directories");
    }
    std::fs::File::create(&database_path).expect("failed to create db file");
    println!("Created DB file at {:?}", database_path);

    // Opening with full acess
    let flags = OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_CREATE;
    let conn = Connection::open_with_flags(&database_path, flags).expect("DATABASE_ISSUE");

    // Enable foreign keys
    conn.pragma_update(None, "foreign_keys", &"ON")
        .expect("DATABASE_ISSUE");

    // Create accounts table
    conn.execute_batch(&INITIAL_SQL_PROMPT)
        .expect("ERROR_IN_ACCOUNTS_TABLE");

    // Create drivers table BEFORE cargos (foreign key dependency)
    conn.execute_batch(&INITIAL_DRIVERS_PROMPT)
        .expect("ERROR_IN_DRIVERS_TABLE");

    // Create vehcleOps table
    conn.execute_batch(&INITIAL_VEHCLE_OPS_PROMPT)
        .expect("ERROR_IN_VEHCLE_OPS_TABLE");

    // Insert account test data
    conn.execute_batch(&INITIAL_CREATE_PROMPT)
        .expect("ERROR_IN_ACCOUNTS_DATA");

    // Insert driver test data
    conn.execute_batch(&DRIVERS_TEST_VALUES)
        .expect("ERROR_IN_DRIVERS_DATA");

    // Insert vehcleOps test data
    conn.execute_batch(&VEHCLE_OPS_TEST_VALUES)
        .expect("ERROR_IN_VEHCLE_OPS_DATA");

    // Create cargos table
    conn.execute_batch(&INITIAL_CARGO_PROMPT)
        .expect("ERROR_IN_CARGO_TABLE");

    // Insert cargo test data
    conn.execute_batch(&CARGO_TEST_VALUES)
        .expect("ERROR_IN_CARGO_DATA");

    println!("Database initialized successfully!");
}
1