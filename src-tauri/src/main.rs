#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

extern crate core;

use serde_json::Value;
use tauri::{Manager, Runtime};

mod parser;
mod db;

#[tauri::command]
fn parser<R: Runtime>(app_handle: tauri::AppHandle<R>, name: &str, path: &str) -> Result<Value, String> {
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    return parser::main::parse(&app_dir, name, path);
}

#[tauri::command]
fn get_data_path<R: Runtime>(app_handle: tauri::AppHandle<R>) -> String {
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    return app_dir.to_str().unwrap().to_string();
}

#[tauri::command]
async fn get_setting<R: Runtime>(app_handle: tauri::AppHandle<R>) -> Result<Value, String> {
    let setting_result = db::main::get_settings(&app_handle).await;
    if let Err(e) = setting_result {
        return Err(format!("Fail to get setting. Raising Error: {}", e.into_database_error().unwrap()));
    }
    let setting = setting_result.unwrap();
    Ok(setting)
}

#[tauri::command]
async fn hide_side_panel<R: Runtime>(app_handle: tauri::AppHandle<R>, hide: i32) -> Result<(), String> {
    if let Err(e) = db::main::update_hide_side_panel(&app_handle, hide).await {
        print!("{}", &e.as_database_error().unwrap());
        return Err(format!("Fail to get setting. Raising Error: {}", e.into_database_error().unwrap()));
    }
    Ok(())
}

#[tauri::command]
async fn change_card_size<R: Runtime>(app_handle: tauri::AppHandle<R>, width: i32, height: i32) -> Result<(), String> {
    if let Err(e) = db::main::change_card_size(&app_handle, width, height).await {
        print!("{}", &e.as_database_error().unwrap());
        return Err(format!("Fail to get setting. Raising Error: {}", e.into_database_error().unwrap()));
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![parser,get_data_path,get_setting,hide_side_panel,change_card_size])
        .setup(|app| {
            db::main::initialize(&app.app_handle()).expect("Fail to initialize database");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
