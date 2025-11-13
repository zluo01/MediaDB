use crate::helper::main::get_cached_image_path;
use crate::model::parser::MediaType;
use serde::{Deserialize, Serialize, Serializer};
use serde_json::{json, Value};
use sqlx::sqlite::SqliteRow;
use sqlx::Row;
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Setting {
    #[serde(rename = "showSidePanel")]
    #[serde(serialize_with = "serialize_bool_number")]
    hide_panel: i32,
    #[serde(rename = "skipFolders")]
    #[serde(serialize_with = "serialize_string_list")]
    skip_folders: String,
}

fn serialize_bool_number<S>(v: &i32, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let ret = v == &0i32;
    ret.serialize(serializer)
}

fn serialize_string_list<S>(v: &String, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    if v.is_empty() {
        let v: Vec<String> = vec![];
        v.serialize(serializer)
    } else {
        v.split(",")
            .map(|v| v.trim().to_string())
            .collect::<Vec<String>>()
            .serialize(serializer)
    }
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Folder {
    #[serde(rename = "name")]
    folder_name: String,
    path: String,
    position: i32,
}

impl Folder {
    pub fn folder_name(&self) -> &str {
        &self.folder_name
    }
}

#[derive(sqlx::FromRow, Debug, Serialize, Deserialize)]
pub struct FolderData {
    #[serde(rename = "name")]
    folder_name: String,
    #[serde(rename = "sort")]
    sort_type: u8,
    #[serde(rename = "filterType")]
    filter_type: u8,
    path: String,
    position: i32,
    status: u8,
}

#[derive(sqlx::FromRow, Debug, Serialize, Deserialize)]
pub struct Media {
    #[serde(rename(serialize = "type"))]
    t: u8,
    path: String,
    title: String,
    posters: Value,
    year: String,
    file: String,
    #[serde(serialize_with = "serialize_json_string")]
    seasons: String,
}

impl Media {
    pub fn from_row(
        row: &SqliteRow,
        app_dir: &str,
        folder_name: &str,
    ) -> Result<Self, sqlx::Error> {
        let media_type = row.try_get::<u8, _>("t")?;
        let path = row.try_get::<String, _>("path")?;
        let posters = construct_posters_map(
            &media_type,
            app_dir,
            folder_name,
            &path,
            &row.try_get::<String, _>("posters")?,
        );
        Ok(Media {
            t: media_type,
            path,
            title: row.try_get("title")?,
            posters,
            year: row.try_get("year")?,
            file: row.try_get("file")?,
            seasons: row.try_get("seasons")?,
        })
    }
}

fn construct_posters_map(
    media_type: &u8,
    app_dir: &str,
    folder_name: &str,
    file_path: &String,
    payload: &String,
) -> Value {
    if payload.is_empty() {
        return json!({});
    }

    let posters_map: HashMap<String, String> =
        serde_json::from_str(payload.as_str()).unwrap_or_default();

    let media_type_enum: MediaType = (*media_type).into();

    let posters = posters_map
        .into_iter()
        .map(|(k, v)| {
            let value = match media_type_enum {
                MediaType::Movie | MediaType::TvShow => get_cached_image_path(
                    app_dir,
                    folder_name,
                    PathBuf::from(&file_path).join(v).to_str().unwrap(),
                ),
                MediaType::Comic => get_cached_image_path(app_dir, folder_name, v.as_str()),
                _ => v,
            };
            (k, Value::String(value))
        })
        .collect();

    Value::Object(posters)
}

fn serialize_json_string<S>(v: &String, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    if v.is_empty() {
        let v: Value = json!("{}");
        v.serialize(serializer)
    } else {
        let value: Value = serde_json::from_str(v.as_str()).unwrap();
        value.serialize(serializer)
    }
}

#[derive(sqlx::FromRow, Clone, Debug)]
pub struct MediaTag {
    path: String,
    tag_group: String,
    tag_label: String,
}

impl MediaTag {
    pub fn path(&self) -> &str {
        &self.path
    }
}

#[derive(sqlx::FromRow, Clone, Serialize, Deserialize, Eq, PartialEq, Hash, Debug)]
pub struct Tag {
    #[serde(rename = "group")]
    tag_group: String,
    #[serde(rename = "label")]
    tag_label: String,
}

pub trait TagBase {
    fn key(&self) -> &str;
    fn to_tag(&self) -> Tag;
}

impl TagBase for MediaTag {
    fn key(&self) -> &str {
        &self.tag_group
    }

    fn to_tag(&self) -> Tag {
        Tag {
            tag_group: self.tag_group.clone(),
            tag_label: self.tag_label.clone(),
        }
    }
}

impl TagBase for Tag {
    fn key(&self) -> &str {
        &self.tag_group
    }

    fn to_tag(&self) -> Tag {
        Tag {
            tag_group: self.tag_group.clone(),
            tag_label: self.tag_label.clone(),
        }
    }
}
