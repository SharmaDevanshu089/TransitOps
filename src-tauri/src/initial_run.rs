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

    // IDK WHY THIS IS GOING newline
    conn.pragma_update(None, "foreign_keys", &"ON")
        .expect("DATABASE_ISSUE");

    // Createing initial table
    conn.execute_batch(&INITIAL_SQL_PROMPT)
        .expect("ERROR_IN_INITIAL_PROMPT");

    // The Frontend dev gonna need this for debug
    conn.execute_batch(&INITIAL_CREATE_PROMPT)
        .expect("ERROR_IN_INITIAL_PROMPT");
}
