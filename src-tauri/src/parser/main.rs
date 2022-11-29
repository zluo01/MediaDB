use std::collections::{HashMap, HashSet, VecDeque};
use std::ffi::OsString;
use std::fs;
use std::path::{Path, PathBuf};
use serde_json::{json, Value};
use tauri::api::notification::Notification;
use crate::parser::nfo_parser::parse_nfo;
use crate::parser::types::{Media, MediaSource, MediaType};
use crate::parser::utilities;

pub fn parse<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>, name: &str, path: &str) -> Result<Value, String> {
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    let (major_media, secondary_media) = read_dir(app_handle, path);
    let (data, posters) = aggregate_data(&major_media, &secondary_media);
    if let Err(e) = create_thumbnails(&app_dir, name, path, &posters) {
        return Err(e);
    }
    Ok(data)
}

fn read_dir<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>, path: &str) -> (Vec<Media>, Vec<Media>) {
    let root_path = Path::new(path);
    let mut queue = VecDeque::from([OsString::from(path)]);

    let mut major_media = Vec::new();
    let mut secondary_media = Vec::new();

    while !queue.is_empty() {
        let mut nfo_files = Vec::new();
        let mut media_source = MediaSource::default();

        let curr_dir = queue.pop_front();
        for entry in fs::read_dir(curr_dir.unwrap()).unwrap() {
            let entry = entry.unwrap();
            let path = entry.path();

            let file_name = path.file_name().unwrap();
            // check for hidden file
            if file_name.to_str().unwrap().as_bytes().starts_with(&[b'.']) {
                continue;
            }

            if path.is_dir() {
                queue.push_back(path.into_os_string());
                continue;
            }

            let relative_path = utilities::get_relative_path(path.as_path(), root_path);
            let extension = path.extension();
            if extension.is_none() {
                println!("File does not have proper extension. {}", &path.display());
                continue;
            }
            let ext = extension.unwrap().to_str().unwrap();
            match ext {
                "nfo" => nfo_files.push(relative_path.unwrap().into_os_string()),
                "jpg" | "png" => if file_name.to_str().unwrap().contains("poster") {
                    media_source.add_poster(relative_path.unwrap().into_os_string())
                },
                "m4v" | "avi" | "mpg" | "mp4" | "mkv" | "f4v" | "wmv" =>
                    media_source.add_media(relative_path.unwrap().into_os_string()),
                "cbr" | "cbz" | "cbt" | "cb7" =>
                    media_source.add_comic(relative_path.unwrap().into_os_string()),
                _ => {}
            }
        }

        let media = handle_media_path(app_handle, &nfo_files, root_path, &media_source);
        for m in media {
            match m.media_type() {
                MediaType::Movie | MediaType::TvShow => {
                    major_media.push(m);
                }
                MediaType::Episode => {
                    secondary_media.push(m);
                }
                _ => {}
            }
        }
    }
    (major_media, secondary_media)
}

fn handle_media_path<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>,
                                        nfo_files: &Vec<OsString>,
                                        root_path: &Path,
                                        media_source: &MediaSource) -> Vec<Media> {
    let identifier = &app_handle.config().tauri.bundle.identifier;
    if !nfo_files.is_empty() {
        let mut media: Vec<Media> = vec![];
        for nfo_file in nfo_files {
            let parsing_result = parse_nfo(root_path, nfo_file, &media_source);
            if let Err(e) = parsing_result {
                Notification::new(identifier)
                    .title("MediaDB: Encounter Error when parsing nfo file.")
                    .body(e)
                    .show()
                    .expect("Fail to send notification.");
                continue;
            }
            media.push(parsing_result.unwrap())
        }
        return media;
    }
    vec![]
}

fn aggregate_data(major_media: &Vec<Media>, secondary_media: &Vec<Media>) -> (Value, HashSet<PathBuf>) {
    let mut tags = HashSet::new();
    let mut genres = HashSet::new();
    let mut actors = HashSet::new();
    let mut studios = HashSet::new();
    let mut posters = HashSet::new();
    let mut seasons_map: HashMap<OsString, HashMap<String, Vec<&Media>>> = HashMap::new();

    // aggregate attributes
    for m in major_media {
        if !m.tags().is_empty() {
            tags.extend(m.tags());
        }

        if !m.genres().is_empty() {
            genres.extend(m.genres());
        }

        if !m.actors().is_empty() {
            actors.extend(m.actors());
        }

        if !m.studios().is_empty() {
            studios.extend(m.studios());
        }

        if !m.posters().is_empty() {
            posters.extend(m.posters()
                .iter()
                .map(|o| Path::new(m.relative_path()).join(o))
                .collect::<Vec<PathBuf>>()
            );
        }
    }

    // aggregate episode into seasons
    for m in secondary_media {
        let key = Path::new(m.relative_path()).parent().unwrap().as_os_str().to_os_string();
        let season_number = m.season().to_string();
        match seasons_map.get_mut(&key) {
            Some(season) => {
                match season.get_mut(&season_number) {
                    Some(media) => media.push(m),
                    None => {
                        season.insert(season_number, vec![m]);
                    }
                }
            }
            None => {
                seasons_map.insert(key, HashMap::from([(season_number, vec![m])]));
            }
        }
    }

    let data = major_media.iter()
        .map(|o| {
            match o.media_type() {
                MediaType::Movie => o.movie_json(),
                MediaType::TvShow => o.tvshow_json(seasons_map.get(o.relative_path())),
                _ => panic!("Unexpected media type: {:?}", o.media_type())
            }
        })
        .filter(|o| o.is_some())
        .map(|o| o.unwrap())
        .collect::<Vec<Value>>();

    (json!({
        "data": data,
        "tags": tags,
        "genres": genres,
        "actors": actors,
        "studios": studios,
    }), posters)
}

fn create_thumbnails(app_dir: &PathBuf, name: &str, path: &str, posters: &HashSet<PathBuf>) -> Result<(), String> {
    let root_path = Path::new(path);
    let thumbnail_path = app_dir.join("thumbnails");
    let folder_path = thumbnail_path.join(name);

    let create_dir_result = fs::create_dir_all(&folder_path);
    if let Err(e) = &create_dir_result {
        return Err(format!("Fail to create directory {}. Raising error {}", &folder_path.to_string_lossy(), e));
    }

    for p in posters {
        let source_path = root_path.join(p);

        let file_path = p.as_os_str().to_str().unwrap();
        let file_name = format!("{:x}", md5::compute(&file_path.replace("\\", "/").as_bytes()));
        let dest_path = folder_path.join(file_name);

        let copy_result = fs::copy(&source_path, &dest_path);
        if let Err(e) = &copy_result {
            return Err(format!("Fail to copy file from {} to {}. Raising error {}", &source_path.to_string_lossy(), &dest_path.to_string_lossy(), e));
        }
    }
    Ok(())
}
