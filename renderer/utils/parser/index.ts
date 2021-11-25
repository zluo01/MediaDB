import parser from 'fast-xml-parser';
import fs from 'fs';
import Path from 'path';

import { DEFAULT, IFolderInfo, IKeyFiles, IMediaData } from '../../type';
import { cacheImage } from '../electron';
import { parseComicInfo } from './comic';
import { parseMovieNFO } from './movie';
import { getExtension, parseTVShowNFO } from './tvshow';

interface IHash {
  [v: string]: number;
}

function update(m: IHash, v: string[]) {
  v.forEach(o => (m[o] = 1));
}

export async function buildDirectory(dir: string): Promise<IFolderInfo> {
  const media: IMediaData[] = [];
  const queue: string[] = [dir];
  const tags: IHash = {};
  const genres: IHash = {};
  const actors: IHash = {};
  const studios: IHash = {};
  while (queue.length) {
    const currDir = queue.shift() as string;
    const keyFiles: IKeyFiles = {
      dir: [],
      fanart: [],
      media: [],
      poster: [],
      thumb: [],
      cbr: [],
    };

    try {
      const files = await fs.promises.readdir(currDir, { withFileTypes: true });
      files.forEach(f => {
        const fileName = f.name;
        // Skip hidden folders
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
              keyFiles.fanart.push(absolute);
            } else if (fileName.includes('poster')) {
              keyFiles.poster.push(absolute);
            } else if (fileName.includes('thumb')) {
              keyFiles.thumb.push(absolute);
            }
            break;
          case 'm4v':
          case 'avi':
          case 'mpg':
          case 'mp4':
          case 'mkv':
          case 'f4v':
          case 'wmv':
            keyFiles.media.push(absolute);
            break;
          case 'cbr':
          case 'cbz':
          case 'cbt':
          case 'cb7':
            keyFiles.cbr.push(absolute);
            break;
        }
      });

      if (keyFiles.nfo) {
        const data = await fs.promises.readFile(
          Path.join(currDir, keyFiles.nfo)
        );
        const result = parser.parse(data.toString());
        let info = null;
        if (result.movie) {
          info = parseMovieNFO(currDir, result, keyFiles);
          queue.push(...keyFiles.dir.map(o => Path.join(currDir, o)));
        } else if (result.tvshow) {
          info = await parseTVShowNFO(currDir, result, keyFiles);
        }
        if (info) {
          await cacheImage(info.poster);
          media.push(info);
          update(tags, info.tag);
          update(genres, info.genre);
          update(actors, info.actor);
          update(studios, info.studio);
        }
      } else if (keyFiles.cbr.length > 0) {
        for (const cbr of keyFiles.cbr) {
          const comic = await parseComicInfo(cbr);
          media.push(comic);
        }
      } else {
        queue.push(...keyFiles.dir.map(o => Path.join(currDir, o)));
      }
    } catch (e) {
      console.error(e);
    }
  }

  return {
    sort: DEFAULT,
    data: media,
    tags: Object.keys(tags).filter(o => o !== ''),
    genres: Object.keys(genres).filter(o => o !== ''),
    actors: Object.keys(actors).filter(o => o !== ''),
    studios: Object.keys(studios).filter(o => o !== ''),
  };
}
