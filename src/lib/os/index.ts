import { IFolder } from '@/type';
import { invoke } from '@tauri-apps/api/core';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';
import { open } from '@tauri-apps/plugin-shell';

export async function openFile(path: string): Promise<void> {
  try {
    await open(path);
  } catch (e) {
    await notify(`${e}. Path: ${path}`);
  }
}

export async function buildDirectory(
  folder: IFolder,
  update?: boolean,
): Promise<void> {
  await invoke('parser', { ...folder, update: update || false });
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
