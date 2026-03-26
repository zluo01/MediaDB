use crate::db::queries;
use crate::model::database::{Folder, FolderData, Media, Setting, Tag};
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
    sqlx::query(&queries::CREAT_TABLE_QUERY)
        .execute(&pool)
        .await?;
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
    if data.is_empty() {
        return Ok(());
    }

    let mut tx = pool.begin().await?;
    sqlx::query(queries::CLEAR_MEDIA)
        .bind(folder_name)
        .execute(&mut *tx)
        .await?;
    sqlx::query(queries::CLEAR_TAGS)
        .bind(folder_name)
        .execute(&mut *tx)
        .await?;

    // Batch insert all media items
    let placeholders: Vec<&str> = data.iter().map(|_| "(?,?,?,?,?,?,?,?)").collect();
    let sql = format!(
        "INSERT INTO media (type, path, title, posters, year, file, seasons, folder) VALUES {}",
        placeholders.join(",")
    );

    let mut query = sqlx::query(&sql);
    for media in data {
        query = query
            .bind(media.media_type())
            .bind(media.path())
            .bind(media.title())
            .bind(media.posters())
            .bind(media.year())
            .bind(media.file())
            .bind(media.seasons())
            .bind(folder_name);
    }
    query.execute(&mut *tx).await?;

    // Batch insert tags for each media item
    for media in data {
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
    filter_type: u8,
    tags: &[Tag],
) -> Result<Vec<Media>, sqlx::Error> {
    let folder_info = get_folder_info(pool, position).await?;
    let folder_name = folder_info.folder_name();
    let tags_json = serde_json::to_string(tags).unwrap_or_else(|_| "[]".to_string());

    let media_list = sqlx::query(queries::GET_FOLDER_CONTENT)
        .bind(&tags_json)
        .bind(position)
        .bind(filter_type)
        .fetch_all(pool)
        .await?
        .iter()
        .map(|r| Media::from_row(r, server_port, folder_name))
        .collect::<Result<Vec<_>, _>>()?;
    Ok(media_list)
}

pub async fn get_folder_media_tags(
    pool: &Pool<Sqlite>,
    position: &i32,
) -> Result<Vec<Value>, sqlx::Error> {
    let rows = sqlx::query(queries::TAGS_IN_FOLDER)
        .bind(position)
        .fetch_all(pool)
        .await?;

    let result = rows
        .iter()
        .map(|r| {
            let label: String = r.get("label");
            let options_str: String = r.get("options");
            let options: Value = serde_json::from_str(&options_str).unwrap_or(json!([]));
            json!({ "label": label, "options": options })
        })
        .collect();

    Ok(result)
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

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::SqlitePool;

    fn tag(group: &str, label: &str) -> Tag {
        serde_json::from_value(json!({"group": group, "label": label})).unwrap()
    }

    async fn setup_pool() -> Pool<Sqlite> {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(queries::CREAT_TABLE_QUERY)
            .execute(&pool)
            .await
            .unwrap();
        pool
    }

    async fn seed_data(pool: &Pool<Sqlite>) {
        // Insert a folder
        sqlx::query("INSERT INTO folders (folder_name, position, path) VALUES ('Movie', 0, '/movies')")
            .execute(pool)
            .await
            .unwrap();

        // Insert media
        let media = [
            (0, "John Wick", "John Wick", r#"{"main":"poster.jpg"}"#, "2014", "John Wick.mkv"),
            (0, "The Dark Knight", "The Dark Knight", r#"{"main":"poster.jpg"}"#, "2008", "The Dark Knight.mkv"),
            (0, "Blade Runner", "Blade Runner", r#"{"main":"poster.jpg"}"#, "1982", "Blade Runner.mkv"),
            (0, "Dune", "Dune", r#"{"main":"poster.jpg"}"#, "2021", "Dune.mkv"),
            (0, "Love Letter", "Love Letter", r#"{"main":"poster.jpg"}"#, "1995", "Love Letter.mp4"),
        ];
        for (t, path, title, posters, year, file) in media {
            sqlx::query(
                "INSERT INTO media (type, path, title, posters, year, file, seasons, folder) VALUES (?,?,?,?,?,?,'','Movie')",
            )
            .bind(t)
            .bind(path)
            .bind(title)
            .bind(posters)
            .bind(year)
            .bind(file)
            .execute(pool)
            .await
            .unwrap();
        }

        // Insert tags
        let tags = [
            // John Wick: Action, Thriller
            ("John Wick", "genres", "Action"),
            ("John Wick", "genres", "Thriller"),
            ("John Wick", "actors", "Keanu Reeves"),
            ("John Wick", "studios", "Summit Entertainment"),
            // The Dark Knight: Action, Crime, Drama
            ("The Dark Knight", "genres", "Action"),
            ("The Dark Knight", "genres", "Crime"),
            ("The Dark Knight", "genres", "Drama"),
            ("The Dark Knight", "actors", "Christian Bale"),
            ("The Dark Knight", "studios", "Warner Bros"),
            // Blade Runner: Thriller, Sci-Fi
            ("Blade Runner", "genres", "Thriller"),
            ("Blade Runner", "genres", "Sci-Fi"),
            ("Blade Runner", "actors", "Harrison Ford"),
            // Dune: Action, Sci-Fi, Drama
            ("Dune", "genres", "Action"),
            ("Dune", "genres", "Sci-Fi"),
            ("Dune", "genres", "Drama"),
            ("Dune", "studios", "Warner Bros"),
            // Love Letter: Drama, Romance (no action, no thriller)
            ("Love Letter", "genres", "Drama"),
            ("Love Letter", "genres", "Romance"),
        ];
        for (path, t, name) in tags {
            sqlx::query(
                "INSERT INTO tags (folder_name, path, t, name) VALUES ('Movie',?,?,?)",
            )
            .bind(path)
            .bind(t)
            .bind(name)
            .execute(pool)
            .await
            .unwrap();
        }
    }

    // -- get_folder_media_tags --

    #[tokio::test]
    async fn media_tags_returns_grouped_tags() {
        let pool = setup_pool().await;
        seed_data(&pool).await;

        let result = get_folder_media_tags(&pool, &0).await.unwrap();

        // Should have groups: actors, genres, studios (alphabetical from SQL ORDER BY)
        let labels: Vec<&str> = result.iter().map(|v| v["label"].as_str().unwrap()).collect();
        assert_eq!(labels, vec!["actors", "genres", "studios"]);

        // Genres should contain all distinct genre tags, sorted
        let genres: Vec<&str> = result
            .iter()
            .find(|v| v["label"] == "genres")
            .unwrap()["options"]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v["label"].as_str().unwrap())
            .collect();
        assert_eq!(
            genres,
            vec!["Action", "Crime", "Drama", "Romance", "Sci-Fi", "Thriller"]
        );
    }

    #[tokio::test]
    async fn media_tags_empty_folder_returns_empty() {
        let pool = setup_pool().await;
        // Insert folder with no media
        sqlx::query("INSERT INTO folders (folder_name, position, path) VALUES ('Empty', 1, '/empty')")
            .execute(&pool)
            .await
            .unwrap();

        let result = get_folder_media_tags(&pool, &1).await.unwrap();
        assert!(result.is_empty());
    }

    // -- get_folder_media (tag filtering) --

    #[tokio::test]
    async fn folder_media_no_tags_returns_all() {
        let pool = setup_pool().await;
        seed_data(&pool).await;

        let result = get_folder_media(&pool, &0, &8080, 0, &[]).await.unwrap();
        assert_eq!(result.len(), 5);
    }

    #[tokio::test]
    async fn folder_media_or_filter_single_tag() {
        let pool = setup_pool().await;
        seed_data(&pool).await;

        // OR filter with Action genre -> John Wick, The Dark Knight, Dune
        let tags = vec![tag("genres", "Action")];
        let result = get_folder_media(&pool, &0, &8080, 0, &tags).await.unwrap();
        let titles: Vec<&str> = result.iter().map(|m| m.title()).collect();
        assert_eq!(titles.len(), 3);
        assert!(titles.contains(&"John Wick"));
        assert!(titles.contains(&"The Dark Knight"));
        assert!(titles.contains(&"Dune"));
    }

    #[tokio::test]
    async fn folder_media_or_filter_multiple_tags_same_group() {
        let pool = setup_pool().await;
        seed_data(&pool).await;

        // OR filter: Action OR Thriller -> any media with at least one
        // John Wick (Action+Thriller), Dark Knight (Action), Blade Runner (Thriller), Dune (Action)
        let tags = vec![tag("genres", "Action"), tag("genres", "Thriller")];
        let result = get_folder_media(&pool, &0, &8080, 0, &tags).await.unwrap();
        let titles: Vec<&str> = result.iter().map(|m| m.title()).collect();
        assert_eq!(titles.len(), 4);
        assert!(titles.contains(&"John Wick"));
        assert!(titles.contains(&"The Dark Knight"));
        assert!(titles.contains(&"Blade Runner"));
        assert!(titles.contains(&"Dune"));
        // Love Letter has no Action or Thriller
        assert!(!titles.contains(&"Love Letter"));
    }

    #[tokio::test]
    async fn folder_media_and_filter_multiple_tags_same_group() {
        let pool = setup_pool().await;
        seed_data(&pool).await;

        // AND filter: Action AND Thriller -> must have both
        // Only John Wick has both Action + Thriller
        let tags = vec![tag("genres", "Action"), tag("genres", "Thriller")];
        let result = get_folder_media(&pool, &0, &8080, 1, &tags).await.unwrap();
        let titles: Vec<&str> = result.iter().map(|m| m.title()).collect();
        assert_eq!(titles, vec!["John Wick"]);
    }

    #[tokio::test]
    async fn folder_media_or_filter_across_groups() {
        let pool = setup_pool().await;
        seed_data(&pool).await;

        // OR filter: genres=Romance + studios=Warner Bros
        // Must match at least one from each group that has filter tags
        // Romance: Love Letter
        // Warner Bros: The Dark Knight, Dune
        // No overlap -> empty (each group must pass independently)
        let tags = vec![tag("genres", "Romance"), tag("studios", "Warner Bros")];
        let result = get_folder_media(&pool, &0, &8080, 0, &tags).await.unwrap();
        let titles: Vec<&str> = result.iter().map(|m| m.title()).collect();
        // Must satisfy both groups: Romance genre AND Warner Bros studio
        // No movie has both -> empty
        assert!(titles.is_empty());
    }

    #[tokio::test]
    async fn folder_media_or_filter_across_groups_with_matches() {
        let pool = setup_pool().await;
        seed_data(&pool).await;

        // OR filter: genres=Drama + studios=Warner Bros
        // Drama: Dark Knight, Dune, Love Letter
        // Warner Bros: Dark Knight, Dune
        // Intersection (must pass both groups): Dark Knight, Dune
        let tags = vec![tag("genres", "Drama"), tag("studios", "Warner Bros")];
        let result = get_folder_media(&pool, &0, &8080, 0, &tags).await.unwrap();
        let titles: Vec<&str> = result.iter().map(|m| m.title()).collect();
        assert_eq!(titles.len(), 2);
        assert!(titles.contains(&"The Dark Knight"));
        assert!(titles.contains(&"Dune"));
    }

    #[tokio::test]
    async fn folder_media_no_match_returns_empty() {
        let pool = setup_pool().await;
        seed_data(&pool).await;

        let tags = vec![tag("genres", "Horror")];
        let result = get_folder_media(&pool, &0, &8080, 0, &tags).await.unwrap();
        assert!(result.is_empty());
    }
}
