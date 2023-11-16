#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

extern crate core;

use std::{fs, thread};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use log::{error, LevelFilter};
use serde_json::{json, Value};
use sqlx::{Pool, Sqlite};
use tauri::{
    async_runtime::Mutex,
    Manager,
    Runtime,
    State,
};
use tauri_plugin_log::LogTarget;

use crate::db::main::{create_pool, get_database_path};

mod parser;
mod db;

struct DatabaseConnectionState(Arc<Mutex<HashMap<u8, Pool<Sqlite>>>>);

#[tauri::command]
async fn parser<R: Runtime>(app_handle: tauri::AppHandle<R>,
                            position: i32,
                            name: &str,
                            path: &str,
                            update: bool) -> Result<(), ()> {
    let name = String::from(name);
    let path = String::from(path);
    tauri::async_runtime::spawn(async move {
        let db_path = get_database_path(&app_handle);
        let pool_creation = create_pool(&db_path).await;
        if let Err(e) = pool_creation {
            error!("Fail to create database pool from path {}. Error: {:?}", db_path, e);
            return;
        }
        let pool = pool_creation.unwrap();

        let path = path.as_str();
        let name = name.as_str();

        let mut folder_position = position;
        // for new folder, add basic information to database first and get the folder index
        if !update {
            if let Err(e) = db::main::insert_folder_data(&pool, name, &json!({}), path).await {
                error!("Fail to add data to database. Raising Error: {:?}", e.into_database_error());
                return;
            }

            let _ = app_handle.emit_all("parsing", "folderList")
                .expect("Fail to send message to update folder list.");

            let folder_position_result = db::main::get_folder_position(&pool, name, path).await;
            if let Err(e) = folder_position_result {
                error!("Fail to get new folder position. Raising Error: {:?}", e.into_database_error());
                return;
            }
            folder_position = folder_position_result.unwrap();
        }

        // handling actual parsing
        if let Err(e) = handle_parsing(&app_handle, &pool, name, path, folder_position).await {
            error!("Error on parsing: {}", e);

            // make status to error
            if let Err(e) = db::main::update_folder_status(&pool, &2, &folder_position).await {
                error!("Fail to change folder status to error. Raising Error: {:?}", e.into_database_error());
            }
            let _ = app_handle.emit_all("parsing", get_folder_detail_cache_key(folder_position))
                .expect("Fail to send message to refresh status on error.");
        }
    });
    Ok(())
}

async fn handle_parsing<R: Runtime>(app_handle: &tauri::AppHandle<R>,
                                    pool: &Pool<Sqlite>,
                                    name: &str,
                                    path: &str,
                                    position: i32) -> Result<(), String> {
    if let Err(e) = db::main::update_folder_status(&pool, &1, &position).await {
        return Err(format!("Fail to change folder status to loading. Raising Error: {:?}", e.into_database_error()));
    }
    let _ = app_handle.emit_all("parsing", get_folder_detail_cache_key(position))
        .expect("Fail to send message to refresh status on loading.");

    let skip_folders_result = db::main::get_skip_folders(&pool).await;
    if let Err(e) = skip_folders_result {
        return Err(format!("Fail to get skip folders. Raising Error: {:?}", e.into_database_error()));
    }
    let skip_folders = skip_folders_result.unwrap();

    thread::sleep(Duration::from_secs(30));

    let value = parser::main::parse(&app_handle, name, path, &skip_folders);

    if let Err(e) = db::main::update_folder_data(&pool, name, &value).await {
        return Err(format!("Fail to update folder data. Raising Error: {:?}", e.into_database_error()));
    }

    if let Err(e) = db::main::update_folder_status(&pool, &0, &position).await {
        return Err(format!("Fail to change folder status to done. Raising Error: {:?}", e.into_database_error()));
    }
    let _ = app_handle.emit_all("parsing", get_folder_detail_cache_key(position))
        .expect("Fail to send message to refresh status on finish.");

    Ok(())
}

fn get_folder_detail_cache_key(position: i32) -> String {
    return format!("folder/info/{}", position);
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
    let value = parser::main::parse(&app_handle, &name, &path, &skip_folders_result.unwrap());
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
    let covers_folder = app_dir.join("covers").join(name);
    if let Err(e) = fs::remove_dir_all(&covers_folder) {
        return Err(format!("Fail to delete covers at directory: {}. Raising Error: {}", thumbnail_folder.display(), e));
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default()
            .targets([LogTarget::LogDir, LogTarget::Stdout])
            .level(LevelFilter::Error)
            .build())
        .invoke_handler(tauri::generate_handler![
            parser,
            get_data_path,
            get_setting,
            hide_side_panel,
            update_skip_folders,
            get_folder_list,
            get_folder_info,
            get_folder_data,
            update_sort_type,
            update_folder_path,
            reorder_folder,
            delete_folder
        ])
        .manage(DatabaseConnectionState(Arc::new(Mutex::new(HashMap::new()))))
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
