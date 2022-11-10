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
    let app_dir = app_handle.path_resolver().app_config_dir().unwrap();
    return parser::parser(&app_dir, name, path);
}

#[tauri::command]
fn open_file(path: &str) {
    open::that(path).expect(format!("Fail to open file at directory: {}", path).as_str());
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![parser, open_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
