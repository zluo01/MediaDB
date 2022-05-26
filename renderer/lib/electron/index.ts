import { ipcRenderer, shell } from 'electron';

import { ICacheImage } from '../../type';

export async function openFile(dir: string): Promise<void> {
  await shell.openPath(dir);
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
