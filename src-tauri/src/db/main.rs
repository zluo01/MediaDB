use std::fs;
use std::result::Result;

use log::{debug, error};
use serde_json::{json, Value};
use sqlx::{migrate::MigrateDatabase, Pool, Sqlite, SqlitePool};
use tauri::Runtime;

use crate::db::queries;
use crate::db::types::{Folder, FolderData, Media, Position, Setting, SkipFolders, Tag};
use crate::parser::types::MediaItem;

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

pub async fn insert_folder_data(pool: &Pool<Sqlite>, folder_name: &str, path: &str) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::INSERT_NEW_FOLDER_DATA)
        .bind(folder_name)
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

pub async fn insert_new_media(pool: &Pool<Sqlite>, folder_name: &str, data: &Vec<MediaItem>) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;
    let _ = sqlx::query(queries::CLEAR_MEDIA)
        .bind(folder_name)
        .bind(folder_name)
        .execute(&mut *tx)
        .await?;
    for media in data {
        let _ = sqlx::query(queries::INSERT_NEW_MEDIA)
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

        for tag in media.tags() {
            let _ = sqlx::query(queries::INSERT_NEW_TAG)
                .bind(folder_name)
                .bind(media.path())
                .bind(tag)
                .bind("tags")
                .execute(&mut *tx)
                .await?;
        }

        for genre in media.genres() {
            let _ = sqlx::query(queries::INSERT_NEW_TAG)
                .bind(folder_name)
                .bind(media.path())
                .bind(genre)
                .bind("genres")
                .execute(&mut *tx)
                .await?;
        }

        for actor in media.actors() {
            let _ = sqlx::query(queries::INSERT_NEW_TAG)
                .bind(folder_name)
                .bind(media.path())
                .bind(actor)
                .bind("actors")
                .execute(&mut *tx)
                .await?;
        }

        for studio in media.studios() {
            // folder_name, path, name, t
            let _ = sqlx::query(queries::INSERT_NEW_TAG)
                .bind(folder_name)
                .bind(media.path())
                .bind(studio)
                .bind("studios")
                .execute(&mut *tx)
                .await?;
        }
    }
    tx.commit().await?;
    Ok(())
}

//     SELECT media.type as t, media.path, media.title, media.posters, media.year, media.file, media.seasons
//     FROM media
//              JOIN folders ON media.folder = folders.folder_name
//              JOIN tags ON media.path = tags.path
//     WHERE folders.position = ?
//       AND title LIKE ? COLLATE NOCASE
//       {} -- Filter query
//     ORDER BY CASE
//                  WHEN folders.sort_type = 2 THEN media.title
//                  WHEN folders.sort_type = 4 THEN media.year
//                  END DESC,
//              CASE
//                  WHEN folders.sort_type = 1 THEN media.title
//                  WHEN folders.sort_type = 3 THEN media.year
//                  ELSE media.path
//                  END;
pub async fn get_folder_media(pool: &Pool<Sqlite>, position: &i32, key: &str, filter_tags: &Vec<Tag>) -> Result<Vec<Value>, sqlx::Error> {
    // construct query
    let mut query = String::from(
        "SELECT DISTINCT media.type as t, media.path, media.title, media.posters, media.year, media.file, media.seasons
        FROM media
        JOIN folders ON media.folder = folders.folder_name");
    // only join when we need to do filtering such that 
    // for media like comic that does not have tag information
    // will not be filtered out during query
    // since there is no tag for comic, 
    // hence impossible to filter any comic through frontend
    if !filter_tags.is_empty() {
        query.push_str(" JOIN tags ON media.path = tags.path");
    }
    query.push_str(" WHERE folders.position = ? AND title LIKE ? COLLATE NOCASE");

    let filter_query = if !filter_tags.is_empty() {
        let tag_groups = filter_tags.iter()
            .fold(std::collections::HashMap::new(), |mut acc, tag| {
                acc.entry(tag.tag())
                    .or_insert_with(Vec::new)
                    .push(tag);
                acc
            });

        let mut q = String::from(" AND (");
        let filter_query = tag_groups.iter()
            .map(|(tag_label, tags)| format!("(tags.t = '{}' AND tags.name IN ({}))",
                                             tag_label,
                                             tags.iter().map(|t| format!("\'{}\'", t.value())).collect::<Vec<_>>().join(",")))
            .collect::<Vec<_>>()
            .join("OR");
        q.push_str(&filter_query);
        q.push_str(")");
        q
    } else {
        String::from("")
    };

    query.push_str(&filter_query);
    query.push_str(
        " ORDER BY CASE
             WHEN folders.sort_type = 2 THEN media.title
             WHEN folders.sort_type = 4 THEN media.year
             END DESC,
             CASE
                 WHEN folders.sort_type = 1 THEN media.title
                 WHEN folders.sort_type = 3 THEN media.year
                 ELSE media.path
             END",
    );
    let media_list = sqlx::query_as::<_, Media>(query.as_str())
        .bind(position)
        .bind(format!("%{}%", key))
        .fetch_all(pool)
        .await?;

    Ok(media_list.into_iter().map(|o| o.to_json()).collect())
}

pub async fn get_folder_media_tags(pool: &Pool<Sqlite>, position: &i32) -> Result<Vec<Value>, sqlx::Error> {
    let tag_list = sqlx::query_as::<_, Tag>(queries::TAGS_IN_FOLDER)
        .bind(position)
        .fetch_all(pool)
        .await?;

    let tag_groups = tag_list.iter()
        .fold(std::collections::HashMap::new(), |mut acc, tag| {
            acc.entry(tag.tag())
                .or_insert_with(Vec::new)
                .push(tag);
            acc
        });

    if tag_groups.is_empty() {
        return Ok(vec![]);
    }
    let empty_tags: Vec<&Tag> = vec![];
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

pub async fn update_sort_type(pool: &Pool<Sqlite>, position: &i32, sort_type: &u8) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::UPDATE_SORT_TYPE)
        .bind(sort_type)
        .bind(position)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_folder_path(pool: &Pool<Sqlite>, position: &i32, path: &str) -> Result<(), sqlx::Error> {
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

pub async fn delete_folder(pool: &Pool<Sqlite>, name: &str, position: &i32) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::DELETE_FOLDER)
        .bind(name)
        .bind(position)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_folder_status(pool: &Pool<Sqlite>, status: &u8, position: &i32) -> Result<(), sqlx::Error> {
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

pub async fn recover(pool: &Pool<Sqlite>) -> Result<(), sqlx::Error> {
    let _ = sqlx::query(queries::RECOVER)
        .execute(pool)
        .await?;
    Ok(())
}
