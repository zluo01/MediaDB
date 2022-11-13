#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

extern crate core;

use serde_json::Value;

mod parser;
mod nfo_parser;
mod types;
mod utilities;

#[tauri::command]
fn parser(app_handle: tauri::AppHandle, name: &str, path: &str) -> Value {
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    return parser::parser(&app_dir, name, path);
}

#[tauri::command]
fn get_data_path(app_handle: tauri::AppHandle) -> String {
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    return app_dir.to_str().unwrap().to_string();
}

#[tauri::command]
fn open_file(path: &str) -> Result<(), String> {
    if let Err(err) = open::that(path) {
        return Err(format!("Fail to open file at directory: {}. Error: {}", path, err).into());
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![parser, open_file,get_data_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
