import { open } from '@tauri-apps/api/shell';

import { ICacheImage } from '../../type';

export async function openFile(dir: string): Promise<void> {
  await open(dir);
}

export async function getDirectory(): Promise<string> {
  return '';
}

export async function cacheImage(source: ICacheImage[]): Promise<void> {}
