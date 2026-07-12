use rusqlite::{Connection, Result};
use serde::Serialize;
use tauri::command;

#[derive(Serialize)]
pub struct Cargo {
    id: i64,
    cargo_name: String,
    description: Option<String>,
    date_available: Option<String>,
    is_currently_available: bool,
    weight_kg: Option<f64>,
    driver_id: Option<i64>,
    driver_name: Option<String>,
    created_at: Option<String>,
    updated_at: Option<String>,
}

#[command]
pub fn get_all_cargos() -> Result<Vec<Cargo>, String> {
    // Path to your DB file. Change this to your app_dir() path in a real Tauri app.
    let db_path = "transitops.db";

    // Open the DB (will error if file missing or inaccessible)
    let conn = Connection::open(db_path).map_err(|e| format!("DB open error: {}", e))?;

    // Prepare and execute the query
    let mut stmt = conn
        .prepare(
            "SELECT id, cargo_name, description, date_available, is_currently_available,
              weight_kg, driver_id, driver_name, created_at, updated_at
       FROM cargos
       ORDER BY date_available DESC, id ASC",
        )
        .map_err(|e| format!("Prepare error: {}", e))?;

    // Map rows into Cargo structs
    let cargo_iter = stmt
        .query_map([], |row| {
            // read integer 0/1 into bool
            let available_int: i64 = row.get(4)?;
            Ok(Cargo {
                id: row.get(0)?,
                cargo_name: row.get(1)?,
                description: row.get(2)?,
                date_available: row.get(3)?,
                is_currently_available: available_int != 0,
                weight_kg: row.get(5)?,
                driver_id: row.get(6)?,
                driver_name: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })
        .map_err(|e| format!("Query map error: {}", e))?;

    // Collect results into a Vec<Cargo>
    let mut cargos: Vec<Cargo> = Vec::new();
    for c in cargo_iter {
        cargos.push(c.map_err(|e| format!("Row parse error: {}", e))?);
    }

    Ok(cargos)
}
