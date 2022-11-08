import { IFolder, IFolderInfo, ISetting } from '@/type';
import { removeDir, BaseDirectory } from '@tauri-apps/api/fs';
import localforage from 'localforage';
import { ScopedMutator } from 'swr/dist/types';

export const FOLDER = 'folder';
export const FOLDER_LIST = 'folderList';
export const SETTING = 'setting;';

const dataStore = localforage.createInstance({
  name: 'data',
});

const settingStore = localforage.createInstance({
  name: 'setting',
});

export async function getFolderList(): Promise<IFolder[]> {
  return (await dataStore.getItem(FOLDER)) || [];
}

export async function getFolder(index: number): Promise<IFolder> {
  const folders = await getFolderList();
  return folders[index] || ({} as IFolder);
}

export async function getFolderInfo(name: string): Promise<IFolderInfo> {
  return (await dataStore.getItem(name)) as IFolderInfo;
}

export async function addFolder(
  folder: IFolder,
  info: IFolderInfo,
  mutate: ScopedMutator
): Promise<number> {
  const folders = await getFolderList();
  folders.push(folder);
  await Promise.all([
    dataStore.setItem(FOLDER, folders),
    dataStore.setItem(folder.name, info),
  ]);
  await Promise.all([mutate(FOLDER_LIST), mutate([FOLDER, folder.name])]);
  return folders.length - 1;
}

export async function updateFolderPath(
  index: number,
  path: string,
  mutate: ScopedMutator
): Promise<void> {
  const folders = await getFolderList();
  folders[index].path = path;
  await dataStore.setItem(FOLDER, folders);
  await Promise.all([mutate(FOLDER_LIST), mutate([FOLDER_LIST, index])]);
}

export async function updateFolderInfo(
  name: string,
  info: IFolderInfo,
  mutate: ScopedMutator
): Promise<void> {
  await dataStore.setItem(name, info);
  await mutate([FOLDER, name]);
}

export async function removeFolder(folder: IFolder, mutate): Promise<void> {
  const folders = (await getFolderList()).filter(o => o.name !== folder.name);
  await dataStore.setItem(FOLDER, folders);
  await dataStore.removeItem(folder.name);
  const folder_dir = folder.path.substring(folder.path.lastIndexOf('/') + 1);
  await removeDir(`thumbnails/${folder_dir}`, {
    dir: BaseDirectory.App,
    recursive: true,
  });
  await Promise.all([mutate(FOLDER_LIST), mutate([FOLDER, folder.name])]);
}

export async function updateFolderList(
  folders: IFolder[],
  mutate: ScopedMutator
): Promise<void> {
  await dataStore.setItem(FOLDER, folders);
  await mutate(FOLDER_LIST);
}

export const DefaultSetting: ISetting = {
  showSidePanelName: true,
  skippingDirectory: [],
  cardSize: {
    width: 240,
    height: 360,
  },
};

export async function getSetting(): Promise<ISetting> {
  return (await settingStore.getItem(SETTING)) || DefaultSetting;
}

export async function updateSetting(
  setting: ISetting,
  mutate: ScopedMutator
): Promise<void> {
  await settingStore.setItem(SETTING, setting);
  await mutate(SETTING);
}
