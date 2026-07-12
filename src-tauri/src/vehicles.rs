use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::Manager;

#[derive(Serialize, Deserialize)]
pub struct Vehicle {
    pub id: i64,
    pub registration_number: String,
    pub name_model: String,
    pub vehicle_type: Option<String>,
    pub max_load_capacity_kg: f64,
    pub odometer: f64,
    pub acquisition_cost: Option<f64>,
    pub status: String,
    pub created_at: Option<String>,
}

#[command]
pub fn get_all_vehicles(app: tauri::AppHandle) -> Result<Vec<Vehicle>, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| format!("DB open error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, registration_number, name_model, type, max_load_capacity_kg, odometer, acquisition_cost, status, created_at
             FROM vehicles
             ORDER BY registration_number ASC",
        )
        .map_err(|e| format!("Prepare error: {}", e))?;

    let vehicle_iter = stmt
        .query_map([], |row| {
            Ok(Vehicle {
                id: row.get(0)?,
                registration_number: row.get(1)?,
                name_model: row.get(2)?,
                vehicle_type: row.get(3)?,
                max_load_capacity_kg: row.get(4)?,
                odometer: row.get(5)?,
                acquisition_cost: row.get(6)?,
                status: row.get(7)?,
                created_at: row.get(8)?,
            })
        })
        .map_err(|e| format!("Query map error: {}", e))?;

    let mut vehicles = Vec::new();
    for v in vehicle_iter {
        vehicles.push(v.map_err(|e| format!("Row parse error: {}", e))?);
    }

    Ok(vehicles)
}

#[command]
pub fn add_vehicle(
    app: tauri::AppHandle,
    registration_number: String,
    name_model: String,
    vehicle_type: Option<String>,
    max_load_capacity_kg: f64,
    odometer: f64,
    acquisition_cost: Option<f64>,
) -> Result<String, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO vehicles (registration_number, name_model, type, max_load_capacity_kg, odometer, acquisition_cost, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'Available')",
        params![registration_number, name_model, vehicle_type, max_load_capacity_kg, odometer, acquisition_cost],
    ).map_err(|e| format!("Failed to insert vehicle: {}", e))?;

    Ok("Vehicle added successfully".to_string())
}

#[command]
pub fn update_vehicle(
    app: tauri::AppHandle,
    id: i64,
    registration_number: String,
    name_model: String,
    vehicle_type: Option<String>,
    max_load_capacity_kg: f64,
    odometer: f64,
    acquisition_cost: Option<f64>,
    status: String,
) -> Result<String, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE vehicles SET registration_number = ?1, name_model = ?2, type = ?3, max_load_capacity_kg = ?4, odometer = ?5, acquisition_cost = ?6, status = ?7 WHERE id = ?8",
        params![registration_number, name_model, vehicle_type, max_load_capacity_kg, odometer, acquisition_cost, status, id],
    ).map_err(|e| format!("Failed to update vehicle: {}", e))?;

    Ok("Vehicle updated successfully".to_string())
}

#[command]
pub fn delete_vehicle(app: tauri::AppHandle, id: i64) -> Result<String, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM vehicles WHERE id = ?1", params![id])
        .map_err(|e| format!("Failed to delete vehicle: {}", e))?;

    Ok("Vehicle deleted successfully".to_string())
}
