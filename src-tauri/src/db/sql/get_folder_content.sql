WITH filter_tags AS (SELECT json_extract(value, '$.group') AS t,
                            json_extract(value, '$.label') AS name
                     FROM json_each(?1)),
     filter_groups AS (SELECT t, COUNT(*) AS tag_count
                       FROM filter_tags
                       GROUP BY t)
SELECT media.type as t,
       media.path,
       media.title,
       media.posters,
       media.year,
       media.file,
       media.seasons,
       folders.folder_name
FROM media
         JOIN folders ON media.folder = folders.folder_name
WHERE folders.position = ?2
  AND NOT EXISTS (SELECT 1
                  FROM filter_groups fg
                  WHERE (SELECT COUNT(DISTINCT tags.name)
                         FROM tags
                                  JOIN filter_tags ft ON tags.name = ft.name AND tags.t = ft.t
                         WHERE tags.path = media.path
                           AND tags.folder_name = folders.folder_name
                           AND tags.t = fg.t) < CASE WHEN ?3 = 0 THEN 1 ELSE fg.tag_count END)
ORDER BY CASE
             WHEN folders.sort_type = 2 THEN media.title
             WHEN folders.sort_type = 4 THEN media.year
             END DESC,
         CASE
             WHEN folders.sort_type = 1 THEN media.title
             WHEN folders.sort_type = 3 THEN media.year
             ELSE media.path
             END;
