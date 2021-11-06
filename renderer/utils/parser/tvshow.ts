import fs from 'fs';
import Path from 'path';

import { IKeyFiles, IShow, ITVShowData, TV_SERIES } from '../../type';
import { cacheImage } from '../electron';

const MATCH_SEASON_NUMBER = /[Ss][eason]*[\s]*([0-9]*[0-9])/;
const MATCH_SEASON_SPECIAL = /[Ss]pecial[s]*/;

export function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts[parts.length - 1];
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

export async function parseTVShowNFO(
  path: string,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
    await cacheImage(posters[i]);
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
    actor: actors.filter((o: any) => o).map((a: { name: string }) => a.name),
    genre: Array.isArray(d.genre) ? d.genre : [d.genre],
    tag: Array.isArray(d.tag) ? d.tag : [d.tag],
    title: d.title,
    type: TV_SERIES,
    poster: files.poster[0],
    studio: Array.isArray(d.studio) ? d.studio : [d.studio],
  };
}
