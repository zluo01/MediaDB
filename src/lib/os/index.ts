import { DEFAULT, IFolder, IFolderInfo } from '@/type';
import { open } from '@tauri-apps/api/dialog';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/api/notification';
import { invoke } from '@tauri-apps/api/tauri';

export async function openFile(path: string): Promise<void> {
  await invoke('open_file', { path });
}

export async function getDirectory(): Promise<string> {
  const selected = await open({
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

export async function buildDirectory(folder: IFolder): Promise<IFolderInfo> {
  const data = (await invoke('parser', { ...folder })) as IFolderInfo;
  data.sort = DEFAULT;
  return data;
}
