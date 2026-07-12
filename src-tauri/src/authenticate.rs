use bcrypt::verify;
use rusqlite::params;
use rusqlite::Connection;
use rusqlite::OptionalExtension;
use tauri::Manager; // <-- Ensure you import this

#[tauri::command]
pub async fn authenticate_user(
    app: tauri::AppHandle,
    username: String,
    password: String,
) -> Result<Option<String>, String> {
    // 1. Sanitize inputs
    let username_clean = username.trim();
    let password_clean = password.trim();

    // Prevent unnecessary DB queries for empty inputs
    if username_clean.is_empty() || password_clean.is_empty() {
        return Ok(None);
    }

    // NEVER log passwords. Only log the username attempt.
    println!("Attempting to authenticate user: {}", username_clean);

    // 2. Open DB safely without unwrapping the connection result
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| format!("Failed to open DB: {}", e))?;

    // 3. Query the role AND the stored password hash using ONLY the username
    let user_data: Option<(String, String)> = conn
        .query_row(
            "SELECT role, password FROM accounts WHERE username = ?1",
            params![username_clean],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(|e| e.to_string())?;

    // 4. Verify the password against the stored hash
    if let Some((role, db_hash)) = user_data {
        // verify() compares the plain text against the hash securely
        if verify(password_clean, &db_hash).unwrap_or(false) {
            return Ok(Some(role)); // Password matches
        }
    }

    // Returns None if the username doesn't exist OR the password was wrong
    Ok(None)
}
