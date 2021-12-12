import { ipcRenderer, shell } from 'electron';

import { ICacheImage } from '../../type';

export function openFile(dir: string): void {
  shell.openPath(dir).catch(err => console.error(err));
}

export async function getDirectory(): Promise<string> {
  const result: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
    'showDialog'
  );
  return result.filePaths.length > 0 ? result.filePaths[0] : '';
}

export async function cacheImage(source: ICacheImage[]): Promise<void> {
  await ipcRenderer.invoke('cacheImage', source);
}
