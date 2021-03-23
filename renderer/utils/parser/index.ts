import { IFolderInfo, IMediaData, MOVIE, TV_SERIES } from '../../type';
import FS from 'fs';
import Path from 'path';
import parser from 'fast-xml-parser';

interface IKeyFiles {
  nfo?: string;
  fanart?: string;
  poster?: string;
  thumb?: string;
  media: string[];
}

export async function buildDirectory(dir: string): Promise<IFolderInfo> {
  const media: IMediaData[] = [];
  const queue: string[] = [dir];
  const tags = new Set<string>();
  const genres = new Set<string>();
  while (queue.length) {
    const currDir = queue.shift() as string;
    const keyFiles: IKeyFiles = { media: [] };
    FS.readdirSync(currDir).forEach(f => {
      const absolute = Path.join(currDir, f);
      if (FS.statSync(absolute).isDirectory()) {
        queue.push(absolute);
      }
      const ext = getExtension(f);
      switch (ext.toLowerCase()) {
        case 'nfo':
          keyFiles.nfo = f;
          break;
        case 'jpg':
        case 'png':
          if (f.includes('fanart')) {
            keyFiles.fanart = Path.join('file://', absolute);
          } else if (f.includes('poster')) {
            keyFiles.poster = Path.join('file://', absolute);
          } else if (f.includes('thumb')) {
            keyFiles.thumb = Path.join('file://', absolute);
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
      const info = parseNFO(currDir, keyFiles.nfo, keyFiles);
      media.push(info);
      info.tag.forEach(tags.add, tags);
      info.genre.forEach(genres.add, genres);
    }
  }
  return {
    data: media,
    tags: Array.from(tags),
    genres: Array.from(genres),
  };
}

function parseNFO(
  path: string,
  fileName: string,
  files: IKeyFiles
): IMediaData {
  const data = FS.readFileSync(Path.join(path, fileName));
  const result = parser.parse(data.toString());
  const t = result.movie ? MOVIE : TV_SERIES;
  const d = result[t];
  return {
    type: t,
    title: d.title,
    year: d.year,
    file: d.original_filename
      ? Path.join(path, d.original_filename)
      : files.media[0],
    poster: files.poster || d.poster || d.thumb,
    fanart: files.fanart || d.fanart || d.fanart.thumb,
    genre: Array.isArray(d.genre) ? d.genre : [d.genre],
    tag: Array.isArray(d.tag) ? d.tag : [d.tag],
  };
}

function getExtension(filename: string) {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}
