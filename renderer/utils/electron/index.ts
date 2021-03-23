import { ipcRenderer, shell } from 'electron';

export function openFile(dir: string): void {
  shell.openPath(dir).catch(err => console.error(err));
}

export async function getDirectory(): Promise<string> {
  const result: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
    'showDialog'
  );
  return result.filePaths.length > 0 ? result.filePaths[0] : '';
}
