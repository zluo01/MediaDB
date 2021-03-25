import {
  DEFAULT,
  IFolderInfo,
  IMediaData,
  IMovieData,
  MOVIE,
} from '../../type';
import FS from 'fs';
import Path from 'path';
import parser from 'fast-xml-parser';

interface IKeyFiles {
  nfo?: string;
  fanart: string[];
  poster: string[];
  thumb: string[];
  media: string[];
  dir: string[];
}

export async function buildDirectory(dir: string): Promise<IFolderInfo> {
  const media: IMediaData[] = [];
  const queue: string[] = [dir];
  const tags = new Set<string>();
  const genres = new Set<string>();
  const actors = new Set<string>();
  while (queue.length) {
    const currDir = queue.shift() as string;
    const keyFiles: IKeyFiles = {
      dir: [],
      fanart: [],
      media: [],
      poster: [],
      thumb: [],
    };
    FS.readdirSync(currDir).forEach(f => {
      if (f.startsWith('.')) {
        return;
      }
      const absolute = Path.join(currDir, f);
      if (FS.statSync(absolute).isDirectory()) {
        keyFiles.dir.push(absolute);
        return;
      }
      const ext = getExtension(f);
      switch (ext.toLowerCase()) {
        case 'nfo':
          keyFiles.nfo = f;
          break;
        case 'jpg':
        case 'png':
          if (f.includes('fanart')) {
            keyFiles.fanart.push(Path.join('file://', absolute));
          } else if (f.includes('poster')) {
            keyFiles.poster.push(Path.join('file://', absolute));
          } else if (f.includes('thumb')) {
            keyFiles.thumb.push(Path.join('file://', absolute));
          }
          break;
        case 'm4v':
        case 'avi':
        case 'mpg':
        case 'mp4':
        case 'mkv':
          keyFiles.media.push(absolute);
          break;
      }
    });

    if (keyFiles.nfo) {
      const data = FS.readFileSync(Path.join(currDir, keyFiles.nfo));
      const result = parser.parse(data.toString());
      if (result.movie) {
        const info = parseMovieNFO(currDir, result, keyFiles);
        media.push(info);
        info.tag.forEach(tags.add, tags);
        info.genre.forEach(genres.add, genres);
        info.actors.forEach(actors.add, actors);
        queue.push(...keyFiles.dir);
      } else if (result.tvshow) {
        console.log('Parse TV Shows');
      }
    } else {
      queue.push(...keyFiles.dir);
    }
  }

  return {
    sort: DEFAULT,
    data: media,
    tags: Array.from(tags),
    genres: Array.from(genres),
    actors: Array.from(actors),
  };
}

function parseMovieNFO(path: string, data: any, files: IKeyFiles): IMovieData {
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
    actors: actors.map((a: { name: string }) => a.name),
    tag: Array.isArray(d.tag) ? d.tag : [d.tag],
  };
}

function getExtension(filename: string) {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}
