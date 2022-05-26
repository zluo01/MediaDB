import fxparser from 'fast-xml-parser';
import fs from 'fs';
import Path from 'path';

import {
  DEFAULT,
  ICacheImage,
  IFolderInfo,
  IKeyFiles,
  IMediaData,
} from '../../type';
import { cacheImage } from '../electron';
import { TagAggregator } from './aggregator';
import { parseComicInfo } from './comic';
import { parseMovieNFO } from './movie';
import { getExtension, parseTVShowNFO } from './tvshow';

const parser = new fxparser.XMLParser();

export async function buildDirectory(dir: string): Promise<IFolderInfo> {
  const media: IMediaData[] = [];
  const queue: string[] = [dir];
  const thumbnails: ICacheImage[] = [];
  const tagAggregator = new TagAggregator();

  while (queue.length) {
    const currDir = queue.shift() as string;
    const keyFiles: IKeyFiles = {
      dir: [],
      media: [],
      poster: [],
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
            if (fileName.includes('poster')) {
              keyFiles.poster.push(fileName);
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
          info = await parseTVShowNFO(currDir, result, keyFiles, obj =>
            thumbnails.push(obj)
          );
        }
        if (info) {
          thumbnails.push({
            src: info.poster,
            data: info.poster,
          });
          media.push(info);
          tagAggregator.aggregate(info);
        }
      } else if (keyFiles.cbr.length > 0) {
        for (const cbr of keyFiles.cbr) {
          const comic = await parseComicInfo(cbr, obj => thumbnails.push(obj));
          media.push(comic);
        }
      } else {
        queue.push(...keyFiles.dir.map(o => Path.join(currDir, o)));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // creating thumbnails
  await cacheImage(thumbnails);

  return {
    sort: DEFAULT,
    data: media,
    tags: tagAggregator.getTags(),
    genres: tagAggregator.getGenres(),
    actors: tagAggregator.getActors(),
    studios: tagAggregator.getStudios(),
  };
}
