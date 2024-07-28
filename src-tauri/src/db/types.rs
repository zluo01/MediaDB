use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(sqlx::FromRow)]
#[derive(Serialize, Deserialize)]
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
        return self.skip_folders.split(",").map(|v| v.trim().to_string()).collect();
    }
}

#[derive(sqlx::FromRow)]
#[derive(Serialize, Deserialize)]
pub struct SkipFolders {
    skip_folders: String,
}

impl SkipFolders {
    pub fn get_skip_folder_list(&self) -> Vec<String> {
        return self.skip_folders.split(",").map(|v| v.trim().to_string()).collect();
    }
}

#[derive(sqlx::FromRow)]
#[derive(Serialize, Deserialize)]
pub struct Position {
    position: i32,
}

impl Position {
    pub fn position(&self) -> i32 {
        self.position
    }
}

#[derive(sqlx::FromRow)]
#[derive(Serialize, Deserialize)]
pub struct Folder {
    #[serde(rename = "name")]
    folder_name: String,
    path: String,
    position: i32,
}

#[derive(sqlx::FromRow, Debug)]
#[derive(Serialize, Deserialize)]
pub struct FolderData {
    folder_name: String,
    sort_type: u8,
    filter_type: u8,
    path: String,
    position: i32,
    status: u8,
}

impl FolderData {
    pub fn to_json(&self, app_dir: String) -> Value {
        json!({
            "name": self.folder_name,
            "sort": self.sort_type,
            "filterType": self.filter_type,
            "path": self.path,
            "appDir": app_dir,
            "position": self.position,
            "status": self.status
        })
    }
}

#[derive(sqlx::FromRow)]
#[derive(Serialize, Deserialize)]
pub struct Media {
    t: u8,
    path: String,
    title: String,
    posters: String,
    year: String,
    file: String,
    seasons: String,
}

impl Media {
    pub fn to_json(&self) -> Value {
        let mut data = serde_json::Map::new();
        data.insert("type".to_string(), Value::from(self.t));
        data.insert("path".to_string(), Value::String(self.path.clone()));
        data.insert("title".to_string(), Value::String(self.title.clone()));

        let posters: Value = serde_json::from_str(self.posters.as_str()).unwrap();
        data.insert("posters".to_string(), posters);

        data.insert("year".to_string(), Value::String(self.year.clone()));
        data.insert("file".to_string(), Value::String(self.file.clone()));

        if !self.seasons.is_empty() {
            let seasons: Value = serde_json::from_str(self.seasons.as_str()).unwrap();
            data.insert("seasons".to_string(), seasons);
        }

        Value::Object(data)
    }
}


#[derive(sqlx::FromRow)]
#[derive(Serialize, Deserialize)]
pub struct Tag {
    tag: String,
    value: String,
    label: String,
}

impl Tag {
    pub fn tag(&self) -> &str {
        &self.tag
    }

    pub fn value(&self) -> &str {
        &self.value
    }
}
