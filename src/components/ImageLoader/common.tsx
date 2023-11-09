import { IFolder } from '@/type';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import join from 'lodash/join';

interface IImageResponse {
  thumbnail: string;
  cover: string;
}

export function getCacheImagePath(
  folder: IFolder,
  src: string,
): IImageResponse {
  const cleanupImagePath = src
    .replace('\\', '/')
    .replace('.jpg', '')
    .replace('.png', '')
    .replace('.jpeg', '')
    .replace('.bmp', '')
    .replace('.gif', '')
    .replace('.webp', '');

  return {
    thumbnail: convertFileSrc(
      join(
        [folder.appDir as string, 'thumbnails', folder.name, cleanupImagePath],
        '/',
      ),
    ),
    cover: convertFileSrc(
      join(
        [folder.appDir as string, 'covers', folder.name, cleanupImagePath],
        '/',
      ),
    ),
  };
}
