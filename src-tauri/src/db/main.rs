use sqlx::{migrate::MigrateDatabase, Sqlite, SqlitePool};
use std::fs;
use std::result::Result;
use serde_json::{json, Value};
use tauri::Runtime;
use crate::db::{queries};
use crate::db::types::{Folder, FolderData, Setting, SkipFolders};

pub fn initialize<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<(), String> {
    tauri::async_runtime::block_on(async move {
        let app_dir = app.path_resolver().app_data_dir().unwrap();
        fs::create_dir_all(&app_dir).expect(&*format!("Fail to create App directory {:?}.", app_dir));

        let db_url = get_database_path(&app);
        if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
            Sqlite::create_database(&db_url)
                .await
                .expect(&*format!("Fail to create db at {}", &db_url));
            match create_tables(&db_url).await {
                Ok(_) => println!("Database created Successfully"),
                Err(e) => panic!("{:?}", e),
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

fn get_database_path<R: Runtime>(app: &tauri::AppHandle<R>) -> String {
    let app_dir = app.path_resolver().app_data_dir().unwrap();
    return format!("sqlite://{}/sqlite.db", app_dir.display()).to_string();
}

pub async fn get_settings<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<Value, sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let settings = sqlx::query_as::<_, Setting>(queries::GET_SETTINGS).fetch_one(&pool).await?;
    pool.close().await;
    Ok(settings.to_json())
}

pub async fn get_skip_folders<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<Vec<String>, sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let skip_folders = sqlx::query_as::<_, SkipFolders>(queries::GET_SKIP_FOLDERS).fetch_one(&pool).await?;
    pool.close().await;
    Ok(skip_folders.get_skip_folder_list())
}

pub async fn update_hide_side_panel<R: Runtime>(app: &tauri::AppHandle<R>, hide_panel: &i32) -> Result<(), sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(queries::UPDATE_HIDE_PANEL)
        .bind(hide_panel)
        .execute(&pool)
        .await?;
    pool.close().await;
    Ok(())
}

pub async fn change_card_size<R: Runtime>(app: &tauri::AppHandle<R>, width: &i32, height: &i32) -> Result<(), sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(queries::CHANGE_CARD_SIZE)
        .bind(width)
        .bind(height)
        .execute(&pool)
        .await?;
    pool.close().await;
    Ok(())
}

pub async fn update_skip_folders<R: Runtime>(app: &tauri::AppHandle<R>, skip_folders: &str) -> Result<(), sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(queries::UPDATE_SKIP_FOLDERS)
        .bind(skip_folders)
        .execute(&pool)
        .await?;
    pool.close().await;
    Ok(())
}

pub async fn insert_folder_data<R: Runtime>(app: &tauri::AppHandle<R>, folder_name: &str, data: &Value, path: &str) -> Result<(), sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(queries::INSERT_NEW_FOLDER_DATA)
        .bind(folder_name)
        .bind(format!("{}", data))
        .bind(path)
        .execute(&pool)
        .await?;
    pool.close().await;
    Ok(())
}

pub async fn get_folder_list<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<Value, sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let folder_list = sqlx::query_as::<_, Folder>(queries::GET_FOLDER_LIST)
        .fetch_all(&pool)
        .await?;
    pool.close().await;
    Ok(json!(folder_list))
}

pub async fn get_folder_info<R: Runtime>(app: &tauri::AppHandle<R>, position: &i32) -> Result<Value, sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let folder_info = sqlx::query_as::<_, Folder>(queries::GET_FOLDER_INFO)
        .bind(position)
        .fetch_one(&pool)
        .await?;
    pool.close().await;
    Ok(json!(folder_info))
}

pub async fn get_folder_data<R: Runtime>(app: &tauri::AppHandle<R>, position: &i32) -> Result<Value, sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let folder_data = sqlx::query_as::<_, FolderData>(queries::GET_FOLDER_DATA)
        .bind(position)
        .fetch_one(&pool)
        .await?;
    pool.close().await;

    let app_dir = app.path_resolver().app_data_dir().unwrap();
    Ok(folder_data.to_json(app_dir.to_str().unwrap().to_string()))
}

pub async fn update_folder_data<R: Runtime>(app: &tauri::AppHandle<R>, folder_name: &str, data: &Value) -> Result<(), sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(queries::UPDATE_FOLDER_DATA)
        .bind(format!("{}", data))
        .bind(folder_name)
        .execute(&pool)
        .await?;
    pool.close().await;
    Ok(())
}

pub async fn update_sort_type<R: Runtime>(app: &tauri::AppHandle<R>, position: &i32, sort_type: &String) -> Result<(), sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(queries::UPDATE_SORT_TYPE)
        .bind(sort_type)
        .bind(position)
        .execute(&pool)
        .await?;
    pool.close().await;
    Ok(())
}

pub async fn update_folder_path<R: Runtime>(app: &tauri::AppHandle<R>, position: &i32, path: &String) -> Result<(), sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(queries::UPDATE_FOLDER_PATH)
        .bind(path)
        .bind(position)
        .execute(&pool)
        .await?;
    pool.close().await;
    Ok(())
}

pub async fn reorder_folder<R: Runtime>(app: &tauri::AppHandle<R>, folder_name: &[&str]) -> Result<(), sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    for i in 0..folder_name.len() {
        let _ = sqlx::query(queries::UPDATE_FOLDER_POSITION)
            .bind(i as i32)
            .bind(folder_name[i])
            .execute(&pool)
            .await?;
    }
    pool.close().await;
    Ok(())
}

pub async fn delete_folder<R: Runtime>(app: &tauri::AppHandle<R>, name: &str, position: &i32) -> Result<(), sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(queries::DELETE_FOLDER)
        .bind(name)
        .bind(position)
        .execute(&pool)
        .await?;
    pool.close().await;
    pool.close().await;
    Ok(())
}
