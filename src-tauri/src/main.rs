#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

extern crate core;

use serde_json::Value;

mod parser;

#[tauri::command]
fn parser(app_handle: tauri::AppHandle, name: &str, path: &str) -> Result<Value, String> {
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    return parser::main::parse(&app_dir, name, path);
}

#[tauri::command]
fn get_data_path(app_handle: tauri::AppHandle) -> String {
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    return app_dir.to_str().unwrap().to_string();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![parser,get_data_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
