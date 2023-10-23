#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

extern crate core;

use std::collections::HashMap;
use std::fs;
use std::sync::Arc;
use log::error;
use serde_json::Value;
use sqlx::{Pool, Sqlite};
use tauri::{
    async_runtime::Mutex as AsyncMutex,
    Manager,
    Runtime,
    State,
};
use tauri_plugin_log::LogTarget;
use crate::db::main::{create_pool, get_database_path};

mod parser;
mod db;

struct DatabaseConnectionState(Arc<AsyncMutex<HashMap<u8, Pool<Sqlite>>>>);

#[tauri::command]
async fn parser<R: Runtime>(app_handle: tauri::AppHandle<R>,
                            database_state: State<'_, DatabaseConnectionState>,
                            name: &str,
                            path: &str,
                            update: bool) -> Result<(), ()> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    let skip_folders_result = db::main::get_skip_folders(pool).await;
    if let Err(e) = skip_folders_result {
        error!("Fail to get skip folders. Raising Error: {:?}", e.into_database_error());
        return Err(());
    }
    let value = parser::main::parse(&app_handle, name, path, &skip_folders_result.unwrap())?;
    if update {
        if let Err(e) = db::main::update_folder_data(pool, name, &value).await {
            error!("Fail to update folder data. Raising Error: {:?}", e.into_database_error());
            return Err(());
        }
    } else {
        if let Err(e) = db::main::insert_folder_data(pool, name, &value, path).await {
            error!("Fail to add data to database. Raising Error: {:?}", e.into_database_error());
            return Err(());
        }
    }
    Ok(())
}

#[tauri::command]
fn get_data_path<R: Runtime>(app_handle: tauri::AppHandle<R>) -> String {
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    return app_dir.to_str().unwrap().to_string();
}

#[tauri::command]
async fn get_setting(database_state: State<'_, DatabaseConnectionState>) -> Result<Value, String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    let setting_result = db::main::get_settings(pool).await;
    if let Err(e) = setting_result {
        return Err(format!("Fail to get setting. Raising Error: {:?}", e.into_database_error()));
    }
    let setting = setting_result.unwrap();
    Ok(setting)
}

#[tauri::command]
async fn hide_side_panel(database_state: State<'_, DatabaseConnectionState>, hide: i32) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    if let Err(e) = db::main::update_hide_side_panel(pool, &hide).await {
        return Err(format!("Fail to get setting. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn change_card_size(database_state: State<'_, DatabaseConnectionState>, width: i32, height: i32) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    if let Err(e) = db::main::change_card_size(pool, &width, &height).await {
        return Err(format!("Fail to get setting. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn update_skip_folders(database_state: State<'_, DatabaseConnectionState>, skip_folders: &str) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    if let Err(e) = db::main::update_skip_folders(pool, skip_folders).await {
        return Err(format!("Fail to update skip folders. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn get_folder_list(database_state: State<'_, DatabaseConnectionState>) -> Result<Value, String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    let folder_list_result = db::main::get_folder_list(pool).await;
    if let Err(e) = folder_list_result {
        return Err(format!("Fail to get folder list. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(folder_list_result.unwrap())
}

#[tauri::command]
async fn get_folder_data<R: Runtime>(app_handle: tauri::AppHandle<R>, database_state: State<'_, DatabaseConnectionState>, position: i32) -> Result<Value, String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    let folder_data_result = db::main::get_folder_data(&app_handle, pool, &position).await;
    if let Err(e) = folder_data_result {
        return Err(format!("Fail to get folder data. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(folder_data_result.unwrap())
}

#[tauri::command]
async fn get_folder_info(database_state: State<'_, DatabaseConnectionState>, position: i32) -> Result<Value, String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    let folder_info_result = db::main::get_folder_info(pool, &position).await;
    if let Err(e) = folder_info_result {
        return Err(format!("Fail to get folder info. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(folder_info_result.unwrap())
}

#[tauri::command]
async fn update_sort_type(database_state: State<'_, DatabaseConnectionState>, position: i32, sort_type: String) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    if let Err(e) = db::main::update_sort_type(pool, &position, &sort_type).await {
        return Err(format!("Fail to update sort type. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn update_folder_path<R: Runtime>(app_handle: tauri::AppHandle<R>,
                                        database_state: State<'_, DatabaseConnectionState>,
                                        name: String,
                                        position: i32,
                                        path: String) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    // update path
    if let Err(e) = db::main::update_folder_path(pool, &position, &path).await {
        return Err(format!("Fail to update folder path. Raising Error: {:?}", e.into_database_error()));
    }

    // refetch data and update data for new path
    let skip_folders_result = db::main::get_skip_folders(pool).await;
    if let Err(e) = skip_folders_result {
        return Err(format!("Fail to get skip folders. Raising Error: {:?}", e.into_database_error()));
    }
    let value = parser::main::parse(&app_handle, &name, &path, &skip_folders_result.unwrap()).unwrap();
    if let Err(e) = db::main::update_folder_data(pool, &name, &value).await {
        return Err(format!("Fail to update folder data. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn reorder_folder(database_state: State<'_, DatabaseConnectionState>, folder_list: Box<[&str]>) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    if let Err(e) = db::main::reorder_folder(pool, &folder_list).await {
        return Err(format!("Fail to reorder folders. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn delete_folder<R: Runtime>(app_handle: tauri::AppHandle<R>,
                                   database_state: State<'_, DatabaseConnectionState>,
                                   name: &str,
                                   position: i32) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances.get_mut(&0).expect("Cannot find database instance.");
    // delete folder from db
    if let Err(e) = db::main::delete_folder(pool, name, &position).await {
        return Err(format!("Fail to delete folders. Raising Error: {:?}", e.into_database_error()));
    }

    // remove thumbnail directory
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    let thumbnail_folder = app_dir.join("thumbnails").join(name);
    if let Err(e) = fs::remove_dir_all(&thumbnail_folder) {
        return Err(format!("Fail to delete thumbnails at directory: {}. Raising Error: {}", thumbnail_folder.display(), e));
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().targets([LogTarget::LogDir, LogTarget::Stdout]).build())
        .invoke_handler(tauri::generate_handler![
            parser,
            get_data_path,
            get_setting,
            hide_side_panel,
            change_card_size,
            update_skip_folders,
            get_folder_list,
            get_folder_info,
            get_folder_data,
            update_sort_type,
            update_folder_path,
            reorder_folder,
            delete_folder
        ])
        .manage(DatabaseConnectionState(Arc::new(AsyncMutex::new(HashMap::new()))))
        .setup(|app| {
            let app_handle = app.app_handle().clone();
            if let Err(e) = db::main::initialize(&app_handle) {
                panic!("Fail to initialize database. Error: {:?}", e)
            }

            let db_path = get_database_path(&app_handle);
            tauri::async_runtime::block_on(async move {
                let creation_result = create_pool(&db_path).await;
                if let Err(e) = creation_result {
                    panic!("Fail to create database pool from path {}. Error: {:?}", db_path, e)
                }
                let db_state: State<DatabaseConnectionState> = app_handle.state::<DatabaseConnectionState>();
                db_state.0.lock().await.insert(0u8, creation_result.unwrap());
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
