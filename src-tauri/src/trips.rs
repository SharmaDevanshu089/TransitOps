use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::Manager;

#[derive(Serialize, Deserialize)]
pub struct Trip {
    pub id: i64,
    pub source: String,
    pub destination: String,
    pub vehicle_id: Option<i64>,
    pub driver_id: Option<i64>,
    pub cargo_weight_kg: Option<f64>,
    pub planned_distance_km: Option<f64>,
    pub status: String,
    pub created_at: Option<String>,
}

#[command]
pub fn get_all_trips(app: tauri::AppHandle) -> Result<Vec<Trip>, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| format!("DB open error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km, status, created_at
             FROM trips
             ORDER BY id DESC",
        )
        .map_err(|e| format!("Prepare error: {}", e))?;

    let trip_iter = stmt
        .query_map([], |row| {
            Ok(Trip {
                id: row.get(0)?,
                source: row.get(1)?,
                destination: row.get(2)?,
                vehicle_id: row.get(3)?,
                driver_id: row.get(4)?,
                cargo_weight_kg: row.get(5)?,
                planned_distance_km: row.get(6)?,
                status: row.get(7)?,
                created_at: row.get(8)?,
            })
        })
        .map_err(|e| format!("Query map error: {}", e))?;

    let mut trips = Vec::new();
    for t in trip_iter {
        trips.push(t.map_err(|e| format!("Row parse error: {}", e))?);
    }

    Ok(trips)
}

#[command]
pub fn create_trip(
    app: tauri::AppHandle,
    source: String,
    destination: String,
    vehicle_id: i64,
    driver_id: i64,
    cargo_weight_kg: f64,
    planned_distance_km: f64,
) -> Result<String, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let mut conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // Validate cargo weight
    let capacity: f64 = tx.query_row(
        "SELECT max_load_capacity_kg FROM vehicles WHERE id = ?1",
        params![vehicle_id],
        |row| row.get(0),
    ).map_err(|_| "Vehicle not found".to_string())?;

    if cargo_weight_kg > capacity {
        return Err(format!("Cargo weight ({} kg) exceeds vehicle capacity ({} kg)", cargo_weight_kg, capacity));
    }

    // Insert trip
    tx.execute(
        "INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'Draft')",
        params![source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km],
    ).map_err(|e| format!("Failed to insert trip: {}", e))?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok("Trip created successfully".to_string())
}

#[command]
pub fn dispatch_trip(app: tauri::AppHandle, trip_id: i64) -> Result<String, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let mut conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let (vehicle_id, driver_id): (i64, i64) = tx.query_row(
        "SELECT vehicle_id, driver_id FROM trips WHERE id = ?1",
        params![trip_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).map_err(|_| "Trip not found".to_string())?;

    // Update trip status
    tx.execute("UPDATE trips SET status = 'Dispatched' WHERE id = ?1", params![trip_id]).map_err(|e| e.to_string())?;

    // Update vehicle and driver status
    tx.execute("UPDATE vehicles SET status = 'On Trip' WHERE id = ?1", params![vehicle_id]).map_err(|e| e.to_string())?;
    tx.execute("UPDATE vehcleOps SET status = 'On Trip' WHERE id = ?1", params![driver_id]).map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok("Trip dispatched".to_string())
}

#[command]
pub fn complete_trip(app: tauri::AppHandle, trip_id: i64) -> Result<String, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let mut conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let (vehicle_id, driver_id): (i64, i64) = tx.query_row(
        "SELECT vehicle_id, driver_id FROM trips WHERE id = ?1",
        params![trip_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).map_err(|_| "Trip not found".to_string())?;

    tx.execute("UPDATE trips SET status = 'Completed' WHERE id = ?1", params![trip_id]).map_err(|e| e.to_string())?;
    tx.execute("UPDATE vehicles SET status = 'Available' WHERE id = ?1", params![vehicle_id]).map_err(|e| e.to_string())?;
    tx.execute("UPDATE vehcleOps SET status = 'Available' WHERE id = ?1", params![driver_id]).map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok("Trip completed".to_string())
}
