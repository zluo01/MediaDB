//language=sqlite
pub const CREAT_TABLE_QUERY: &str =
    "
    create table if not exists settings
    (
        settings_id INTEGER not null
            primary key,
        hide_panel  INTEGER not null,
        card_width  INTEGER not null,
        card_height INTEGER not null,
        skip_folders TEXT default '' not null
    );
    INSERT INTO settings (settings_id, hide_panel, card_width, card_height)
    VALUES (0, 0, 240, 320) ON CONFLICT (settings_id) DO NOTHING ;
    create table if not exists folder_data
    (
        folder_name TEXT                     not null
            constraint folder_name
                primary key,
        position    INTEGER                  not null,
        data        TEXT                     not null,
        path        INTEGER                  not null,
        sort_type   TEXT default 'Directory' not null
    );
    ";

//language=sqlite
pub const GET_SETTINGS: &str =
    "
    SELECT * FROM  settings
    ";

//language=sqlite
pub const GET_SKIP_FOLDERS: &str =
    "
    SELECT skip_folders FROM settings
    ";

//language=sqlite
pub const UPDATE_HIDE_PANEL: &str =
    "
    UPDATE settings SET hide_panel = ? WHERE settings_id=0
    ";

//language=sqlite
pub const CHANGE_CARD_SIZE: &str =
    "
    UPDATE settings SET card_width = ?, card_height=? WHERE settings_id=0
    ";

//language=sqlite
pub const UPDATE_SKIP_FOLDERS: &str =
    "
    UPDATE settings SET skip_folders = ? WHERE settings_id=0
    ";

//language=sqlite
pub const INSERT_NEW_FOLDER_DATA: &str =
    "
    INSERT INTO folder_data (folder_name, position, data, path)
    VALUES (?, (SELECT COUNT(folder_name) FROM folder_data), ?, ?);
    ";

//language=sqlite
pub const GET_FOLDER_LIST: &str =
    "
    SELECT folder_name, path, position from folder_data ORDER BY position
    ";

//language=sqlite
pub const GET_FOLDER_INFO: &str =
    "
    SELECT folder_name, path, position from folder_data WHERE position=?
    ";

//language=sqlite
pub const GET_FOLDER_DATA: &str =
    "
    SELECT * from folder_data WHERE position=?
    ";

//language=sqlite
pub const UPDATE_FOLDER_DATA: &str =
    "
     UPDATE folder_data SET data = ? WHERE folder_name=?
    ";

//language=sqlite
pub const UPDATE_SORT_TYPE: &str =
    "
     UPDATE folder_data SET sort_type = ? WHERE position=?
    ";

//language=sqlite
pub const UPDATE_FOLDER_PATH: &str =
    "
     UPDATE folder_data SET path = ? WHERE position=?
    ";

//language=sqlite
pub const UPDATE_FOLDER_POSITION: &str =
    "
     UPDATE folder_data SET position = ? WHERE folder_name=?
    ";


//language=sqlite
pub const DELETE_FOLDER: &str =
    "
     DELETE FROM folder_data WHERE folder_name=?;
     UPDATE folder_data SET position = position -1 WHERE position > ?
    ";
