use std::collections::VecDeque;
use std::ffi::OsString;
use std::fs;
use std::path::{Path, PathBuf};
use roxmltree::{Node};
use crate::parser::types::{Media, MediaSource, MediaType};

pub(crate) fn parse_nfo(root_path: &Path, nfo_dir: &OsString, media_source: &MediaSource) -> Result<Option<Media>, String> {
    let nfo_path = PathBuf::from(nfo_dir);
    let file_path = root_path.join(&nfo_path);
    let content_result = fs::read_to_string(file_path);
    if let Err(e) = &content_result {
        return Err(format!("Error when reading file to string {}. Raising error {}", nfo_dir.to_string_lossy(), e));
    }
    let content = content_result.unwrap();

    let parsing_result = roxmltree::Document::parse(content.as_str());

    if let Err(e) = &parsing_result {
        return Err(format!("Error when parsing nfo file {}. Raising error {}", nfo_dir.to_string_lossy(), e));
    }

    let doc = parsing_result.unwrap();
    let nfo_types = doc.root()
        .children()
        .filter(|o| is_valid_source(o))
        .collect::<Vec<Node>>();

    if nfo_types.is_empty() {
        return Err(format!("NFO file does not have any valid tag for parsing. {}", nfo_dir.to_string_lossy()));
    }

    let nfo_node = nfo_types.first().unwrap();
    let nfo_type = nfo_node.tag_name().name();

    let mut media = Media::default();
    media.set_relative_path(nfo_path.parent().unwrap().as_os_str().to_os_string());
    match nfo_type {
        "movie" => parse_movie_nfo(&mut media, nfo_node, media_source),
        "tvshow" => parse_tvshow_nfo(&mut media, nfo_node, media_source),
        "episodedetails" => parse_episode_nfo(&mut media, nfo_node),
        &_ => panic!("Get unknown type {} for parsing", nfo_type)
    }

    // TODO: filter out bdmv until find a better way solve it.
    if media.file().to_lowercase().contains("bdmv") {
        return Ok(None);
    }
    Ok(Some(media))
}

fn is_valid_source(o: &Node) -> bool {
    let tag_name = o.tag_name().name();
    if tag_name == "movie" || tag_name == "tvshow" || tag_name == "episodedetails" {
        return true;
    }
    return false;
}

fn parse_movie_nfo(media: &mut Media, root: &Node, media_source: &MediaSource) {
    media.set_media_type(MediaType::Movie);

    // parsing tags
    let mut queue = VecDeque::from([*root]);
    while !queue.is_empty() {
        let curr_node = queue.pop_front().unwrap();

        let tag_name = curr_node.tag_name().name();
        let text = curr_node.text();
        match tag_name {
            "title" => if let Some(v) = text {
                media.set_title(v.to_string());
            },
            "year" => if let Some(v) = text {
                media.set_year(v.to_string());
            },
            "original_filename" => if let Some(v) = text {
                media.set_file(v.to_string());
            },
            "poster" => if let Some(v) = text {
                media.add_poster(v.to_string());
            },
            "genre" => if let Some(v) = text {
                media.add_genre(v.to_string());
            },
            "tag" => if let Some(v) = text {
                media.add_tag(v.to_string());
            },
            "studio" => if let Some(v) = text {
                media.add_studio(v.to_string());
            },
            "actor" => media.set_actors(get_actor_name(&curr_node)),
            &_ => {}
        }
        if curr_node.has_children() {
            for child in curr_node.children() {
                queue.push_back(child)
            }
        }
    }

    // handle poster
    if media.posters().is_empty() {
        media.add_posters(&mut get_poster_filename(media_source));
    }

    // handle movie file
    if media.file().is_empty() && !media_source.media().is_empty() {
        let file_path = Path::new(media_source.media().first().as_ref().unwrap().as_os_str());
        media.set_file(file_path.file_name().unwrap().to_str().unwrap().to_string());
    }
}

fn parse_tvshow_nfo(media: &mut Media, root: &Node, media_source: &MediaSource) {
    media.set_media_type(MediaType::TvShow);

    // parsing tags
    let mut queue = VecDeque::from([*root]);
    while let Some(curr_node) = queue.pop_front() {
        let tag_name = curr_node.tag_name().name();
        let text = curr_node.text();
        match tag_name {
            "title" => if let Some(v) = text {
                media.set_title(v.to_string());
            },
            "genre" => if let Some(v) = text {
                media.add_genre(v.to_string());
            },
            "tag" => if let Some(v) = text {
                media.add_tag(v.to_string());
            },
            "studio" => if let Some(v) = text {
                media.add_studio(v.to_string());
            },
            "actor" => media.set_actors(get_actor_name(&curr_node)),
            &_ => {}
        }
        if curr_node.has_children() {
            for child in curr_node.children() {
                queue.push_back(child)
            }
        }
    }

    // handle poster
    media.set_posters(get_poster_filename(media_source));
}

fn parse_episode_nfo(media: &mut Media, root: &Node) {
    media.set_media_type(MediaType::Episode);

    // parsing tags
    let mut queue = VecDeque::from([*root]);
    while !queue.is_empty() {
        let curr_node = queue.pop_front().unwrap();

        let tag_name = curr_node.tag_name().name();
        let text = curr_node.text();
        match tag_name {
            "title" => if let Some(v) = text {
                media.set_title(v.to_string());
            },
            "original_filename" => if let Some(v) = text {
                media.set_file(v.to_string());
            },
            "season" => if let Some(v) = text {
                media.set_season(v.to_string());
            },
            "episode" => if let Some(v) = text {
                media.set_episode(v.to_string());
            },
            &_ => {}
        }
        if curr_node.has_children() {
            for child in curr_node.children() {
                queue.push_back(child)
            }
        }
    }
}

fn get_actor_name(node: &Node) -> Vec<String> {
    return node.children()
        .filter(|v| v.tag_name().name() == "name")
        .map(|v| v.text())
        .filter(|v| v.is_some())
        .map(|v| v.unwrap())
        .filter(|v| !v.is_empty())
        .map(|v| v.to_string())
        .collect::<Vec<String>>();
}

fn get_poster_filename(media_source: &MediaSource) -> Vec<String> {
    return media_source.poster()
        .iter()
        .map(|o| Path::new(o.as_os_str()))
        .map(|o| o.file_name())
        .filter(|o| o.is_some())
        .map(|o| o.unwrap().to_str().unwrap().to_string())
        .collect::<Vec<String>>();
}
