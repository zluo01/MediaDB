import { invoke } from '@tauri-apps/api/core';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';
import { openPath } from '@tauri-apps/plugin-opener';

export async function openFile(path: string): Promise<void> {
  try {
    await openPath(path);
  } catch (e) {
    await notify(`${e}. Path: ${path}`);
  }
}

export async function buildDirectory(
  folderName: string,
  folderPath: string,
  folderPosition: number,
  update?: boolean,
): Promise<void> {
  await invoke('parser', {
    position: folderPosition,
    name: folderName,
    path: folderPath,
    update: update || false,
  });
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
