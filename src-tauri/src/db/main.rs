use sqlx::{migrate::MigrateDatabase, Sqlite, SqlitePool, Row};
use std::fs;
use std::result::Result;
use serde_json::{json, Value};
use tauri::{
    Runtime,
};
use crate::db::queries;

pub fn initialize<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<(), String> {
    tauri::async_runtime::block_on(async move {
        let app_dir = app.path_resolver().app_data_dir().unwrap();
        fs::create_dir_all(app_dir).expect("Fail to create App directory.");

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
    let settings = sqlx::query(queries::GET_SETTINGS).fetch_one(&pool).await?;
    pool.close().await;
    if settings.is_empty() {
        panic!("No setting is found.")
    }
    let should_hide: i32 = settings.get(0);
    let width: i32 = settings.get(1);
    let height: i32 = settings.get(2);
    let card_size = json!({
        "width": width,
        "height": height
    });
    Ok(json!({
        "showSidePanel": should_hide == 0,
        "cardSize": card_size,
    }))
}

pub async fn update_hide_side_panel<R: Runtime>(app: &tauri::AppHandle<R>, hide_panel: i32) -> Result<(), sqlx::Error> {
    let db_url = get_database_path(&app);
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(queries::UPDATE_HIDE_PANEL)
        .bind(hide_panel)
        .execute(&pool)
        .await?;
    pool.close().await;
    Ok(())
}

pub async fn change_card_size<R: Runtime>(app: &tauri::AppHandle<R>, width: i32, height: i32) -> Result<(), sqlx::Error> {
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
