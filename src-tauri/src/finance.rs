use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::Manager;

#[derive(Serialize, Deserialize)]
pub struct Expense {
    pub id: i64,
    pub vehicle_id: i64,
    pub expense_type: String,
    pub cost: f64,
    pub date: String,
    pub description: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct FuelLog {
    pub id: i64,
    pub vehicle_id: i64,
    pub liters: f64,
    pub cost: f64,
    pub date: String,
    pub created_at: Option<String>,
}

#[command]
pub fn get_expenses(app: tauri::AppHandle) -> Result<Vec<Expense>, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| format!("DB open error: {}", e))?;

    let mut stmt = conn
        .prepare("SELECT id, vehicle_id, expense_type, cost, date, description, created_at FROM expenses ORDER BY date DESC")
        .map_err(|e| format!("Prepare error: {}", e))?;

    let exp_iter = stmt.query_map([], |row| {
        Ok(Expense {
            id: row.get(0)?,
            vehicle_id: row.get(1)?,
            expense_type: row.get(2)?,
            cost: row.get(3)?,
            date: row.get(4)?,
            description: row.get(5)?,
            created_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut expenses = Vec::new();
    for e in exp_iter {
        expenses.push(e.map_err(|e| e.to_string())?);
    }
    Ok(expenses)
}

#[command]
pub fn log_fuel(app: tauri::AppHandle, vehicle_id: i64, liters: f64, cost: f64, date: String) -> Result<String, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO fuel_logs (vehicle_id, liters, cost, date) VALUES (?1, ?2, ?3, ?4)",
        params![vehicle_id, liters, cost, date],
    ).map_err(|e| e.to_string())?;

    Ok("Fuel logged successfully".to_string())
}
