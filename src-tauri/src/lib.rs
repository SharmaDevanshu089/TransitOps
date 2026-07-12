use std::path::Path;
use tauri::path::BaseDirectory;
use tauri::Manager;
use window_vibrancy::apply_acrylic;

mod authenticate;
mod client_manager;
mod driver_edit;
mod finance;
mod initial_run;
mod maintenance;
mod signon;
mod trips;
mod vehicles;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // This will add Acrylic effect to window , only works on windows 11 imo
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "windows")]
            apply_acrylic(&window, Some((40, 30, 55, 110).into()))
                .expect("Failed to apply acrylic");

            // I need to Check if Database already exisits , IF NOT then call  the initial run file to create database
            let db_path = app.path().app_data_dir().unwrap().join("transitops.db");
            println!("Database Path {:?}", db_path);

            let db_exists = Path::new(&db_path).exists();
            println!("Database Exists :{}", db_exists);

            if !db_exists {
                //Database Doesnot exists
                initial_run::create_db(db_path);
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            authenticate::authenticate_user,
            signon::create_user,
            client_manager::get_all_cargos,
            client_manager::add_cargo,
            client_manager::delete_cargo,
            driver_edit::get_all_drivers,
            driver_edit::get_all_vehcle_ops,
            vehicles::get_all_vehicles,
            vehicles::add_vehicle,
            vehicles::update_vehicle,
            vehicles::delete_vehicle,
            driver_edit::add_vehcle_op,
            driver_edit::update_vehcle_op,
            driver_edit::delete_vehcle_op,
            trips::get_all_trips,
            trips::create_trip,
            trips::dispatch_trip,
            trips::complete_trip,
            trips::cancel_trip,
            maintenance::log_maintenance,
            maintenance::close_maintenance,
            maintenance::get_maintenance_logs,
            finance::get_expenses,
            finance::log_fuel,
            finance::add_expense,
            finance::export_to_csv
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
