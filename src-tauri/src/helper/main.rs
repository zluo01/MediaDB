use crate::model::database::{Tag, TagBase};
use std::collections::HashMap;
use std::path::PathBuf;

pub fn group_tags<T: TagBase>(tags: &[T]) -> HashMap<&str, Vec<Tag>> {
    tags.iter().fold(HashMap::new(), |mut acc, tag| {
        acc.entry(tag.key())
            .or_insert_with(Vec::new)
            .push(tag.to_tag());
        acc
    })
}

pub fn get_cached_image_path(server_port: &u16, folder_name: &str, src: &str) -> String {
    let cleanup_image_path = src
        .replace('\\', "/")
        .replace(".jpg", "")
        .replace(".png", "")
        .replace(".jpeg", "")
        .replace(".bmp", "")
        .replace(".gif", "")
        .replace(".webp", "");

    let path = PathBuf::from("covers")
        .join(&folder_name)
        .join(&cleanup_image_path);

    let urlencoded_path = urlencoding::encode(path.to_str().unwrap());
    format!("http://127.0.0.1:{}/{}", server_port, urlencoded_path)
}
