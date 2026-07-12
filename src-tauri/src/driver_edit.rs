use rusqlite::Connection;
use serde::Serialize;
use tauri::command;
use tauri::Manager;

#[derive(Serialize)]
pub struct Driver {
    pub id: i64,
    pub name: String,
    pub dob: String,
    pub license_number: String,
    pub license_expiry: String,
    pub truck_number: String,
    pub truck_capacity_kg: f64,
    pub is_available: bool,
    pub account_created_at: Option<String>,
}

#[derive(Serialize)]
pub struct VehcleOps {
    pub id: i64,
    pub name: String,
    pub license_number: Option<String>,
    pub license_category: Option<String>,
    pub license_expiry: Option<String>,
    pub contact_number: Option<String>,
    pub email: Option<String>,
    pub safety_score: i64,
    pub status: String,
    pub is_active: bool,
    pub notes: Option<String>,
    pub created_at: Option<String>,
}

#[command]
pub fn get_all_drivers(app: tauri::AppHandle) -> Result<Vec<Driver>, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| format!("DB open error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, name, dob, license_number, license_expiry, truck_number, truck_capacity_kg, is_available, account_created_at
             FROM drivers
             ORDER BY name ASC",
        )
        .map_err(|e| format!("Prepare error: {}", e))?;

    let driver_iter = stmt
        .query_map([], |row| {
            let available_int: i64 = row.get(7)?;
            Ok(Driver {
                id: row.get(0)?,
                name: row.get(1)?,
                dob: row.get(2)?,
                license_number: row.get(3)?,
                license_expiry: row.get(4)?,
                truck_number: row.get(5)?,
                truck_capacity_kg: row.get(6)?,
                is_available: available_int != 0,
                account_created_at: row.get(8)?,
            })
        })
        .map_err(|e| format!("Query map error: {}", e))?;

    let mut drivers = Vec::new();
    for d in driver_iter {
        drivers.push(d.map_err(|e| format!("Row parse error: {}", e))?);
    }

    Ok(drivers)
}

#[command]
pub fn get_all_vehcle_ops(app: tauri::AppHandle) -> Result<Vec<VehcleOps>, String> {
    let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
    let conn = Connection::open(db_path).map_err(|e| format!("DB open error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, name, license_number, license_category, license_expiry, contact_number, email, safety_score, status, is_active, notes, created_at
             FROM vehcleOps
             ORDER BY name ASC",
        )
        .map_err(|e| format!("Prepare error: {}", e))?;

    let ops_iter = stmt
        .query_map([], |row| {
            let active_int: i64 = row.get(9)?;
            Ok(VehcleOps {
                id: row.get(0)?,
                name: row.get(1)?,
                license_number: row.get(2)?,
                license_category: row.get(3)?,
                license_expiry: row.get(4)?,
                contact_number: row.get(5)?,
                email: row.get(6)?,
                safety_score: row.get(7)?,
                status: row.get(8)?,
                is_active: active_int != 0,
                notes: row.get(10)?,
                created_at: row.get(11)?,
            })
        })
        .map_err(|e| format!("Query map error: {}", e))?;

    let mut ops_list = Vec::new();
    for op in ops_iter {
        ops_list.push(op.map_err(|e| format!("Row parse error: {}", e))?);
    }

    Ok(ops_list)
}
