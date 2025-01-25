import { convertFileSrc } from '@tauri-apps/api/core';
import join from 'lodash/join';

export function getCacheImagePath(
  folderDir: string,
  folderName: string,
  src: string,
): string {
  const cleanupImagePath = src
    .replace('\\', '/')
    .replace('.jpg', '')
    .replace('.png', '')
    .replace('.jpeg', '')
    .replace('.bmp', '')
    .replace('.gif', '')
    .replace('.webp', '');

  return convertFileSrc(
    join([folderDir, 'covers', folderName, cleanupImagePath], '/'),
  );
}
