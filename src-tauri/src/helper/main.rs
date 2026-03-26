use std::path::PathBuf;

const IMAGE_EXTENSIONS: &[&str] = &[".jpg", ".png", ".jpeg", ".bmp", ".gif", ".webp"];
const COMIC_EXTENSIONS: &[&str] = &[".cbz", ".cbr", ".cbt", ".cb7"];

fn strip_extensions(path: &str, extensions: &[&str]) -> String {
    let mut result = path.replace('\\', "/");
    for ext in extensions {
        result = result.replace(ext, "");
    }
    result
}

pub fn strip_image_extensions(path: &str) -> String {
    strip_extensions(path, IMAGE_EXTENSIONS)
}

pub fn strip_comic_extensions(path: &str) -> String {
    strip_extensions(path, COMIC_EXTENSIONS)
}

pub fn get_cached_image_path(server_port: &u16, folder_name: &str, src: &str) -> String {
    let cleanup_image_path = strip_image_extensions(src);

    let path = PathBuf::from("covers")
        .join(folder_name)
        .join(&cleanup_image_path);

    let urlencoded_path = urlencoding::encode(path.to_str().unwrap());
    format!("http://127.0.0.1:{}/{}", server_port, urlencoded_path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strip_image_extensions_removes_all_formats() {
        assert_eq!(strip_image_extensions("poster.jpg"), "poster");
        assert_eq!(strip_image_extensions("poster.png"), "poster");
        assert_eq!(strip_image_extensions("poster.jpeg"), "poster");
        assert_eq!(strip_image_extensions("poster.bmp"), "poster");
        assert_eq!(strip_image_extensions("poster.gif"), "poster");
        assert_eq!(strip_image_extensions("poster.webp"), "poster");
    }

    #[test]
    fn strip_image_extensions_normalizes_backslashes() {
        assert_eq!(
            strip_image_extensions("folder\\subfolder\\poster.jpg"),
            "folder/subfolder/poster"
        );
    }

    #[test]
    fn strip_image_extensions_no_extension() {
        assert_eq!(strip_image_extensions("poster"), "poster");
    }

    #[test]
    fn strip_comic_extensions_removes_all_formats() {
        assert_eq!(strip_comic_extensions("comic.cbz"), "comic");
        assert_eq!(strip_comic_extensions("comic.cbr"), "comic");
        assert_eq!(strip_comic_extensions("comic.cbt"), "comic");
        assert_eq!(strip_comic_extensions("comic.cb7"), "comic");
    }

    #[test]
    fn strip_comic_extensions_normalizes_backslashes() {
        assert_eq!(strip_comic_extensions("folder\\comic.cbz"), "folder/comic");
    }

    #[test]
    fn get_cached_image_path_constructs_url() {
        let result = get_cached_image_path(&8080, "Movie", "poster.jpg");
        assert_eq!(result, "http://127.0.0.1:8080/covers%2FMovie%2Fposter");
    }

    #[test]
    fn get_cached_image_path_encodes_special_chars() {
        let result = get_cached_image_path(&8080, "Movie", "John Wick/poster.jpg");
        assert_eq!(
            result,
            "http://127.0.0.1:8080/covers%2FMovie%2FJohn%20Wick%2Fposter"
        );
    }
}
