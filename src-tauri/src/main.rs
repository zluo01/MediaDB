#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

extern crate core;

use crate::db::main::{create_pool, get_database_path};
use crate::helper::main::group_tags;
use crate::model::database::{Folder, FolderData, Media, MediaTag, Tag};
use log::{error, info, LevelFilter};
use rayon::prelude::*;
use serde_json::Value;
use sqlx::{Pool, Sqlite};
use std::collections::HashSet;
use std::{collections::HashMap, fs, process::Command, sync::Arc};
use tauri::{async_runtime::Mutex, Emitter, Manager, Runtime, State};
use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_notification::NotificationExt;

mod db;
mod helper;
mod model;
mod parser;

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

#[derive(Clone, serde::Serialize)]
struct InvalidationPayload {
    t: u8,   // type of invalidation
    id: i32, // folderId
}

struct DatabaseConnectionState(Arc<Mutex<HashMap<u8, Pool<Sqlite>>>>);

#[tauri::command]
async fn parser<R: Runtime>(
    app_handle: tauri::AppHandle<R>,
    position: i32,
    name: &str,
    path: &str,
    update: bool,
) -> Result<(), ()> {
    let name = String::from(name);
    let path = String::from(path);
    tauri::async_runtime::spawn(async move {
        let db_path = get_database_path(&app_handle);
        let pool_creation = create_pool(&db_path).await;
        if let Err(e) = pool_creation {
            let _ = &app_handle
                .notification()
                .builder()
                .title("MediaDB: Encounter Error when initialize database pool.")
                .body(format!(
                    "Fail to create database pool from path {}. Error: {:?}",
                    db_path, e
                ))
                .show()
                .unwrap();
            return;
        }
        let pool = pool_creation.unwrap();

        let path = path.as_str();
        let name = name.as_str();

        let mut folder_position = position;
        // for new folder, add basic information to database first and get the folder index
        if !update {
            if let Err(e) = db::main::insert_folder_data(&pool, name, path).await {
                error!(
                    "Fail to add data to database. Raising Error: {:?}",
                    e.into_database_error()
                );
                return;
            }

            let _ = app_handle
                .emit(
                    "parsing",
                    InvalidationPayload {
                        t: 0u8,
                        id: position,
                    },
                )
                .expect("Fail to send message to update folder list.");

            let folder_position_result = db::main::get_folder_position(&pool, name, path).await;
            if let Err(e) = folder_position_result {
                error!(
                    "Fail to get new folder position. Raising Error: {:?}",
                    e.into_database_error()
                );
                return;
            }
            folder_position = folder_position_result.unwrap();
        }

        // handling actual parsing
        process_parsing(&app_handle, &pool, name, path, folder_position).await;
    });
    Ok(())
}

#[tauri::command]
async fn update_folder_path<R: Runtime>(
    app_handle: tauri::AppHandle<R>,
    name: String,
    position: i32,
    path: String,
) -> Result<(), String> {
    let name = String::from(name);
    let path = String::from(path);
    tauri::async_runtime::spawn(async move {
        let db_path = get_database_path(&app_handle);
        let pool_creation = create_pool(&db_path).await;
        if let Err(e) = pool_creation {
            let _ = &app_handle
                .notification()
                .builder()
                .title("MediaDB: Encounter Error when initialize database pool.")
                .body(format!(
                    "Fail to create database pool from path {}. Error: {:?}",
                    db_path, e
                ))
                .show()
                .unwrap();
            return;
        }
        let pool = pool_creation.unwrap();

        let path = path.as_str();
        let name = name.as_str();

        // update path
        if let Err(e) = db::main::update_folder_path(&pool, &position, &path).await {
            error!(
                "Fail to update folder path. Raising Error: {:?}",
                e.into_database_error()
            );
            return;
        }

        // refresh data and update data for new path
        process_parsing(&app_handle, &pool, name, path, position).await;
    });
    Ok(())
}

async fn process_parsing<R: Runtime>(
    app_handle: &tauri::AppHandle<R>,
    pool: &Pool<Sqlite>,
    name: &str,
    path: &str,
    position: i32,
) {
    let invalidation_payload: InvalidationPayload = InvalidationPayload {
        t: 1u8,
        id: position,
    };
    if let Err(e) = handle_parsing(&app_handle, &pool, name, path, position).await {
        error!("Error on parsing: {}", e);

        // make status to error
        if let Err(e) = db::main::update_folder_status(&pool, &2, &position).await {
            error!(
                "Fail to change folder status to error. Raising Error: {:?}",
                e.into_database_error()
            );
        }
        let _ = app_handle
            .emit("parsing", invalidation_payload)
            .expect("Fail to send message to refresh status on error.");
    } else {
        if let Err(e) = db::main::update_folder_status(&pool, &0, &position).await {
            error!(
                "Fail to change folder status to done. Raising Error: {:?}",
                e.into_database_error()
            );
        }
        let _ = &app_handle
            .emit("parsing", invalidation_payload)
            .expect("Fail to send message to refresh status on finish.");

        let _ = app_handle
            .notification()
            .builder()
            .title("MediaDB")
            .body(format!("Building directory {} is finished.", name))
            .show()
            .unwrap();
    }
}

async fn handle_parsing<R: Runtime>(
    app_handle: &tauri::AppHandle<R>,
    pool: &Pool<Sqlite>,
    name: &str,
    path: &str,
    position: i32,
) -> Result<(), String> {
    let invalidation_payload: InvalidationPayload = InvalidationPayload {
        t: 1u8,
        id: position,
    };
    if let Err(e) = db::main::update_folder_status(&pool, &1, &position).await {
        return Err(format!(
            "Fail to change folder status to loading. Raising Error: {:?}",
            e.into_database_error()
        ));
    }
    let _ = app_handle
        .emit("parsing", invalidation_payload)
        .expect("Fail to send message to refresh status on loading.");

    let skip_folders_result = db::main::get_skip_folders(&pool).await;
    if let Err(e) = skip_folders_result {
        return Err(format!(
            "Fail to get skip folders. Raising Error: {:?}",
            e.into_database_error()
        ));
    }
    let skip_folders = skip_folders_result.unwrap();

    let value = parser::main::parse(&app_handle, name, path, &skip_folders);

    if let Err(e) = db::main::insert_new_media(&pool, name, &value).await {
        return Err(format!(
            "Fail to update folder data. Raising Error: {:?}",
            e.into_database_error()
        ));
    }
    Ok(())
}

#[tauri::command]
async fn get_setting(database_state: State<'_, DatabaseConnectionState>) -> Result<Value, String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");
    let setting_result = db::main::get_settings(pool).await;
    if let Err(e) = setting_result {
        return Err(format!(
            "Fail to get setting. Raising Error: {:?}",
            e.into_database_error()
        ));
    }
    let setting = setting_result.unwrap();
    Ok(setting)
}

#[tauri::command]
async fn hide_side_panel(
    database_state: State<'_, DatabaseConnectionState>,
    hide: i32,
) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");
    if let Err(e) = db::main::update_hide_side_panel(pool, &hide).await {
        return Err(format!(
            "Fail to get setting. Raising Error: {:?}",
            e.into_database_error()
        ));
    }
    Ok(())
}

#[tauri::command]
async fn update_skip_folders(
    database_state: State<'_, DatabaseConnectionState>,
    skip_folders: &str,
) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");
    if let Err(e) = db::main::update_skip_folders(pool, skip_folders).await {
        return Err(format!(
            "Fail to update skip folders. Raising Error: {:?}",
            e.into_database_error()
        ));
    }
    Ok(())
}

#[tauri::command]
async fn get_folder_list(
    database_state: State<'_, DatabaseConnectionState>,
) -> Result<Vec<Folder>, String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");
    let folder_list_result = db::main::get_folder_list(pool).await;
    match folder_list_result {
        Ok(folder_list) => Ok(folder_list),
        Err(e) => Err(format!(
            "Fail to get folder list. Raising Error: {:?}",
            e.into_database_error()
        )),
    }
}

#[tauri::command]
async fn get_folder_data(
    database_state: State<'_, DatabaseConnectionState>,
    position: i32,
) -> Result<FolderData, String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");
    let folder_data_result = db::main::get_folder_data(pool, &position).await;
    match folder_data_result {
        Ok(folder_data) => Ok(folder_data),
        Err(e) => Err(format!(
            "Fail to get folder data. Raising Error: {:?}",
            e.into_database_error()
        )),
    }
}

#[tauri::command]
async fn get_folder_media(
    database_state: State<'_, DatabaseConnectionState>,
    position: i32,
    key: &str,
    tags: Vec<Tag>,
) -> Result<Vec<Media>, String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");

    let no_filtering = tags.is_empty();
    let folder_media_result = db::main::get_folder_media(pool, &position, key, no_filtering).await;
    if let Err(e) = folder_media_result {
        error!("{:?}", e);
        return Err(format!(
            "Fail to get folder media. Raising Error: {:?}",
            e.into_database_error()
        ));
    }

    let result = folder_media_result.unwrap();
    let media_list = result.media_list;

    if no_filtering {
        return Ok(media_list);
    }

    let tag_list = result.tags;
    let tags_group = tag_list.iter().fold(HashMap::new(), |mut acc, tag| {
        acc.entry(tag.path())
            .or_insert_with(Vec::new)
            .push(tag.clone());
        acc
    });

    let media_keys = filter_media(&tags_group, &tags, result.filter_type);
    Ok(media_list
        .into_iter()
        .filter(|o| media_keys.contains(&o.path().to_string()))
        .collect::<Vec<Media>>())
}

fn filter_media(
    tags_group: &HashMap<&str, Vec<MediaTag>>,
    filter_tags: &Vec<Tag>,
    filter_type: u8,
) -> Vec<String> {
    if filter_tags.is_empty() {
        return tags_group.keys().map(|&k| k.to_string()).collect();
    }

    let filter_tag_groups = group_tags(filter_tags);

    tags_group
        .into_par_iter()
        .filter(|(_, v)| {
            let groups = group_tags(&v);
            let mut keep = true;
            for (key, value) in groups {
                if let Some(filter_tags) = filter_tag_groups.get(key) {
                    keep = keep & check_filter_condition(&value, filter_tags, filter_type);
                }
            }
            return keep;
        })
        .map(|(k, _)| k.to_string())
        .collect()
}

fn check_filter_condition(source: &Vec<Tag>, target: &Vec<Tag>, filter_type: u8) -> bool {
    let source_set: HashSet<_> = source.into_iter().collect();
    let target_set: HashSet<_> = target.into_iter().collect();

    // OR, if media tag contains any of the filter tag, return true
    if filter_type == 0u8 {
        return source_set.intersection(&target_set).count() > 0;
    }

    // AND, we need to make sure source tags contains all tags from filter tags
    target_set.is_subset(&source_set)
}

#[tauri::command]
async fn get_folder_media_tags(
    database_state: State<'_, DatabaseConnectionState>,
    position: i32,
) -> Result<Vec<Value>, String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");

    let tags_result = db::main::get_folder_media_tags(pool, &position).await;
    match tags_result {
        Ok(tags) => Ok(tags),
        Err(e) => Err(format!(
            "Fail to get folder media tags. Raising Error: {:?}",
            e.into_database_error()
        )),
    }
}

#[tauri::command]
async fn get_folder_info(
    database_state: State<'_, DatabaseConnectionState>,
    position: i32,
) -> Result<Value, String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");
    let folder_info_result = db::main::get_folder_info(pool, &position).await;
    match folder_info_result {
        Ok(info) => Ok(info),
        Err(e) => Err(format!(
            "Fail to get folder info. Raising Error: {:?}",
            e.into_database_error()
        )),
    }
}

#[tauri::command]
async fn update_sort_type(
    database_state: State<'_, DatabaseConnectionState>,
    position: i32,
    sort_type: u8,
) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");
    if let Err(e) = db::main::update_sort_type(pool, &position, &sort_type).await {
        return Err(format!(
            "Fail to update sort type. Raising Error: {:?}",
            e.into_database_error()
        ));
    }
    Ok(())
}

#[tauri::command]
async fn reorder_folder(
    database_state: State<'_, DatabaseConnectionState>,
    folder_list: Box<[&str]>,
) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");
    if let Err(e) = db::main::reorder_folder(pool, &folder_list).await {
        return Err(format!(
            "Fail to reorder folders. Raising Error: {:?}",
            e.into_database_error()
        ));
    }
    Ok(())
}

#[tauri::command]
async fn delete_folder<R: Runtime>(
    app_handle: tauri::AppHandle<R>,
    database_state: State<'_, DatabaseConnectionState>,
    name: &str,
    position: i32,
) -> Result<(), String> {
    let mut instances = database_state.0.lock().await;
    let pool = instances
        .get_mut(&0)
        .expect("Cannot find database instance.");
    // delete folder from db
    if let Err(e) = db::main::delete_folder(pool, name, &position).await {
        return Err(format!(
            "Fail to delete folders. Raising Error: {:?}",
            e.into_database_error()
        ));
    }

    let app_dir = app_handle.path().app_data_dir().unwrap();
    let covers_folder = app_dir.join("covers").join(name);
    if let Err(e) = fs::remove_dir_all(&covers_folder) {
        return Err(format!(
            "Fail to delete covers at directory: {}. Raising Error: {}",
            covers_folder.display(),
            e
        ));
    }
    Ok(())
}

#[cfg(target_os = "windows")]
fn check_ffmpeg_exists() -> bool {
    use std::os::windows::process::CommandExt;
    let output = Command::new("ffmpeg")
        .arg("-version")
        // https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags
        .creation_flags(0x08000000)
        .output();

    match output {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[cfg(not(target_os = "windows"))]
fn check_ffmpeg_exists() -> bool {
    // Attempt to execute `ffmpeg` with `-version` argument
    let output = Command::new("ffmpeg").arg("-version").output();

    match output {
        Ok(_) => true,
        Err(_) => false,
    }
}

fn show_window(app_handle: &tauri::AppHandle) {
    let windows = app_handle.webview_windows();
    windows
        .values()
        .next()
        .expect("Sorry, no window found")
        .set_focus()
        .expect("Can't Bring Window to Focus");
}

fn main() {
    let log_level;
    if cfg!(debug_assertions) {
        log_level = LevelFilter::Trace;
    } else {
        log_level = LevelFilter::Error;
    }

    info!("Log Level: {:?}", log_level);
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            let _ = show_window(app);
            println!("{}, {args:?}, {cwd}", app.package_info().name);
            app.emit("single-instance", Payload { args, cwd }).unwrap();
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new()
            .targets([
                Target::new(TargetKind::Stdout),
                Target::new(TargetKind::LogDir { file_name: None }),
            ])
            .level(log_level)
            .build())
        .invoke_handler(tauri::generate_handler![
            parser,
            get_setting,
            hide_side_panel,
            update_skip_folders,
            get_folder_list,
            get_folder_info,
            get_folder_data,
            get_folder_media,
            get_folder_media_tags,
            update_sort_type,
            update_folder_path,
            reorder_folder,
            delete_folder
        ])
        .manage(DatabaseConnectionState(Arc::new(Mutex::new(HashMap::new()))))
        .setup(|app| {
            let app_handle = app.app_handle().clone();
            if !check_ffmpeg_exists() {
                let _ = &app_handle.notification()
                    .builder()
                    .title("MediaDB")
                    .body("Missing core dependency ffmpeg, please download and install from https://www.ffmpeg.org/download.html.")
                    .show()
                    .unwrap();
                panic!("Missing ffmpeg, please download and install from https://www.ffmpeg.org/download.html.")
            }

            if let Err(e) = db::main::initialize(&app_handle) {
                panic!("Fail to initialize database. Error: {:?}", e)
            }

            let db_path = get_database_path(&app_handle);
            tauri::async_runtime::block_on(async move {
                let creation_result = create_pool(&db_path).await;
                if let Err(e) = creation_result {
                    panic!("Fail to create database pool from path {}. Error: {:?}", db_path, e)
                }

                let pool = creation_result.unwrap();
                if let Err(e) = db::main::recover(&pool).await {
                    panic!("Fail to recover folder status. Error: {:?}", e)
                }

                let db_state: State<DatabaseConnectionState> = app_handle.state::<DatabaseConnectionState>();
                db_state.0.lock().await.insert(0u8, pool);
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running mediadb application");
}
