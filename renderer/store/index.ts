import Store from 'electron-store';
import { IFolder, IFolderInfo, ISetting } from '../type';

const store = new Store();

const KEY = {
  FOLDER: 'folder',
  SETTING: 'setting',
};

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

export function getFolderInfo(name: string): IFolderInfo {
  return store.get(name) as IFolderInfo;
}

export async function updateFolderInfo(
  name: string,
  info: IFolderInfo
): Promise<void> {
  store.set(name, info);
}

export function removeFolder(name: string): IFolder[] {
  const folders = getFolders().filter(o => o.name !== name);
  store.set(KEY.FOLDER, folders);
  store.delete(name);
  return folders;
}

const DefaultSetting: ISetting = {
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

export function setSetting(setting: ISetting): void {
  store.set(KEY.SETTING, setting);
}
