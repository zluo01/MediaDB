use std::{
    collections::{HashMap, HashSet, VecDeque},
    ffi::OsString,
    fs,
    path::{Path, PathBuf},
};

use log::error;
use rayon::prelude::*;
use tauri::Manager;
use tauri_plugin_notification::NotificationExt;

use crate::model::parser::{Media, MediaItem, MediaSource, MediaType};
use crate::parser::comic_parser::parse_comics;
use crate::parser::utilities::convert_image;
use crate::{parser::nfo_parser::parse_nfo, parser::utilities};

pub fn parse<R: tauri::Runtime>(
    app_handle: &tauri::AppHandle<R>,
    name: &str,
    path: &str,
    skip_paths: &Vec<String>,
) -> Vec<MediaItem> {
    let app_dir = app_handle.path().app_data_dir().unwrap();
    let (major_media, secondary_media) = read_dir(app_handle, path, skip_paths);
    let (data, posters) = aggregate_data(&major_media, &secondary_media);
    handle_images(&app_dir, name, path, &posters);
    data
}

fn read_dir<R: tauri::Runtime>(
    app_handle: &tauri::AppHandle<R>,
    path: &str,
    skip_paths: &Vec<String>,
) -> (Vec<Media>, Vec<Media>) {
    let root_path = Path::new(path);
    let mut queue = VecDeque::from([OsString::from(path)]);

    let mut major_media = Vec::new();
    let mut secondary_media = Vec::new();

    while let Some(curr_dir) = queue.pop_front() {
        let entries = match fs::read_dir(&curr_dir) {
            Ok(entries) => entries,
            Err(e) => {
                error!("Failed to read directory {:?}: {}", curr_dir, e);
                continue;
            }
        };

        let mut nfo_files = Vec::new();
        let mut media_source = MediaSource::default();

        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();

                let file_name = path.file_name().unwrap().to_str().unwrap();
                // check for hidden file or skip paths
                if file_name.starts_with('.') || skip_paths.contains(&file_name.to_string()) {
                    continue;
                }

                if path.is_dir() {
                    queue.push_back(path.into_os_string());
                    continue;
                }

                let relative_path = utilities::get_relative_path(path.as_path(), root_path);
                let extension = path.extension();
                if extension.is_none() {
                    error!("File does not have proper extension. {:?}", &path);
                    continue;
                }
                let ext = extension.unwrap().to_str().unwrap();
                match ext {
                    "nfo" => nfo_files.push(relative_path.unwrap().into_os_string()),
                    "jpg" | "png" => {
                        if file_name.contains("poster") {
                            media_source.add_poster(relative_path.unwrap().into_os_string())
                        }
                    }
                    "m4v" | "avi" | "mpg" | "mp4" | "mkv" | "f4v" | "wmv" | "rmvb" => {
                        media_source.add_media(relative_path.unwrap().into_os_string())
                    }
                    "cbr" | "cbz" | "cbt" | "cb7" => {
                        media_source.add_comic(relative_path.unwrap().into_os_string())
                    }
                    _ => {}
                }
            }
        }

        let media = handle_media_path(app_handle, &nfo_files, root_path, &media_source);
        for m in media {
            match m.media_type() {
                MediaType::Movie | MediaType::TvShow | MediaType::Comic => {
                    major_media.push(m);
                }
                MediaType::Episode => {
                    secondary_media.push(m);
                }
                _ => {}
            }
        }
    }

    major_media.par_sort_by(|a, b| a.relative_path().cmp(b.relative_path()));

    (major_media, secondary_media)
}

fn handle_media_path<R: tauri::Runtime>(
    app_handle: &tauri::AppHandle<R>,
    nfo_files: &Vec<OsString>,
    root_path: &Path,
    media_source: &MediaSource,
) -> Vec<Media> {
    let app_dir = app_handle.path().app_data_dir().unwrap();
    let comic_media: Vec<Media> =
        parse_comics(&app_handle, &app_dir, root_path, media_source.comic());
    nfo_files
        .into_par_iter()
        .filter_map(
            |nfo_file| match parse_nfo(root_path, nfo_file, &media_source) {
                Ok(media) => Some(media),
                Err(e) => {
                    let _ = &app_handle
                        .notification()
                        .builder()
                        .title("MediaDB: Encounter Error when parsing nfo file.")
                        .body(e)
                        .show()
                        .unwrap();
                    None
                }
            },
        )
        .flat_map(|v| v)
        .chain(comic_media)
        .collect()
}

fn aggregate_data(
    major_media: &Vec<Media>,
    secondary_media: &Vec<Media>,
) -> (Vec<MediaItem>, HashSet<PathBuf>) {
    let mut posters = HashSet::new();
    let mut seasons_map: HashMap<OsString, HashMap<String, Vec<&Media>>> = HashMap::new();

    // aggregate attributes
    for m in major_media {
        if !m.posters().is_empty() {
            match m.media_type() {
                MediaType::Movie | MediaType::TvShow => posters.extend(
                    m.posters()
                        .iter()
                        .map(|o| Path::new(m.relative_path()).join(o))
                        .collect::<Vec<PathBuf>>(),
                ),
                MediaType::Comic | _ => {}
            }
        }
    }

    // aggregate episode into seasons
    for m in secondary_media {
        let key = Path::new(m.relative_path())
            .parent()
            .unwrap()
            .as_os_str()
            .to_os_string();
        let season_number = m.season().to_string();
        match seasons_map.get_mut(&key) {
            Some(season) => match season.get_mut(&season_number) {
                Some(media) => media.push(m),
                None => {
                    season.insert(season_number, vec![m]);
                }
            },
            None => {
                seasons_map.insert(key, HashMap::from([(season_number, vec![m])]));
            }
        }
    }

    let data = major_media
        .into_par_iter()
        .map(|o| match o.media_type() {
            MediaType::Movie => o.movie(),
            MediaType::TvShow => o.tv_show(seasons_map.get(o.relative_path())),
            MediaType::Comic => o.comic(),
            _ => panic!("Unexpected media type: {:?}", o.media_type()),
        })
        .filter_map(|o| o)
        .collect::<Vec<MediaItem>>();

    (data, posters)
}

fn handle_images(app_dir: &PathBuf, name: &str, path: &str, posters: &HashSet<PathBuf>) {
    let root_path = Path::new(path);
    let cover_path = app_dir.join("covers");

    let cover_folder_path = cover_path.join(name);

    if let Err(e) = fs::create_dir_all(&cover_folder_path) {
        error!(
            "Fail to create cover directory {}. Raising error {}",
            &cover_folder_path.to_string_lossy(),
            e
        );
        return;
    }

    posters.into_par_iter().for_each(|poster_path| {
        let source_path = root_path.join(poster_path);

        let file_path = poster_path
            .to_string_lossy()
            .replace("\\", "/")
            .replace(".jpg", "")
            .replace(".png", "")
            .replace(".jpeg", "")
            .replace(".bmp", "")
            .replace(".gif", "")
            .replace(".webp", "");

        let cover_dest_path = cover_folder_path.join(&file_path);

        save_cover(&source_path, &cover_dest_path);
    });
}

fn save_cover(source_path: &PathBuf, dest_path: &PathBuf) {
    let parent_path = dest_path.as_path().parent().unwrap();
    if let Err(e) = fs::create_dir_all(&parent_path) {
        error!(
            "Fail to create directory {:?}. Raising error {}",
            parent_path, e
        );
        return;
    }

    let cover_src_path = source_path.as_os_str().to_str().unwrap();
    let cover_output_path = dest_path.as_os_str().to_str().unwrap();

    if let Err(e) = convert_image(cover_src_path, cover_output_path) {
        error!("{}", e);
        return;
    }
}
