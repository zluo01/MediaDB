pub const CREATE_TABLE_QUERY: &str = include_str!("sql/create_tables.sql");

// Binds: ?1 = tags JSON array (e.g. '[{"group":"genres","label":"Action"}]' or '[]')
//        ?2 = folder position
//        ?3 = filter_type (0 = OR, 1 = AND)
//
// - filter_tags CTE unpacks the JSON array into rows via json_each.
// - filter_groups CTE counts how many tags were selected per group.
// - NOT EXISTS checks every filter group: the matched tag count must be
//     >= 1 for OR mode, or = tag_count for AND mode.
// - When no tags are passed, filter_groups is empty, NOT EXISTS is
//   vacuously true, and all media in the folder are returned.
pub const GET_FOLDER_CONTENT: &str = include_str!("sql/get_folder_content.sql");

//language=sqlite
pub const GET_SETTINGS: &str = "
    SELECT * FROM  settings
    ";

//language=sqlite
pub const GET_SKIP_FOLDERS: &str = "
    SELECT skip_folders FROM settings
    ";

//language=sqlite
pub const UPDATE_HIDE_PANEL: &str = "
    UPDATE settings SET hide_panel = ? WHERE settings_id=0
    ";

//language=sqlite
pub const UPDATE_SKIP_FOLDERS: &str = "
    UPDATE settings SET skip_folders = ? WHERE settings_id=0
    ";

//language=sqlite
pub const INSERT_NEW_FOLDER_DATA: &str = "
    INSERT INTO folders (folder_name, position, path)
    VALUES (?, (SELECT COUNT(folder_name) FROM folders), ?);
    ";

//language=sqlite
pub const GET_FOLDER_LIST: &str = "
    SELECT folder_name, path, position from folders ORDER BY position
    ";

//language=sqlite
pub const GET_FOLDER_DATA: &str = "
    SELECT * from folders WHERE position=?
    ";

//language=sqlite
pub const CLEAR_MEDIA: &str = "
    DELETE FROM media WHERE folder = ?
    ";

//language=sqlite
pub const CLEAR_TAGS: &str = "
    DELETE FROM tags WHERE folder_name = ?
    ";

//language=sqlite
pub const UPDATE_SORT_TYPE: &str = "
     UPDATE folders SET sort_type = ? WHERE position=?
    ";

//language=sqlite
pub const UPDATE_FOLDER_PATH: &str = "
     UPDATE folders SET path = ? WHERE position=?
    ";

//language=sqlite
pub const UPDATE_FOLDER_POSITION: &str = "
     UPDATE folders SET position = ? WHERE folder_name=?
    ";

//language=sqlite
pub const DELETE_FOLDER: &str = "
     DELETE FROM folders WHERE folder_name=?
    ";

//language=sqlite
pub const SHIFT_FOLDER_POSITIONS: &str = "
     UPDATE folders SET position = position - 1 WHERE position > ?
    ";

//language=sqlite
pub const UPDATE_FOLDER_STATUS: &str = "
     UPDATE folders SET status = ? WHERE position = ?
    ";

//language=sqlite
pub const GET_FOLDER_POSITION: &str = "
     SELECT position from folders WHERE folder_name=? AND path=?
    ";

//language=sqlite
pub const RECOVER: &str = "
     UPDATE folders SET status =2 WHERE status=1
    ";

pub const TAGS_IN_FOLDER: &str = include_str!("sql/tags_in_folder.sql");

//language=sqlite
pub const UPDATE_FOLDER_FILTER_TYPE: &str = "
    UPDATE folders
    SET filter_type = 1 - filter_type
    WHERE position = ?
";
