use std::{ffi::OsString, fs, path::{Path, PathBuf}};
use std::fs::File;
use std::io::{Read, Write};
use std::process::Command;

use image::ImageFormat;
use image::imageops::FilterType;
use rayon::prelude::*;
use tauri::api::notification::Notification;
use zip::read::ZipFile;
use zip::ZipArchive;

use crate::parser::types::{Media, MediaType};

pub(crate) fn parse_comics(identifier: &String,
                           app_dir: &PathBuf,
                           root_path: &Path,
                           comic_files: &Vec<OsString>) -> Vec<Media> {
    if comic_files.is_empty() {
        return Vec::new();
    }

    let cover_path = app_dir.join("covers");

    let comic_folder_name = root_path.file_name().unwrap();

    let cover_folder_path = cover_path.join(comic_folder_name);

    return comic_files.into_par_iter()
        .filter_map(|comic_file| {
            match parse_comic(&cover_folder_path,
                              root_path,
                              comic_file) {
                Ok(media) => Some(media),
                Err(e) => {
                    Notification::new(identifier)
                        .title("MediaDB: Encounter Error when parsing comic file.")
                        .body(e)
                        .show()
                        .expect("Fail to send notification.");
                    None
                }
            }
        })
        .flat_map(|v| v)
        .collect();
}

fn parse_comic(cover_folder_path: &PathBuf,
               root_path: &Path,
               file_path: &OsString) -> Result<Option<Media>, String> {
    let comic_path = root_path.join(file_path);
    let relative_file_path = file_path
        .to_string_lossy()
        .replace("\\", "/")
        .replace(".cbz", "")
        .replace(".cbr", "")
        .replace(".cbt", "")
        .replace(".cb7", "");
    let cover_dest_path = cover_folder_path.join(&relative_file_path);

    if let Err(e) = fs::create_dir_all(&cover_dest_path.parent().unwrap()) {
        return Err(format!("Fail to create cover directory {}. Raising error {}", &cover_dest_path.parent().unwrap().to_string_lossy(), e));
    }

    let file = File::open(&comic_path).expect("Fail to open comic file.");
    let mut archive = ZipArchive::new(file).expect("Fail to read zip file.");
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).expect("Fail to get file at index.");

        if !file.is_file() {
            continue;
        }

        save_cover(&cover_dest_path, &mut file)?;
        break;
    }

    let file_name = comic_path.file_stem().unwrap();

    let mut media = Media::default();
    media.set_media_type(MediaType::Comic);
    media.set_title(String::from(file_name.to_string_lossy()));
    media.set_file(String::from(comic_path.file_name().unwrap().to_string_lossy()));
    media.add_poster(String::from(file_name.to_string_lossy()));
    media.set_relative_path(PathBuf::from(file_path).parent().unwrap().as_os_str().to_os_string());
    Ok(Some(media))
}

fn save_cover(comic_dest_name: &PathBuf,
              file: &mut ZipFile) -> Result<(), String> {
    let mut content = Vec::new();
    file.read_to_end(&mut content).expect("Fail to read zip file");

    // use ffmpeg until image has better support for avif
    if file.name().ends_with("avif") {
        File::create(comic_dest_name)
            .expect("Fail to create cover.")
            .write_all(content.as_slice()).expect("Fail to write buffer to cover.");

        let comic_cover_path = comic_dest_name.as_os_str().to_str().unwrap();
        let comic_cover_output_path = format!("{}.avif", comic_cover_path);

        Command::new("ffmpeg")
            .args(&[
                "-y",
                "-i",
                comic_cover_path,
                "-vf", "scale='if(gt(a,320/480),320,-1)':'if(gt(a,320/480),-1,480)'",
                comic_cover_output_path.as_str()
            ])
            .output()
            .expect("Fail to convert cover.");

        fs::rename(comic_cover_output_path, comic_cover_path).expect("Fail to rename cover.");
    } else {
        let img = image::load_from_memory(&content).expect("Fail to load image.");
        img.resize(320, 480, FilterType::Lanczos3).save_with_format(comic_dest_name, ImageFormat::WebP)
            .expect("Fail to save cover.");
    }
    Ok(())
}
