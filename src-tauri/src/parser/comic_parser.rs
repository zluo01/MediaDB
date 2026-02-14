use std::{
    ffi::OsString,
    fs,
    fs::File,
    io::{Read, Write},
    path::{Path, PathBuf},
};

use crate::model::parser::{Media, MediaType};
use crate::parser::utilities::convert_image;
use log::error;
use rayon::prelude::*;
use tauri_plugin_notification::NotificationExt;
use zip::{read::ZipFile, ZipArchive};

pub(crate) fn parse_comics<R: tauri::Runtime>(
    app_handle: &tauri::AppHandle<R>,
    app_dir: &PathBuf,
    root_path: &Path,
    comic_files: &Vec<OsString>,
) -> Result<Vec<Media>, String> {
    if comic_files.is_empty() {
        return Ok(Vec::new());
    }

    let cover_path = app_dir.join("covers");

    let comic_folder_name = root_path.file_name().ok_or_else(|| {
        format!(
            "Cannot get folder name from root_path: {}",
            root_path.display()
        )
    })?;

    let cover_folder_path = cover_path.join(comic_folder_name);

    let results: Vec<Media> = comic_files
        .into_par_iter()
        .filter_map(
            |comic_file| match parse_comic(&cover_folder_path, root_path, comic_file) {
                Ok(media) => Some(media),
                Err(e) => {
                    let _ = app_handle
                        .notification()
                        .builder()
                        .title("MediaDB: Encounter Error when parsing comic file.")
                        .body(e)
                        .show();
                    None
                }
            },
        )
        .flat_map(|v| v)
        .collect();

    Ok(results)
}

fn parse_comic(
    cover_folder_path: &PathBuf,
    root_path: &Path,
    file_path: &OsString,
) -> Result<Option<Media>, String> {
    let comic_path = root_path.join(file_path);
    let relative_file_path = file_path
        .to_string_lossy()
        .replace('\\', "/")
        .replace(".cbz", "")
        .replace(".cbr", "")
        .replace(".cbt", "")
        .replace(".cb7", "");
    let cover_dest_path = cover_folder_path.join(&relative_file_path);

    let parent_dir = cover_dest_path.parent().ok_or_else(|| {
        format!(
            "Cannot get parent directory for {}",
            cover_dest_path.display()
        )
    })?;

    fs::create_dir_all(parent_dir).map_err(|e| {
        format!(
            "Fail to create cover directory {}. Raising error {}",
            parent_dir.display(),
            e
        )
    })?;

    let file = File::open(&comic_path)
        .map_err(|e| format!("Fail to open comic file {:?}. Error: {}", file_path, e))?;

    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Fail to read zip file {:?}. Error: {}", file_path, e))?;

    for i in 0..archive.len() {
        let mut zip_file = archive
            .by_index(i)
            .map_err(|e| format!("Fail to get file at index {}. Error: {}", i, e))?;

        if !zip_file.is_file() {
            continue;
        }

        save_cover(&cover_dest_path, &mut zip_file)?;
        break;
    }

    let file_name = comic_path.file_stem().ok_or_else(|| {
        format!(
            "Cannot get file stem for comic path {}",
            comic_path.display()
        )
    })?;

    let file_name_str = comic_path.file_name().ok_or_else(|| {
        format!(
            "Cannot get file name for comic path {}",
            comic_path.display()
        )
    })?;

    let mut media = Media::default();
    media.set_media_type(MediaType::Comic);
    media.set_title(String::from(file_name.to_string_lossy()));
    media.set_file(String::from(file_name_str.to_string_lossy()));
    media.add_poster(String::from(file_name.to_string_lossy()));
    media.set_relative_path(file_path.to_os_string());
    Ok(Some(media))
}

fn save_cover(comic_dest_name: &PathBuf, file: &mut ZipFile<File>) -> Result<(), String> {
    let mut content = Vec::new();
    file.read_to_end(&mut content)
        .map_err(|e| format!("Fail to read zip file content. Error: {}", e))?;

    File::create(comic_dest_name)
        .and_then(|mut f| f.write_all(content.as_slice()))
        .map_err(|e| format!("Fail to write cover file. Error: {}", e))?;

    let comic_cover_path = comic_dest_name
        .as_os_str()
        .to_str()
        .ok_or_else(|| format!("Invalid cover path: {}", comic_dest_name.display()))?;

    if let Err(e) = convert_image(comic_cover_path, comic_cover_path) {
        error!("{}", e);
    }

    Ok(())
}
