use std::collections::{HashMap, HashSet, VecDeque};
use std::ffi::{OsString};
use std::fs;
use std::os::unix::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use crate::nfo_parser::parse_nfo;
use std::time::{Instant};
use serde_json::{json, Value};
use crate::types::{Media, MediaSource, MediaType};
use crate::utilities;

pub fn parser(app_dir: &PathBuf, name: &str, path: &str) -> Value {
    let start = Instant::now();
    let (major_media, secondary_media) = read_dir(path);
    let (data, posters) = aggregate_data(&major_media, &secondary_media);
    let duration = start.elapsed();
    println!("{:?}", duration);
    create_thumbnails(app_dir, name, path, &posters);
    return data;
}

fn read_dir(path: &str) -> (Vec<Media>, Vec<Media>) {
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
            if file_name.as_bytes().starts_with(&[b'.']) {
                continue;
            }

            if path.is_dir() {
                queue.push_back(path.into_os_string());
                continue;
            }

            let relative_path = utilities::get_relative_path(path.as_path(), root_path);
            let ext = path.extension().unwrap().as_bytes();
            match ext {
                b"nfo" => nfo_files.push(relative_path.unwrap().into_os_string()),
                b"jpg" | b"png" => if file_name.to_str().unwrap().contains("poster") {
                    media_source.add_poster(relative_path.unwrap().into_os_string())
                },
                b"m4v" | b"avi" | b"mpg" | b"mp4" | b"mkv" | b"f4v" | b"wmv" =>
                    media_source.add_media(relative_path.unwrap().into_os_string()),
                b"cbr" | b"cbz" | b"cbt" | b"cb7" =>
                    media_source.add_comic(relative_path.unwrap().into_os_string()),
                _ => {}
            }
        }

        let media = handle_media_path(&nfo_files, root_path, &media_source);
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

fn handle_media_path(nfo_files: &Vec<OsString>,
                     root_path: &Path,
                     media_source: &MediaSource) -> Vec<Media> {
    if !nfo_files.is_empty() {
        let media = nfo_files
            .iter()
            .map(|o| parse_nfo(root_path, o, &media_source))
            .collect::<Vec<Media>>();
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
        }).collect::<Vec<Value>>();

    (json!({
        "data": data,
        "tags": tags,
        "genres": genres,
        "actors": actors,
        "studios": studios,
    }), posters)
}

fn create_thumbnails(app_dir: &PathBuf, name: &str, path: &str, posters: &HashSet<PathBuf>) {
    let root_path = Path::new(path);
    let thumbnail_path = app_dir.as_path().join("thumbnails");
    let folder_path = thumbnail_path.join(name);
    fs::create_dir_all(&folder_path).expect("Fail to create path.");
    for p in posters {
        let file_name = format!("{:x}", md5::compute(p.as_os_str().as_bytes()));
        let source_path = root_path.join(p);
        let dest_path = folder_path.join(file_name);
        let _ = fs::copy(source_path, dest_path);
    }
}
