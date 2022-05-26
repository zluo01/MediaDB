import Path from 'path';

import { IKeyFiles, IMovieData, MOVIE } from '../../type';
import { toArray } from '../../utils';

export function parseMovieNFO(
  path: string,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data: any,
  files: IKeyFiles
): IMovieData {
  const d = data[MOVIE];
  return {
    type: MOVIE,
    title: d.title,
    year: d.year,
    file: d.original_filename
      ? Path.join(path, d.original_filename)
      : files.media[0],
    poster: Path.join(path, files.poster[0]) || d.poster || d.thumb,
    tags: toArray(d.tag),
    genres: toArray(d.genre),
    actors: toArray(d.actor).map((a: { name: string }) => a.name),
    studios: toArray(d.studio),
  };
}
