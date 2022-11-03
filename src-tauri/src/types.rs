use std::collections::HashMap;
use std::ffi::OsString;
use serde_json::{json, Value};

#[derive(Debug)]
pub struct MediaSource {
    media: Vec<OsString>,
    poster: Vec<OsString>,
    comic: Vec<OsString>,
}

impl Default for MediaSource {
    fn default() -> MediaSource {
        MediaSource {
            media: vec![],
            poster: vec![],
            comic: vec![],
        }
    }
}

impl MediaSource {
    pub fn add_media(&mut self, m: OsString) {
        self.media.push(m);
    }
    pub fn add_poster(&mut self, p: OsString) {
        self.poster.push(p);
    }
    pub fn add_comic(&mut self, c: OsString) {
        self.comic.push(c);
    }

    pub fn media(&self) -> &Vec<OsString> {
        &self.media
    }
    pub fn poster(&self) -> &Vec<OsString> {
        &self.poster
    }
    pub fn comic(&self) -> &Vec<OsString> {
        &self.comic
    }
}

#[derive(Debug)]
pub enum MediaType {
    Movie,
    TvShow,
    Episode,
    Comic,
    UNKNOWN,
}

#[derive(Debug)]
pub struct Media {
    media_type: MediaType,
    relative_path: OsString,
    file: String,
    title: String,
    posters: Vec<String>,
    year: String,
    tags: Vec<String>,
    genres: Vec<String>,
    actors: Vec<String>,
    studios: Vec<String>,

    season: String,
    episode: String,
}

impl Default for Media {
    fn default() -> Media {
        Media {
            media_type: MediaType::UNKNOWN,
            relative_path: Default::default(),
            file: "".to_string(),
            title: "".to_string(),
            posters: vec![],
            year: "".to_string(),
            tags: vec![],
            genres: vec![],
            actors: vec![],
            studios: vec![],
            season: "".to_string(),
            episode: "".to_string(),
        }
    }
}

impl Media {
    pub fn add_tag(&mut self, tag: String) {
        if !tag.trim().is_empty() {
            self.tags.push(tag)
        }
    }

    pub fn add_genre(&mut self, genre: String) {
        if !genre.trim().is_empty() {
            self.genres.push(genre)
        }
    }

    pub fn add_poster(&mut self, poster: String) {
        if !poster.trim().is_empty() {
            self.posters.push(poster)
        }
    }

    pub fn add_posters(&mut self, poster: &mut Vec<String>) {
        if !poster.is_empty() {
            self.posters.append(poster)
        }
    }

    pub fn add_studio(&mut self, studio: String) {
        if !studio.trim().is_empty() {
            self.studios.push(studio)
        }
    }

    // Getter
    pub fn media_type(&self) -> &MediaType {
        &self.media_type
    }
    pub fn relative_path(&self) -> &OsString {
        &self.relative_path
    }
    pub fn file(&self) -> &str {
        &self.file
    }
    pub fn posters(&self) -> &Vec<String> {
        &self.posters
    }
    pub fn tags(&self) -> &Vec<String> {
        &self.tags
    }
    pub fn genres(&self) -> &Vec<String> {
        &self.genres
    }
    pub fn actors(&self) -> &Vec<String> {
        &self.actors
    }
    pub fn studios(&self) -> &Vec<String> {
        &self.studios
    }
    pub fn season(&self) -> &str {
        &self.season
    }
    pub fn episode(&self) -> &str {
        &self.episode
    }

    // Setter
    pub fn set_media_type(&mut self, media_type: MediaType) {
        self.media_type = media_type;
    }
    pub fn set_relative_path(&mut self, relative_path: OsString) {
        self.relative_path = relative_path;
    }
    pub fn set_file(&mut self, file: String) {
        self.file = file;
    }
    pub fn set_title(&mut self, title: String) {
        self.title = title;
    }
    pub fn set_posters(&mut self, poster: Vec<String>) {
        self.posters = poster;
    }
    pub fn set_year(&mut self, year: String) {
        self.year = year;
    }
    pub fn set_actors(&mut self, actors: Vec<String>) {
        self.actors = actors;
    }
    pub fn set_season(&mut self, season: String) {
        self.season = format!("{:0>2}", season);
    }
    pub fn set_episode(&mut self, episode: String) {
        self.episode = format!("{:0>2}", episode);
    }

    // json
    pub fn movie_json(&self) -> Value {
        if let MediaType::Movie = self.media_type {
            return json!({
                "type": "movie",
                "relativePath": self.relative_path().to_str().unwrap(),
                "title": self.title,
                "year": self.year,
                "file": self.file,
                "posters": self.construct_poster_map(),
                "tags": self.tags,
                "genres": self.genres,
                "actors": self.actors,
                "studios": self.studios
            });
        }
        panic!("Expect a movie, but get {:?}", self.media_type)
    }

    pub fn tvshow_json(&self, season_map: Option<&HashMap<String, Vec<&Media>>>) -> Value {
        if season_map.is_none() {
            panic!("Expect to get seasons data, but get none.")
        }
        if let MediaType::TvShow = self.media_type {
            let seasons = season_map
                .unwrap()
                .into_iter()
                .map(|(season, episodes)| {
                    let mut values = episodes.into_iter().map(|o| o).collect::<Vec<&&Media>>();
                    values.sort_by(|a, b| a.episode().cmp(b.episode()));
                    return (season, values.iter().map(|o| o.episode_json()).collect::<Vec<Value>>());
                })
                .collect::<HashMap<&String, Vec<Value>>>();
            return json!({
                "type": "tvshow",
                "relativePath": self.relative_path.to_str().unwrap(),
                "title": self.title,
                "posters": self.construct_poster_map(),
                "tags": self.tags,
                "genres": self.genres,
                "actors": self.actors,
                "studios": self.studios,
                "seasons": seasons,
            });
        }
        panic!("Expect a tv show, but get {:?}", self.media_type)
    }

    pub fn episode_json(&self) -> Value {
        if let MediaType::Episode = self.media_type {
            return json!({
                "title": self.title,
                "file": self.file,
                "season": self.season,
                "episode": self.episode,
                "relativePath": self.relative_path.to_str().unwrap(),
            });
        }
        panic!("Expect an episode, but get {:?}", self.media_type)
    }

    fn construct_poster_map(&self) -> HashMap<String, &String> {
        let mut poster_map = HashMap::new();
        for p in self.posters() {
            if p.starts_with("season-specials") {
                poster_map.insert(String::from("00"), p);
            } else if p.starts_with("season") {
                let season = p.split("-").collect::<Vec<&str>>();
                if season.first().is_some() {
                    poster_map.insert(season.first().unwrap().strip_prefix("season").unwrap().to_string(), p);
                }
            } else {
                poster_map.insert(String::from("main"), p);
            }
        }
        poster_map
    }
}
