use crate::db::queries;
use crate::helper::main::group_tags;
use crate::model::database::{Folder, FolderData, Media, MediaTag, Setting, Tag};
use crate::model::parser::MediaItem;
use log::{debug, error};
use serde_json::{json, Value};
use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePoolOptions, Pool, Row, Sqlite, SqlitePool};
use std::fs;
use std::result::Result;
use tauri::{Manager, Runtime};

pub fn initialize<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<(), String> {
    tauri::async_runtime::block_on(async move {
        let app_dir = app.path().app_data_dir().unwrap();
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
                let err_msg = format!(
                    "Fail to create tables. Error: {:?}",
                    e.into_database_error()
                );
                error!("{:?}", err_msg);
                return Err(err_msg);
            }
        }
        Ok(())
    })
}

async fn create_tables(db_url: &str) -> Result<(), sqlx::Error> {
    let pool = SqlitePool::connect(&db_url).await?;
    let _ = sqlx::query(&queries::CREAT_TABLE_QUERY)
        .execute(&pool)
        .await;
    pool.close().await;
    Ok(())
}

pub fn get_database_path<R: Runtime>(app: &tauri::AppHandle<R>) -> String {
    let app_dir = app.path().app_data_dir().unwrap();
    format!("sqlite://{}/sqlite.db", app_dir.display()).to_string()
}

pub async fn create_pool(db_path: &str) -> Result<Pool<Sqlite>, sqlx::Error> {
    let pool = SqlitePoolOptions::new()
        .max_connections(10)
        .connect(db_path)
        .await?;
    Ok(pool)
}

pub async fn get_settings(pool: &Pool<Sqlite>) -> Result<Setting, sqlx::Error> {
    let settings = sqlx::query_as::<_, Setting>(queries::GET_SETTINGS)
        .fetch_one(pool)
        .await?;
    Ok(settings)
}

pub async fn get_skip_folders(pool: &Pool<Sqlite>) -> Result<Vec<String>, sqlx::Error> {
    let skip_folders = sqlx::query(queries::GET_SKIP_FOLDERS)
        .fetch_one(pool)
        .await?;
    Ok(skip_folders
        .get::<String, usize>(0)
        .split(",")
        .map(|v| v.trim().to_string())
        .collect())
}

pub async fn update_hide_side_panel(
    pool: &Pool<Sqlite>,
    hide_panel: &i32,
) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_HIDE_PANEL)
        .bind(hide_panel)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_skip_folders(
    pool: &Pool<Sqlite>,
    skip_folders: &str,
) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_SKIP_FOLDERS)
        .bind(skip_folders)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn insert_folder_data(
    pool: &Pool<Sqlite>,
    folder_name: &str,
    path: &str,
) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::INSERT_NEW_FOLDER_DATA)
        .bind(folder_name)
        .bind(path)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn get_folder_list(pool: &Pool<Sqlite>) -> Result<Vec<Folder>, sqlx::Error> {
    let folder_list = sqlx::query_as::<_, Folder>(queries::GET_FOLDER_LIST)
        .fetch_all(pool)
        .await?;
    Ok(folder_list)
}

pub async fn get_folder_info(pool: &Pool<Sqlite>, position: &i32) -> Result<Folder, sqlx::Error> {
    let folder_info = sqlx::query_as::<_, Folder>(queries::GET_FOLDER_INFO)
        .bind(position)
        .fetch_one(pool)
        .await?;
    Ok(folder_info)
}

pub async fn get_folder_data(
    pool: &Pool<Sqlite>,
    position: &i32,
) -> Result<FolderData, sqlx::Error> {
    let folder_data = sqlx::query_as::<_, FolderData>(queries::GET_FOLDER_DATA)
        .bind(position)
        .fetch_one(pool)
        .await?;
    Ok(folder_data)
}

pub async fn insert_new_media(
    pool: &Pool<Sqlite>,
    folder_name: &str,
    data: &Vec<MediaItem>,
) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;
    sqlx::query(queries::CLEAR_MEDIA)
        .bind(folder_name)
        .execute(&mut *tx)
        .await?;
    sqlx::query(queries::CLEAR_TAGS)
        .bind(folder_name)
        .execute(&mut *tx)
        .await?;

    for media in data {
        sqlx::query(queries::INSERT_NEW_MEDIA)
            .bind(media.media_type())
            .bind(media.path())
            .bind(media.title())
            .bind(media.posters())
            .bind(media.year())
            .bind(media.file())
            .bind(media.seasons())
            .bind(folder_name)
            .execute(&mut *tx)
            .await?;

        insert_tags_batch(&mut tx, folder_name, media.path(), media.tags(), "tags").await?;
        insert_tags_batch(&mut tx, folder_name, media.path(), media.genres(), "genres").await?;
        insert_tags_batch(&mut tx, folder_name, media.path(), media.actors(), "actors").await?;
        insert_tags_batch(
            &mut tx,
            folder_name,
            media.path(),
            media.studios(),
            "studios",
        )
        .await?;
    }
    tx.commit().await?;
    Ok(())
}

async fn insert_tags_batch(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    folder_name: &str,
    path: &str,
    tags: &[String],
    tag_type: &str,
) -> Result<(), sqlx::Error> {
    if tags.is_empty() {
        return Ok(());
    }

    // Build batch insert: INSERT INTO tags (folder_name, path, name, t) VALUES (?,?,?,?),(?,?,?,?),...
    let placeholders: Vec<&str> = tags.iter().map(|_| "(?,?,?,?)").collect();
    let sql = format!(
        "INSERT INTO tags (folder_name, path, name, t) VALUES {} ON CONFLICT DO NOTHING",
        placeholders.join(",")
    );

    let mut query = sqlx::query(&sql);
    for tag in tags {
        query = query.bind(folder_name).bind(path).bind(tag).bind(tag_type);
    }
    query.execute(&mut **tx).await?;
    Ok(())
}

pub async fn get_folder_media(
    pool: &Pool<Sqlite>,
    position: &i32,
    server_port: &u16,
) -> Result<Vec<Media>, sqlx::Error> {
    let folder_info = get_folder_info(pool, &position).await?;
    let folder_name = folder_info.folder_name();

    let media_list = sqlx::query(queries::GET_FOLDER_CONTENT)
        .bind(position)
        .fetch_all(pool)
        .await?
        .iter()
        .map(|r| Media::from_row(r, server_port, folder_name))
        .collect::<Result<Vec<_>, _>>()?;
    Ok(media_list)
}

pub async fn get_tags_in_folder(
    pool: &Pool<Sqlite>,
    position: &i32,
) -> Result<Vec<MediaTag>, sqlx::Error> {
    let tags = sqlx::query_as::<_, MediaTag>(queries::GET_TAGS_IN_FOLDER)
        .bind(position)
        .fetch_all(pool)
        .await?;

    Ok(tags)
}

pub async fn get_folder_media_tags(
    pool: &Pool<Sqlite>,
    position: &i32,
) -> Result<Vec<Value>, sqlx::Error> {
    let tag_list = sqlx::query_as::<_, Tag>(queries::TAGS_IN_FOLDER)
        .bind(position)
        .fetch_all(pool)
        .await?;

    if tag_list.is_empty() {
        return Ok(vec![]);
    }
    let tag_groups = group_tags(&tag_list);
    let empty_tags: Vec<Tag> = vec![];
    Ok(vec![
        json!({
            "label": "genres",
            "options": tag_groups.get("genres").unwrap_or(&empty_tags)
        }),
        json!({
            "label": "actors",
            "options": tag_groups.get("actors").unwrap_or(&empty_tags)
        }),
        json!({
            "label": "studios",
            "options": tag_groups.get("studios").unwrap_or(&empty_tags)
        }),
        json!({
            "label": "tags",
            "options": tag_groups.get("tags").unwrap_or(&empty_tags)
        }),
    ])
}

pub async fn update_sort_type(
    pool: &Pool<Sqlite>,
    position: &i32,
    sort_type: &u8,
) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_SORT_TYPE)
        .bind(sort_type)
        .bind(position)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_folder_path(
    pool: &Pool<Sqlite>,
    position: &i32,
    path: &str,
) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_FOLDER_PATH)
        .bind(path)
        .bind(position)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn reorder_folder(pool: &Pool<Sqlite>, folder_name: &[&str]) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;
    for i in 0..folder_name.len() {
        let _ = sqlx::query(queries::UPDATE_FOLDER_POSITION)
            .bind(i as i32)
            .bind(folder_name[i])
            .execute(&mut *tx)
            .await?;
    }
    tx.commit().await?;
    Ok(())
}

pub async fn delete_folder(
    pool: &Pool<Sqlite>,
    name: &str,
    position: &i32,
) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;
    sqlx::query(queries::DELETE_FOLDER)
        .bind(name)
        .execute(&mut *tx)
        .await?;
    sqlx::query(queries::SHIFT_FOLDER_POSITIONS)
        .bind(position)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    Ok(())
}

pub async fn update_folder_status(
    pool: &Pool<Sqlite>,
    status: &u8,
    position: &i32,
) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_FOLDER_STATUS)
        .bind(status)
        .bind(position)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_folder_filter_type(
    pool: &Pool<Sqlite>,
    position: &i32,
) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_FOLDER_FILTER_TYPE)
        .bind(position)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn get_folder_position(
    pool: &Pool<Sqlite>,
    name: &str,
    path: &str,
) -> Result<i32, sqlx::Error> {
    let position = sqlx::query(queries::GET_FOLDER_POSITION)
        .bind(name)
        .bind(path)
        .fetch_one(pool)
        .await?;
    Ok(position.get(0))
}

pub async fn recover(pool: &Pool<Sqlite>) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::RECOVER).execute(pool).await?;
    Ok(())
}
