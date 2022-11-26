//language=sqlite
pub const CREAT_TABLE_QUERY: &str =
    "
    create table settings
    (
        settings_id INTEGER not null
            primary key,
        hide_panel  INTEGER not null,
        card_width  INTEGER not null,
        card_height INTEGER not null
    );
    INSERT INTO settings (settings_id, hide_panel, card_width, card_height)
    VALUES (0, 0, 240, 320);
    create table folder_data
    (
        folder_name TEXT
            constraint folder_name
                primary key,
        position    INTEGER,
        data        TEXT
    );
    create table folder_status
    (
        folder_name TEXT    not null
            primary key,
        status      INTEGER not null,
        message     TEXT    not null
    );
    ";

//language=sqlite
pub const GET_SETTINGS: &str =
    "
    SELECT hide_panel, card_width, card_height FROM  settings
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
