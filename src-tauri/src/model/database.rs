use serde::{Deserialize, Serialize, Serializer};
use serde_json::{json, Value};

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Setting {
    hide_panel: i32,
    skip_folders: String,
}

impl Setting {
    pub fn to_json(&self) -> Value {
        json!({
            "showSidePanel": self.hide_panel == 0,
            "skipFolders": self.to_skip_folder_list()
        })
    }

    fn to_skip_folder_list(&self) -> Vec<String> {
        if self.skip_folders.is_empty() {
            return vec![];
        }
        self.skip_folders
            .split(",")
            .map(|v| v.trim().to_string())
            .collect()
    }
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Folder {
    #[serde(rename = "name")]
    folder_name: String,
    path: String,
    position: i32,
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

pub struct MediaResponse {
    pub(crate) media_list: Vec<Media>,
    pub(crate) tags: Vec<MediaTag>,
    pub(crate) filter_type: u8,
}

impl MediaResponse {
    pub fn new(media_list: Vec<Media>, tags: Vec<MediaTag>, filter_type: u8) -> Self {
        Self {
            media_list,
            tags,
            filter_type,
        }
    }
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

impl Media {
    pub fn path(&self) -> &str {
        &self.path
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
