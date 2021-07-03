import Store from 'electron-store';

import { IFolder, IFolderInfo, ISetting } from '../../type';

const store = new Store();

const KEY = {
  FOLDER: 'folder',
  SETTING: 'setting',
};

export function getFolder(index: number): IFolder {
  const folders = getFolders();
  return folders[index];
}

export function getFolders(): IFolder[] {
  return store.get(KEY.FOLDER, []) as IFolder[];
}

export function addFolder(folder: IFolder, values: IFolderInfo): IFolder[] {
  const folders = getFolders();
  folders.push(folder);
  store.set(KEY.FOLDER, folders);
  store.set(folder.name, values);
  return folders;
}

export async function updateFolderName(
  index: number,
  name: string
): Promise<IFolder[]> {
  const folders = getFolders();
  const prevName = folders[index].name;
  const info = store.get(prevName);
  folders[index].name = name;
  store.set(KEY.FOLDER, folders);
  store.delete(prevName);
  store.set(name, info);
  return folders;
}

export async function getFolderInfo(name: string): Promise<IFolderInfo> {
  return store.get(name) as IFolderInfo;
}

export async function updateFolderInfo(
  name: string,
  info: IFolderInfo
): Promise<IFolderInfo> {
  store.set(name, info);
  return info;
}

export async function removeFolder(name: string): Promise<IFolder[]> {
  const folders = getFolders().filter(o => o.name !== name);
  store.set(KEY.FOLDER, folders);
  store.delete(name);
  return folders;
}

export async function updateFolders(folders: IFolder[]): Promise<void> {
  store.set(KEY.FOLDER, folders);
}

export const DefaultSetting: ISetting = {
  showSidePanelName: true,
  skippingDirectory: [],
  cardSize: {
    width: 240,
    height: 360,
  },
};

export function getSetting(): ISetting {
  return store.get(KEY.SETTING, DefaultSetting) as ISetting;
}

export async function setSetting(setting: ISetting): Promise<ISetting> {
  store.set(KEY.SETTING, setting);
  return setting;
}
