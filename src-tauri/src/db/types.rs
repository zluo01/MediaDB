use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(sqlx::FromRow)]
#[derive(Serialize, Deserialize)]
pub struct Setting {
    hide_panel: i32,
    card_width: i32,
    card_height: i32,
    skip_folders: String,
}

impl Setting {
    pub fn to_json(&self) -> Value {
        let card_size = json!({
            "width" : self.card_width,
            "height": self.card_height
        });

        json!({
            "showSidePanel": self.hide_panel == 0,
            "cardSize": card_size,
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
pub struct Folder {
    #[serde(rename = "name")]
    folder_name: String,
    path: String,
    position: i32,
}

#[derive(sqlx::FromRow)]
#[derive(Serialize, Deserialize)]
pub struct FolderData {
    folder_name: String,
    data: String,
    sort_type: String,
    path: String,
    position: i32,
}

impl FolderData {
    pub fn to_json(&self, app_dir: String) -> Value {
        let v: Value = serde_json::from_str(self.data.as_str()).unwrap();
        match v {
            Value::Object(m) => {
                let mut m = m;
                m.insert(String::from("name"), Value::String(self.folder_name.to_string()));
                m.insert(String::from("sort"), Value::String(self.sort_type.to_string()));
                m.insert(String::from("path"), Value::String(self.path.to_string()));
                m.insert(String::from("appDir"), Value::String(app_dir));
                m.insert(String::from("position"), Value::from(self.position));
                Value::Object(m)
            }
            v => v,
        }
    }
}
