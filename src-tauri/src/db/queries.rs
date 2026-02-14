//language=sqlite
pub const CREAT_TABLE_QUERY: &str = "
    create table if not exists settings
    (
        settings_id INTEGER not null
            primary key,
        hide_panel  INTEGER not null,
        skip_folders TEXT default '' not null
    );
    INSERT INTO settings (settings_id, hide_panel)
    VALUES (0, 0) ON CONFLICT (settings_id) DO NOTHING ;
    create table if not exists folders
    (
        folder_name TEXT              not null
            constraint folder_name
                primary key,
        position    INTEGER           not null,
        path        INTEGER           not null,
        sort_type   INTEGER default 0 not null,
        filter_type INTEGER default 0 not null,
        status      INTEGER default 0 not null
    );
    create index folders_position_index
        on folders (position);
    create table if not exists media
    (
        type    INTEGER not null,
        path    TEXT    not null,
        title   TEXT    not null,
        posters TEXT    not null,
        year    TEXT,
        file    TEXT,
        seasons TEXT,
        folder  TEXT    not null
            constraint media_folders_folder_name_fk
                references folders
                on update cascade on delete cascade,
        constraint media_pk
            primary key (type, path)
    );
    create index media_title_asc_index
        on media (title);
    create index media_title_desc_index
        on media (title desc);
    create index media_year_asc_index
        on media (year);
    create index media_year_desc__index
        on media (year desc);
    CREATE INDEX media_folder_index ON media(folder);
    create table if not exists tags
    (
        folder_name TEXT not null
            constraint tags_folders_folder_name_fk
                references folders
                on update cascade on delete cascade,
        path        TEXT not null,
        t           TEXT not null,
        name        TEXT not null,
        constraint tags_pk
            unique (folder_name, path, name, t),
        constraint tags_t_check
            check (t IN ('genres', 'tags', 'actors', 'studios'))
    );
    create index tags_folder_name_index
        on tags (folder_name);
    ";

//language=sqlite
pub const GET_FOLDER_CONTENT: &str = "
    SELECT media.type as t,
           media.path,
           media.title,
           media.posters,
           media.year,
           media.file,
           media.seasons
    FROM media
             JOIN folders ON media.folder = folders.folder_name
    WHERE folders.position = ?
    ORDER BY CASE
                 WHEN folders.sort_type = 2 THEN media.title
                 WHEN folders.sort_type = 4 THEN media.year
                 END DESC,
             CASE
                 WHEN folders.sort_type = 1 THEN media.title
                 WHEN folders.sort_type = 3 THEN media.year
                 ELSE media.path
                 END;
";

//language=sqlite
pub const GET_TAGS_IN_FOLDER: &str = "
    SELECT tags.path as path,
           tags.t    as tag_group,
           tags.name as tag_label
    FROM media
             JOIN folders ON media.folder = folders.folder_name
             JOIN tags ON media.path = tags.path
    WHERE folders.position = ?
";

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
pub const GET_FOLDER_INFO: &str = "
    SELECT folder_name, path, position from folders WHERE position=?
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
pub const INSERT_NEW_MEDIA: &str =
    "
     INSERT INTO media (type, path, title, posters, year, file, seasons, folder) VALUES (?,?,?,?,?,?,?,?)
    ";

//language=sqlite
pub const INSERT_NEW_TAG: &str = "
    INSERT INTO tags (folder_name, path, name, t) VALUES (?,?,?,?) ON CONFLICT DO NOTHING
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

//language=sqlite
pub const TAGS_IN_FOLDER: &str = "
    SELECT DISTINCT tags.t as tag_group, tags.name as tag_label
    FROM tags
             JOIN folders ON tags.folder_name = folders.folder_name
    WHERE folders.position = ?
    ORDER BY 1, 2;
    ";

//language=sqlite
pub const UPDATE_FOLDER_FILTER_TYPE: &str = "
    UPDATE folders
    SET filter_type = 1 - filter_type
    WHERE position = ?
";
