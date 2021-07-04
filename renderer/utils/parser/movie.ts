import Path from 'path';

import { IKeyFiles, IMovieData, MOVIE } from '../../type';

export function parseMovieNFO(
  path: string,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data: any,
  files: IKeyFiles
): IMovieData {
  const d = data[MOVIE];
  const actors = Array.isArray(d.actor) ? d.actor : [d.actor];
  return {
    type: MOVIE,
    title: d.title,
    year: d.year,
    file: d.original_filename
      ? Path.join(path, d.original_filename)
      : files.media[0],
    poster: files.poster[0] || d.poster || d.thumb,
    fanart: files.fanart[0] || d.fanart || d.fanart.thumb,
    genre: Array.isArray(d.genre) ? d.genre : [d.genre],
    actor: actors.map((a: { name: string }) => a.name),
    tag: Array.isArray(d.tag) ? d.tag : [d.tag],
    studio: Array.isArray(d.studio) ? d.studio : [d.studio],
  };
}
