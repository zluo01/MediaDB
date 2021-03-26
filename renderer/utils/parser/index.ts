import {
  DEFAULT,
  IFolderInfo,
  IMediaData,
  IMovieData,
  ITVShowData,
  MOVIE,
  TV_SERIES,
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
  const studios = new Set<string>();
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
        keyFiles.dir.push(f);
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
      let info = null;
      if (result.movie) {
        info = parseMovieNFO(currDir, result, keyFiles);
        queue.push(...keyFiles.dir.map(o => Path.join(currDir, o)));
      } else if (result.tvshow) {
        info = parseTVShowNFO(currDir, result, keyFiles);
      }
      if (info) {
        media.push(info);
        info.tag.forEach(tags.add, tags);
        info.genre.forEach(genres.add, genres);
        info.actor.forEach(actors.add, actors);
        info.studio.forEach(studios.add, studios);
      }
    } else {
      queue.push(...keyFiles.dir.map(o => Path.join(currDir, o)));
    }
  }

  return {
    sort: DEFAULT,
    data: media,
    tags: Array.from(tags).filter(o => o !== ''),
    genres: Array.from(genres).filter(o => o !== ''),
    actors: Array.from(actors).filter(o => o !== ''),
    studios: Array.from(studios).filter(o => o !== ''),
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
    actor: actors.map((a: { name: string }) => a.name),
    tag: Array.isArray(d.tag) ? d.tag : [d.tag],
    studio: Array.isArray(d.studio) ? d.studio : [d.studio],
  };
}

function parseTVShowNFO(
  path: string,
  data: any,
  files: IKeyFiles
): ITVShowData {
  const d = data[TV_SERIES];
  const actors = Array.isArray(d.actor) ? d.actor : [d.actor];
  const dir = [...files.dir];
  dir.sort((a, b) => {
    const matchA = a.match(/[Ss][eason]*[\s]*([0-9]*[0-9])/);
    const matchB = b.match(/[Ss][eason]*[\s]*([0-9]*[0-9])/);
    if (!matchA || !matchB) {
      return 1;
    }
    return parseInt(matchA[1]) - parseInt(matchB[1]);
  });
  const shows = dir
    .filter(o => o.match(/[Ss][eason]*[\s]*([0-9]*[0-9])/) || o === 'Specials')
    .map(o => {
      const currPath = Path.join(path, o);
      return {
        name: o,
        files: FS.readdirSync(currPath)
          .filter(f =>
            ['m4v', 'avi', 'mp4', 'mkv', 'mpg', 'rmvb'].includes(
              getExtension(f)
            )
          )
          .map(d => Path.join(currPath, d)),
      };
    });
  return {
    fanart: files.fanart,
    shows: shows,
    actor: actors.map((a: { name: string }) => a.name),
    genre: Array.isArray(d.genre) ? d.genre : [d.genre],
    tag: Array.isArray(d.tag) ? d.tag : [d.tag],
    title: d.title,
    type: 'tvshow',
    poster: files.poster,
    studio: Array.isArray(d.studio) ? d.studio : [d.studio],
  };
}

function getExtension(filename: string) {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}
