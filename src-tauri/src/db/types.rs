use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(sqlx::FromRow)]
#[derive(Serialize, Deserialize)]
pub struct Setting {
    hide: i32,
    width: i32,
    height: i32,
}

impl Setting {
    pub fn to_json(&self) -> Value {
        let card_size = json!({
            "width" : self.width,
            "height": self.height
        });
        json!({
            "showSidePanel": self.hide == 0,
            "cardSize": card_size
        })
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
