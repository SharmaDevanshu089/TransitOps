use rusqlite::params;
use rusqlite::Connection;
use rusqlite::OptionalExtension;
use tauri::Manager;

#[tauri::command]
pub async fn authenticate_user(
    app: tauri::AppHandle,
    username: String,
    password: String,
) -> Result<Option<String>, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).unwrap();
    println!("Need To authenticate {} at {}", username, password);

    let role: Option<String> = conn
        .query_row(
            "SELECT role FROM accounts WHERE username = ?1 AND password = ?2",
            params![username, password],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| e.to_string())?;

    Ok(role)
}
