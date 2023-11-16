use sqlx::{migrate::MigrateDatabase, Pool, Sqlite, SqlitePool};
use std::fs;
use std::result::Result;
use log::{debug, error};
use serde_json::{json, Value};
use tauri::Runtime;
use crate::db::{queries};
use crate::db::types::{Folder, FolderData, Position, Setting, SkipFolders};

pub fn initialize<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<(), String> {
    tauri::async_runtime::block_on(async move {
        let app_dir = app.path_resolver().app_data_dir().unwrap();
        debug!("App Directory: {:?}", &app_dir);

        let create_dir_result = fs::create_dir_all(&app_dir);
        if let Err(e) = create_dir_result {
            let err_msg = format!("Fail to create App directory {:?}. Error: {:?}", app_dir, e);
            error!("{:?}", err_msg);
            return Err(err_msg);
        }

        let db_url = get_database_path(&app);
        debug!("Database URL: {:?}", &db_url);
        if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
            if let Err(e) = Sqlite::create_database(&db_url).await {
                let err_msg = format!("Fail to create db at {:?}. Error: {:?}", &db_url, e);
                error!("{:?}", err_msg);
                return Err(err_msg);
            }
            if let Err(e) = create_tables(&db_url).await {
                let err_msg = format!("Fail to create tables. Error: {:?}", e.into_database_error());
                error!("{:?}", err_msg);
                return Err(err_msg);
            }
        }
        Ok(())
    })
}

async fn create_tables(db_url: &str) -> Result<(), sqlx::Error> {
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(&queries::CREAT_TABLE_QUERY).execute(&pool).await;
    pool.close().await;
    Ok(())
}

pub fn get_database_path<R: Runtime>(app: &tauri::AppHandle<R>) -> String {
    let app_dir = app.path_resolver().app_data_dir().unwrap();
    return format!("sqlite://{}/sqlite.db", app_dir.display()).to_string();
}

pub async fn create_pool(db_path: &str) -> Result<Pool<Sqlite>, sqlx::Error> {
    let pool = SqlitePool::connect(db_path).await?;
    Ok(pool)
}

pub async fn get_settings(pool: &Pool<Sqlite>) -> Result<Value, sqlx::Error> {
    let settings = sqlx::query_as::<_, Setting>(queries::GET_SETTINGS).fetch_one(pool).await?;
    Ok(settings.to_json())
}

pub async fn get_skip_folders(pool: &Pool<Sqlite>) -> Result<Vec<String>, sqlx::Error> {
    let skip_folders = sqlx::query_as::<_, SkipFolders>(queries::GET_SKIP_FOLDERS).fetch_one(pool).await?;
    Ok(skip_folders.get_skip_folder_list())
}

pub async fn update_hide_side_panel(pool: &Pool<Sqlite>, hide_panel: &i32) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_HIDE_PANEL)
        .bind(hide_panel)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_skip_folders(pool: &Pool<Sqlite>, skip_folders: &str) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_SKIP_FOLDERS)
        .bind(skip_folders)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn insert_folder_data(pool: &Pool<Sqlite>, folder_name: &str, data: &Value, path: &str) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::INSERT_NEW_FOLDER_DATA)
        .bind(folder_name)
        .bind(format!("{}", data))
        .bind(path)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn get_folder_list(pool: &Pool<Sqlite>) -> Result<Value, sqlx::Error> {
    let folder_list = sqlx::query_as::<_, Folder>(queries::GET_FOLDER_LIST)
        .fetch_all(pool)
        .await?;
    Ok(json!(folder_list))
}

pub async fn get_folder_info(pool: &Pool<Sqlite>, position: &i32) -> Result<Value, sqlx::Error> {
    let folder_info = sqlx::query_as::<_, Folder>(queries::GET_FOLDER_INFO)
        .bind(position)
        .fetch_one(pool)
        .await?;
    Ok(json!(folder_info))
}

pub async fn get_folder_data<R: Runtime>(app: &tauri::AppHandle<R>, pool: &Pool<Sqlite>, position: &i32) -> Result<Value, sqlx::Error> {
    let folder_data = sqlx::query_as::<_, FolderData>(queries::GET_FOLDER_DATA)
        .bind(position)
        .fetch_one(pool)
        .await?;
    let app_dir = app.path_resolver().app_data_dir().unwrap();
    Ok(folder_data.to_json(app_dir.to_str().unwrap().to_string()))
}

pub async fn update_folder_data(pool: &Pool<Sqlite>, folder_name: &str, data: &Value) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_FOLDER_DATA)
        .bind(format!("{}", data))
        .bind(folder_name)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_sort_type(pool: &Pool<Sqlite>, position: &i32, sort_type: &String) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_SORT_TYPE)
        .bind(sort_type)
        .bind(position)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_folder_path(pool: &Pool<Sqlite>, position: &i32, path: &String) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_FOLDER_PATH)
        .bind(path)
        .bind(position)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn reorder_folder(pool: &Pool<Sqlite>, folder_name: &[&str]) -> Result<(), sqlx::Error> {
    for i in 0..folder_name.len() {
        let _ = sqlx::query(queries::UPDATE_FOLDER_POSITION)
            .bind(i as i32)
            .bind(folder_name[i])
            .execute(pool)
            .await?;
    }
    Ok(())
}

pub async fn delete_folder(pool: &Pool<Sqlite>, name: &str, position: &i32) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::DELETE_FOLDER)
        .bind(name)
        .bind(position)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_folder_status(pool: &Pool<Sqlite>, status: &i32, position: &i32) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_FOLDER_STATUS)
        .bind(status)
        .bind(position)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn get_folder_position(pool: &Pool<Sqlite>, name: &str, path: &str) -> Result<i32, sqlx::Error> {
    let position = sqlx::query_as::<_, Position>(queries::GET_FOLDER_POSITION)
        .bind(name)
        .bind(path)
        .fetch_one(pool)
        .await?;
    Ok(position.position())
}
