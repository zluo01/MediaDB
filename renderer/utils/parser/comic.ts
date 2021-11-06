import AdmZip from 'adm-zip';
import Path from 'path';

import { COMIC, IComicData } from '../../type';
import { cacheImage } from '../electron';
import { getExtension } from './tvshow';

export async function parseComicInfo(dir: string): Promise<IComicData> {
  const validExt = ['jpg', 'png', 'jpeg', 'avif', 'webp'];
  const zip = new AdmZip(dir);
  const zipEntries = zip
    .getEntries()
    .filter(o => !o.isDirectory)
    .filter(o => !o.entryName.startsWith('.'))
    .filter(o => validExt.includes(getExtension(o.entryName)));
  let data = zipEntries[0].getData();
  for (const entry of zipEntries) {
    const name = Path.basename(entry.entryName);
    if (name.startsWith('cover')) {
      data = entry.getData();
    }
  }

  const title = Path.basename(dir);
  await cacheImage(Path.basename(dir), data);
  return {
    type: COMIC,
    file: dir,
    title: title.replace('.' + getExtension(title), ''),
    poster: Path.basename(dir),
    actor: [],
    genre: [],
    studio: [],
    tag: [],
  };
}
