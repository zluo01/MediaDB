create table if not exists settings
(
    settings_id  INTEGER         not null
        primary key,
    hide_panel   INTEGER         not null,
    skip_folders TEXT default '' not null
);
INSERT INTO settings (settings_id, hide_panel)
VALUES (0, 0)
ON CONFLICT (settings_id) DO NOTHING;
create table if not exists folders
(
    folder_name TEXT              not null
        constraint folder_name
            primary key,
    position    INTEGER           not null,
    path        TEXT              not null unique,
    sort_type   INTEGER default 0 not null,
    filter_type INTEGER default 0 not null,
    status      INTEGER default 0 not null
);
create index if not exists folders_position_index
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
create index if not exists media_title_index
    on media (title);
create index if not exists media_year_index
    on media (year);
create index if not exists media_folder_index on media (folder);
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
create index if not exists tags_folder_name_index
    on tags (folder_name);
