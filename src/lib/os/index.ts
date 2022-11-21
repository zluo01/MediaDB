import { DEFAULT, IFolder, IFolderInfo } from '@/type';
import { open as openDialog } from '@tauri-apps/api/dialog';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/api/notification';
import { open } from '@tauri-apps/api/shell';
import { invoke } from '@tauri-apps/api/tauri';

export async function openFile(path: string): Promise<void> {
  try {
    await open(path);
  } catch (e) {
    await notify(e);
  }
}

export async function getAppDataPath(): Promise<string> {
  return await invoke('get_data_path');
}

export async function buildDirectory(folder: IFolder): Promise<IFolderInfo> {
  const data = (await invoke('parser', { ...folder })) as IFolderInfo;
  data.sort = DEFAULT;
  return data;
}

export async function getDirectory(): Promise<string> {
  const selected = await openDialog({
    directory: true,
    multiple: false,
  });
  return (selected as string) || '';
}

export async function notify(errorMsg: string): Promise<void> {
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
  if (permissionGranted) {
    sendNotification(errorMsg);
  }
}
