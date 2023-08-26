#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

extern crate core;

use std::fs;
use serde_json::Value;
use tauri::{Manager, Runtime};

mod parser;
mod db;

#[tauri::command]
async fn parser<R: Runtime>(app_handle: tauri::AppHandle<R>, name: &str, path: &str, update: bool) -> Result<(), String> {
    let skip_folders_result = db::main::get_skip_folders(&app_handle).await;
    if let Err(e) = skip_folders_result {
        return Err(format!("Fail to get skip folders. Raising Error: {:?}", e.into_database_error()));
    }
    let value = parser::main::parse(&app_handle, name, path, &skip_folders_result.unwrap())?;
    if update {
        if let Err(e) = db::main::update_folder_data(&app_handle, name, &value).await {
            return Err(format!("Fail to update folder data. Raising Error: {:?}", e.into_database_error()));
        }
    } else {
        if let Err(e) = db::main::insert_folder_data(&app_handle, name, &value, path).await {
            return Err(format!("Fail to add data to database. Raising Error: {:?}", e.into_database_error()));
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
async fn get_setting<R: Runtime>(app_handle: tauri::AppHandle<R>) -> Result<Value, String> {
    let setting_result = db::main::get_settings(&app_handle).await;
    if let Err(e) = setting_result {
        return Err(format!("Fail to get setting. Raising Error: {:?}", e.into_database_error()));
    }
    let setting = setting_result.unwrap();
    Ok(setting)
}

#[tauri::command]
async fn hide_side_panel<R: Runtime>(app_handle: tauri::AppHandle<R>, hide: i32) -> Result<(), String> {
    if let Err(e) = db::main::update_hide_side_panel(&app_handle, &hide).await {
        return Err(format!("Fail to get setting. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn change_card_size<R: Runtime>(app_handle: tauri::AppHandle<R>, width: i32, height: i32) -> Result<(), String> {
    if let Err(e) = db::main::change_card_size(&app_handle, &width, &height).await {
        return Err(format!("Fail to get setting. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn update_skip_folders<R: Runtime>(app_handle: tauri::AppHandle<R>, skip_folders: &str) -> Result<(), String> {
    if let Err(e) = db::main::update_skip_folders(&app_handle, skip_folders).await {
        return Err(format!("Fail to update skip folders. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn get_folder_list<R: Runtime>(app_handle: tauri::AppHandle<R>) -> Result<Value, String> {
    let folder_list_result = db::main::get_folder_list(&app_handle).await;
    if let Err(e) = folder_list_result {
        return Err(format!("Fail to get folder list. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(folder_list_result.unwrap())
}

#[tauri::command]
async fn get_folder_data<R: Runtime>(app_handle: tauri::AppHandle<R>, position: i32) -> Result<Value, String> {
    let folder_data_result = db::main::get_folder_data(&app_handle, &position).await;
    if let Err(e) = folder_data_result {
        return Err(format!("Fail to get folder data. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(folder_data_result.unwrap())
}

#[tauri::command]
async fn get_folder_info<R: Runtime>(app_handle: tauri::AppHandle<R>, position: i32) -> Result<Value, String> {
    let folder_info_result = db::main::get_folder_info(&app_handle, &position).await;
    if let Err(e) = folder_info_result {
        return Err(format!("Fail to get folder info. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(folder_info_result.unwrap())
}

#[tauri::command]
async fn update_sort_type<R: Runtime>(app_handle: tauri::AppHandle<R>, position: i32, sort_type: String) -> Result<(), String> {
    if let Err(e) = db::main::update_sort_type(&app_handle, &position, &sort_type).await {
        return Err(format!("Fail to update sort type. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn update_folder_path<R: Runtime>(app_handle: tauri::AppHandle<R>, name: String, position: i32, path: String) -> Result<(), String> {
    // update path
    if let Err(e) = db::main::update_folder_path(&app_handle, &position, &path).await {
        return Err(format!("Fail to update folder path. Raising Error: {:?}", e.into_database_error()));
    }

    // refetch data and update data for new path
    let skip_folders_result = db::main::get_skip_folders(&app_handle).await;
    if let Err(e) = skip_folders_result {
        return Err(format!("Fail to get skip folders. Raising Error: {:?}", e.into_database_error()));
    }
    let value = parser::main::parse(&app_handle, &name, &path, &skip_folders_result.unwrap())?;
    if let Err(e) = db::main::update_folder_data(&app_handle, &name, &value).await {
        return Err(format!("Fail to update folder data. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn reorder_folder<R: Runtime>(app_handle: tauri::AppHandle<R>, folder_list: Box<[&str]>) -> Result<(), String> {
    if let Err(e) = db::main::reorder_folder(&app_handle, &folder_list).await {
        return Err(format!("Fail to reorder folders. Raising Error: {:?}", e.into_database_error()));
    }
    Ok(())
}

#[tauri::command]
async fn delete_folder<R: Runtime>(app_handle: tauri::AppHandle<R>, name: &str, position: i32) -> Result<(), String> {
    // delete folder from db
    if let Err(e) = db::main::delete_folder(&app_handle, name, &position).await {
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
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            parser,get_data_path,
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
        .setup(|app| {
            if let Err(e) = db::main::initialize(&app.app_handle()) {
                panic!("Fail to initialize database. Error: {:?}", e)
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
