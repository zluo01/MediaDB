import {
  DEFAULT,
  IFolderInfo,
  IMediaData,
  IMovieData,
  IShow,
  ITVShowData,
  MOVIE,
  TV_SERIES,
} from '../../type';
import fs from 'fs';
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

const MATCH_SEASON_NUMBER = /[Ss][eason]*[\s]*([0-9]*[0-9])/;
const MATCH_SEASON_SPECIAL = /[Ss]pecial[s]*/;

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

    const files = await fs.promises.readdir(currDir, { withFileTypes: true });
    files.forEach(f => {
      const fileName = f.name;
      if (fileName.startsWith('.')) {
        return;
      }
      if (f.isDirectory()) {
        keyFiles.dir.push(fileName);
        return;
      }
      const absolute = Path.join(currDir, fileName);
      const ext = getExtension(fileName);
      switch (ext.toLowerCase()) {
        case 'nfo':
          keyFiles.nfo = f.name;
          break;
        case 'jpg':
        case 'png':
          if (fileName.includes('fanart')) {
            keyFiles.fanart.push(Path.join('file://', absolute));
          } else if (fileName.includes('poster')) {
            keyFiles.poster.push(Path.join('file://', absolute));
          } else if (fileName.includes('thumb')) {
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
      const data = await fs.promises.readFile(Path.join(currDir, keyFiles.nfo));
      const result = parser.parse(data.toString());
      let info = null;
      if (result.movie) {
        info = parseMovieNFO(currDir, result, keyFiles);
        queue.push(...keyFiles.dir.map(o => Path.join(currDir, o)));
      } else if (result.tvshow) {
        info = await parseTVShowNFO(currDir, result, keyFiles);
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

async function parseTVShowNFO(
  path: string,
  data: any,
  files: IKeyFiles
): Promise<ITVShowData> {
  const d = data[TV_SERIES];
  const actors = Array.isArray(d.actor) ? d.actor : [d.actor];
  let dir = [...files.dir];
  dir.sort((a, b) => {
    const matchA = a.match(MATCH_SEASON_NUMBER);
    const matchB = b.match(MATCH_SEASON_NUMBER);
    if (!matchA || !matchB) {
      return 1;
    }
    return parseInt(matchA[1]) - parseInt(matchB[1]);
  });
  const posters = getPostersForSeasons(dir, files.poster);
  dir = dir.filter(
    o => o.match(MATCH_SEASON_NUMBER) || o.match(MATCH_SEASON_SPECIAL)
  );

  const shows: IShow[] = [];
  for (let i = 0; i < dir.length; i++) {
    const currPath = Path.join(path, dir[i]);
    const files = await fs.promises.readdir(currPath, { withFileTypes: true });
    shows.push({
      name: dir[i],
      poster: posters[i],
      files: files
        .filter(o => !o.isDirectory())
        .filter(f =>
          ['m4v', 'avi', 'mp4', 'mkv', 'mpg', 'rmvb'].includes(
            getExtension(f.name)
          )
        )
        .map(d => Path.join(currPath, d.name)),
    });
  }

  return {
    fanart: files.fanart,
    shows: shows,
    actor: actors.map((a: { name: string }) => a.name),
    genre: Array.isArray(d.genre) ? d.genre : [d.genre],
    tag: Array.isArray(d.tag) ? d.tag : [d.tag],
    title: d.title,
    type: 'tvshow',
    poster: files.poster[0],
    studio: Array.isArray(d.studio) ? d.studio : [d.studio],
  };
}

function getPostersForSeasons(dirs: string[], posters: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < dirs.length; i++) {
    let find = false;
    if (dirs[i].match(MATCH_SEASON_SPECIAL)) {
      for (let j = 0; j < posters.length; j++) {
        if (posters[j].match(MATCH_SEASON_SPECIAL)) {
          result.push(posters[j]);
          find = true;
          break;
        }
      }
      if (!find) {
        result.push(posters[0]);
        continue;
      }
    }
    const match = dirs[i].match(MATCH_SEASON_NUMBER);
    if (match) {
      for (let j = 0; j < posters.length; j++) {
        const pMatch = posters[j].match(MATCH_SEASON_NUMBER);
        if (pMatch && parseInt(pMatch[1]) === parseInt(match[1])) {
          result.push(posters[j]);
          find = true;
          break;
        }
      }
      if (!find) {
        result.push(posters[0]);
      }
    }
  }
  return result;
}

function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}
