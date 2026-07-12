use rusqlite::Connection;
use tauri::Manager;

#[tauri::command]
pub async fn authenticate_user(app: tauri::AppHandle, username: String, password: String) -> String {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).unwrap();
    println!("Need To authenticate {} at {}", username, password);

    return format!("Hello {} , ", username);
}

