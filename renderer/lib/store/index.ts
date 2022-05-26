import crypto from 'crypto';
import Store from 'electron-store';
import path from 'path';

import { IFolder, IFolderInfo, ISetting } from '../../type';

const dataStore = new Store({ name: 'data' });
const settingStore = new Store({ name: 'setting' });

const KEY = {
  FOLDER: 'folder',
  SETTING: 'setting',
};

export function getFolder(index: number): IFolder {
  const folders = getFolders();
  return folders[index];
}

export function getFolders(): IFolder[] {
  return dataStore.get(KEY.FOLDER, []) as IFolder[];
}

export function addFolder(folder: IFolder, values: IFolderInfo): IFolder[] {
  const folders = getFolders();
  folders.push(folder);
  dataStore.set(KEY.FOLDER, folders);
  dataStore.set(folder.name, values);
  return folders;
}

export function updateFolderName(index: number, name: string): IFolder[] {
  const folders = getFolders();
  const prevName = folders[index].name;
  const info = dataStore.get(prevName);
  folders[index].name = name;
  dataStore.set(KEY.FOLDER, folders);
  dataStore.delete(prevName);
  dataStore.set(name, info);
  return folders;
}

export function getFolderInfo(name: string): IFolderInfo {
  return dataStore.get(name) as IFolderInfo;
}

export function updateFolderInfo(name: string, info: IFolderInfo): IFolderInfo {
  dataStore.set(name, info);
  return info;
}

export function removeFolder(name: string): IFolder[] {
  const folders = getFolders().filter(o => o.name !== name);
  dataStore.set(KEY.FOLDER, folders);
  dataStore.delete(name);
  return folders;
}

export function updateFolders(folders: IFolder[]): void {
  dataStore.set(KEY.FOLDER, folders);
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
  return settingStore.get(KEY.SETTING, DefaultSetting) as ISetting;
}

export function setSetting(setting: ISetting): ISetting {
  settingStore.set(KEY.SETTING, setting);
  return setting;
}

export function getCacheImagePath(dir: string): string {
  const fileName = crypto.createHash('md5').update(dir).digest('hex');
  return (
    'file://' + path.join(path.dirname(dataStore.path), 'thumbnail', fileName)
  );
}
