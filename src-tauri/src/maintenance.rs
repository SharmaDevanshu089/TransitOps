use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::Manager;

#[derive(Serialize, Deserialize)]
pub struct MaintenanceLog {
    pub id: i64,
    pub vehicle_id: i64,
    pub maintenance_type: String,
    pub date: String,
    pub cost: f64,
    pub status: String,
    pub created_at: Option<String>,
}

#[command]
pub fn log_maintenance(
    app: tauri::AppHandle,
    vehicle_id: i64,
    maintenance_type: String,
    date: String,
    cost: f64,
) -> Result<String, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let mut conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // Insert maintenance log
    tx.execute(
        "INSERT INTO maintenance_logs (vehicle_id, maintenance_type, date, cost, status) VALUES (?1, ?2, ?3, ?4, 'Active')",
        params![vehicle_id, maintenance_type, date, cost],
    ).map_err(|e| e.to_string())?;

    // Update vehicle status
    tx.execute("UPDATE vehicles SET status = 'In Shop' WHERE id = ?1", params![vehicle_id]).map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok("Maintenance logged and vehicle sent to shop".to_string())
}

#[command]
pub fn close_maintenance(app: tauri::AppHandle, log_id: i64) -> Result<String, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let mut conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let vehicle_id: i64 = tx.query_row(
        "SELECT vehicle_id FROM maintenance_logs WHERE id = ?1",
        params![log_id],
        |row| row.get(0),
    ).map_err(|_| "Maintenance log not found".to_string())?;

    tx.execute("UPDATE maintenance_logs SET status = 'Closed' WHERE id = ?1", params![log_id]).map_err(|e| e.to_string())?;
    tx.execute("UPDATE vehicles SET status = 'Available' WHERE id = ?1 AND status != 'Retired'", params![vehicle_id]).map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok("Maintenance closed, vehicle is now Available".to_string())
}

#[command]
pub fn get_maintenance_logs(app: tauri::AppHandle) -> Result<Vec<MaintenanceLog>, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| format!("DB open error: {}", e))?;

    let mut stmt = conn
        .prepare("SELECT id, vehicle_id, maintenance_type, date, cost, status, created_at FROM maintenance_logs ORDER BY date DESC")
        .map_err(|e| format!("Prepare error: {}", e))?;

    let log_iter = stmt.query_map([], |row| {
        Ok(MaintenanceLog {
            id: row.get(0)?,
            vehicle_id: row.get(1)?,
            maintenance_type: row.get(2)?,
            date: row.get(3)?,
            cost: row.get(4)?,
            status: row.get(5)?,
            created_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut logs = Vec::new();
    for l in log_iter {
        logs.push(l.map_err(|e| e.to_string())?);
    }
    Ok(logs)
}
