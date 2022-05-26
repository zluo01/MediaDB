import AdmZip from 'adm-zip';
import Path from 'path';

import { COMIC, ICacheImage, IComicData } from '../../type';
import { getExtension } from './tvshow';

const COVER_MATCH = /cover/i;

export async function parseComicInfo(
  dir: string,
  collector: (obj: ICacheImage) => void
): Promise<IComicData> {
  const validExt = ['jpg', 'png', 'jpeg', 'avif', 'webp'];
  const zip = new AdmZip(dir);
  const zipEntries = zip
    .getEntries()
    .filter(o => !o.isDirectory)
    .filter(o => !o.entryName.startsWith('.'))
    .filter(o => validExt.includes(getExtension(o.entryName)));

  const cover = zipEntries.filter(o => COVER_MATCH.test(o.entryName));
  const data = cover.length ? cover[0].getData() : zipEntries[0].getData();

  const fileName = Path.basename(dir);
  collector({
    src: fileName,
    data,
  });
  return {
    type: COMIC,
    file: dir,
    title: fileName.replace('.' + getExtension(fileName), ''),
    poster: fileName,
    tags: [],
    actors: [],
    genres: [],
    studios: [],
  };
}
