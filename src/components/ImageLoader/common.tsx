import { IFolder } from '@/type';
import { convertFileSrc } from '@tauri-apps/api/core';
import join from 'lodash/join';

export function getCacheImagePath(folder: IFolder, src: string): string {
  const cleanupImagePath = src
    .replace('\\', '/')
    .replace('.jpg', '')
    .replace('.png', '')
    .replace('.jpeg', '')
    .replace('.bmp', '')
    .replace('.gif', '')
    .replace('.webp', '');

  return convertFileSrc(
    join(
      [folder.appDir as string, 'covers', folder.name, cleanupImagePath],
      '/',
    ),
  );
}
