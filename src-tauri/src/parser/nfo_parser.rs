use crate::model::parser::{Media, MediaSource, MediaType};
use log::error;
use roxmltree::Node;
use std::collections::VecDeque;
use std::ffi::OsString;
use std::fs;
use std::path::{Path, PathBuf};

pub(crate) fn parse_nfo(
    root_path: &Path,
    nfo_dir: &OsString,
    media_source: &MediaSource,
) -> Result<Option<Media>, String> {
    let nfo_path = PathBuf::from(nfo_dir);
    let file_path = root_path.join(&nfo_path);
    let content = fs::read_to_string(file_path).map_err(|e| {
        format!(
            "Error when reading file to string {}. Raising error {}",
            nfo_dir.to_string_lossy(),
            e
        )
    })?;

    let doc = roxmltree::Document::parse(content.as_str()).map_err(|e| {
        format!(
            "Error when parsing nfo file {}. Raising error {}",
            nfo_dir.to_string_lossy(),
            e
        )
    })?;

    let nfo_node = doc
        .root()
        .children()
        .find(|o| is_valid_source(o))
        .ok_or_else(|| {
            format!(
                "NFO file does not have any valid tag for parsing. {}",
                nfo_dir.to_string_lossy()
            )
        })?;
    let nfo_type = nfo_node.tag_name().name();

    let mut media = Media::default();
    let parent = nfo_path.parent().ok_or_else(|| {
        format!(
            "Cannot get parent directory for nfo path {}",
            nfo_dir.to_string_lossy()
        )
    })?;
    media.set_relative_path(parent.as_os_str().to_os_string());

    match nfo_type {
        "movie" => parse_movie_nfo(&mut media, &nfo_node, media_source),
        "tvshow" => parse_tvshow_nfo(&mut media, &nfo_node, media_source),
        "episodedetails" => parse_episode_nfo(&mut media, &nfo_node, &nfo_path, media_source),
        _ => {
            return Err(format!("Unknown nfo type '{}' for parsing", nfo_type));
        }
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
    false
}

fn parse_movie_nfo(media: &mut Media, root: &Node, media_source: &MediaSource) {
    media.set_media_type(MediaType::Movie);

    // parsing tags
    let mut queue = VecDeque::from([*root]);
    while let Some(curr_node) = queue.pop_front() {
        let tag_name = curr_node.tag_name().name();
        let text = curr_node.text();
        match tag_name {
            "title" => {
                if let Some(v) = text {
                    media.set_title(v.to_string());
                }
            }
            "year" => {
                if let Some(v) = text {
                    media.set_year(v.to_string());
                }
            }
            "poster" => {
                if let Some(v) = text {
                    media.add_poster(v.to_string());
                }
            }
            "genre" => {
                if let Some(v) = text {
                    media.add_genre(v.to_string());
                }
            }
            "tag" => {
                if let Some(v) = text {
                    media.add_tag(v.to_string());
                }
            }
            "studio" => {
                if let Some(v) = text {
                    media.add_studio(v.to_string());
                }
            }
            "actor" => media.extend_actors(get_actor_name(&curr_node)),
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
        media.set_file(String::from(
            file_path.file_name().unwrap().to_string_lossy(),
        ));
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
            "title" => {
                if let Some(v) = text {
                    media.set_title(v.to_string());
                }
            }
            "genre" => {
                if let Some(v) = text {
                    media.add_genre(v.to_string());
                }
            }
            "tag" => {
                if let Some(v) = text {
                    media.add_tag(v.to_string());
                }
            }
            "studio" => {
                if let Some(v) = text {
                    media.add_studio(v.to_string());
                }
            }
            "actor" => media.extend_actors(get_actor_name(&curr_node)),
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

fn parse_episode_nfo(media: &mut Media, root: &Node, nfo_path: &Path, media_source: &MediaSource) {
    media.set_media_type(MediaType::Episode);

    // parsing tags
    let mut queue = VecDeque::from([*root]);
    while let Some(curr_node) = queue.pop_front() {
        let tag_name = curr_node.tag_name().name();
        let text = curr_node.text();
        match tag_name {
            "title" => {
                if let Some(v) = text {
                    media.set_title(v.to_string());
                }
            }
            "season" => {
                if let Some(v) = text {
                    media.set_season(v.to_string());
                }
            }
            "episode" => {
                if let Some(v) = text {
                    media.set_episode(v.to_string());
                }
            }
            &_ => {}
        }
        if curr_node.has_children() {
            for child in curr_node.children() {
                queue.push_back(child)
            }
        }
    }

    if let Some(episode_filename) =
        get_episode_filename(nfo_path, media_source, media.season(), media.episode())
    {
        media.set_file(episode_filename)
    } else {
        error!(
            "Fail to find episode filename for {:?} from {:?}",
            nfo_path,
            media_source.media()
        )
    }
}

fn get_actor_name(node: &Node) -> Vec<String> {
    node.children()
        .filter(|v| v.tag_name().name() == "name")
        .filter_map(|v| v.text())
        .filter(|v| !v.is_empty())
        .map(|v| v.to_string())
        .collect::<Vec<String>>()
}

fn get_poster_filename(media_source: &MediaSource) -> Vec<String> {
    media_source
        .poster()
        .iter()
        .filter_map(|o| Path::new(o.as_os_str()).file_name())
        .filter_map(|o| o.to_str())
        .map(|o| o.to_string())
        .collect::<Vec<String>>()
}

fn get_episode_filename(
    nfo_path: &Path,
    media_source: &MediaSource,
    season: &str,
    episode: &str,
) -> Option<String> {
    let nfo_stem = nfo_path.file_stem()?;
    let pattern = format!("s{}e{}", season, episode);
    for media in media_source.media() {
        let media_path = Path::new(media);
        if let Some(media_stem) = media_path.file_stem() {
            let matches_stem = media_stem.eq(nfo_stem);
            let matches_pattern = media_stem
                .to_str()
                .is_some_and(|s| s.to_lowercase().contains(&pattern));
            if matches_stem || matches_pattern {
                return media_path
                    .file_name()
                    .and_then(|f| f.to_str())
                    .map(|f| f.to_string());
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn parse_movie_nfo_preserves_all_actors() {
        let dir = tempfile::tempdir().unwrap();
        let nfo_content = r#"<?xml version="1.0" encoding="UTF-8"?>
<movie>
    <title>Test Movie</title>
    <year>2024</year>
    <actor><name>Actor One</name></actor>
    <actor><name>Actor Two</name></actor>
    <actor><name>Actor Three</name></actor>
</movie>"#;

        let movie_dir = dir.path().join("Test Movie");
        fs::create_dir_all(&movie_dir).unwrap();
        fs::write(movie_dir.join("movie.nfo"), nfo_content).unwrap();

        let nfo_path = OsString::from("Test Movie/movie.nfo");
        let media_source = MediaSource::default();

        let result = parse_nfo(dir.path(), &nfo_path, &media_source)
            .unwrap()
            .unwrap();
        let item = result.movie().unwrap();
        assert_eq!(item.actors(), &["Actor One", "Actor Two", "Actor Three"]);
    }

    #[test]
    fn parse_tvshow_nfo_preserves_all_actors() {
        let dir = tempfile::tempdir().unwrap();
        let nfo_content = r#"<?xml version="1.0" encoding="UTF-8"?>
<tvshow>
    <title>Test Show</title>
    <actor><name>Actor A</name></actor>
    <actor><name>Actor B</name></actor>
</tvshow>"#;

        let show_dir = dir.path().join("Test Show");
        fs::create_dir_all(&show_dir).unwrap();
        fs::write(show_dir.join("tvshow.nfo"), nfo_content).unwrap();

        let nfo_path = OsString::from("Test Show/tvshow.nfo");
        let media_source = MediaSource::default();

        let result = parse_nfo(dir.path(), &nfo_path, &media_source)
            .unwrap()
            .unwrap();
        let item = result.tv_show(Some(&HashMap::new())).unwrap();
        assert_eq!(item.actors(), &["Actor A", "Actor B"]);
    }

    #[test]
    fn get_episode_filename_matches_by_stem() {
        let nfo_path = Path::new("Show/S01E01.nfo");
        let mut source = MediaSource::default();
        source.add_media(OsString::from("Show/S01E01.mkv"));
        source.add_media(OsString::from("Show/S01E02.mkv"));

        let result = get_episode_filename(nfo_path, &source, "01", "01");
        assert_eq!(result, Some("S01E01.mkv".to_string()));
    }

    #[test]
    fn get_episode_filename_matches_by_season_episode_pattern() {
        let nfo_path = Path::new("Show/episode.nfo");
        let mut source = MediaSource::default();
        source.add_media(OsString::from("Show/My Show s01e03 720p.mkv"));

        let result = get_episode_filename(nfo_path, &source, "01", "03");
        assert_eq!(result, Some("My Show s01e03 720p.mkv".to_string()));
    }

    #[test]
    fn get_episode_filename_returns_none_when_no_match() {
        let nfo_path = Path::new("Show/S01E01.nfo");
        let mut source = MediaSource::default();
        source.add_media(OsString::from("Show/S02E05.mkv"));

        let result = get_episode_filename(nfo_path, &source, "01", "01");
        assert_eq!(result, None);
    }

    #[test]
    fn get_episode_filename_returns_none_for_empty_nfo_path() {
        let nfo_path = Path::new("");
        let mut source = MediaSource::default();
        source.add_media(OsString::from("Show/S01E01.mkv"));

        let result = get_episode_filename(nfo_path, &source, "01", "01");
        assert_eq!(result, None);
    }

    #[test]
    fn get_poster_filename_extracts_filenames() {
        let mut source = MediaSource::default();
        source.add_poster(OsString::from("Movie/poster.jpg"));
        source.add_poster(OsString::from("Movie/season01-poster.jpg"));

        let result = get_poster_filename(&source);
        assert_eq!(result, vec!["poster.jpg", "season01-poster.jpg"]);
    }

    #[test]
    fn get_poster_filename_skips_entries_without_filename() {
        let mut source = MediaSource::default();
        source.add_poster(OsString::from("Movie/poster.jpg"));
        // Root path has no file_name component
        source.add_poster(OsString::from("/"));

        let result = get_poster_filename(&source);
        assert_eq!(result, vec!["poster.jpg"]);
    }
}
