use rusqlite::{params, Connection};
use tauri::Manager;

#[tauri::command]
pub fn create_user(
    app: tauri::AppHandle,
    username_input: String,
    password_input: String,
    role_input: String,
) -> Result<String, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    // Automatically determine permission based on the role
    let can_create_account = match role_input.as_str() {
        "VehicleOps" | "Client" => true,
        _ => false, // Admin and Safety Officer default to false
    };

    // Execute the INSERT statement
    let result = conn.execute(
        "INSERT INTO accounts (username, password, role, can_create_account) VALUES (?1, ?2, ?3, ?4)",
        params![username_input, password_input, role_input, can_create_account],
    );

    match result {
        Ok(_) => Ok(format!("User '{}' created successfully.", username_input)),
        Err(e) => {
            let err_msg = e.to_string();
            if err_msg.contains("UNIQUE constraint failed") {
                Err("Username already exists. Please choose a different one.".to_string())
            } else if err_msg.contains("CHECK constraint failed") {
                Err("Invalid role provided.".to_string())
            } else {
                Err(format!("Database error: {}", err_msg))
            }
        }
    }
}
