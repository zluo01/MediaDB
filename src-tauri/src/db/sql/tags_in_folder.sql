SELECT tags.t                                                             AS label,
       json_group_array(json_object('group', tags.t, 'label', tags.name)) AS options
FROM (SELECT DISTINCT tags.t, tags.name
      FROM tags
               JOIN folders ON tags.folder_name = folders.folder_name
      WHERE folders.position = ?
      ORDER BY tags.t, tags.name) tags
GROUP BY tags.t
ORDER BY tags.t;
