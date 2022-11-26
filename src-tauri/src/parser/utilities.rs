use std::path::{Path, PathBuf};

pub fn get_relative_path(path: &Path, base: &Path) -> Option<PathBuf> {
    let relative_path = path.strip_prefix(base);
    if relative_path.is_ok() {
        return Some(relative_path.unwrap().to_path_buf());
    }
    None
}
