import { IFolder, IFolderData, ISetting } from '@/type';
import { invoke } from '@tauri-apps/api/tauri';

export async function getFolderList(): Promise<IFolder[]> {
  return (await invoke<IFolder[]>('get_folder_list')) || [];
}

export async function getFolder(position: number): Promise<IFolder> {
  return (
    (await invoke<IFolder>('get_folder_info', { position })) || ({} as IFolder)
  );
}

export async function getFolderInfo(position: number): Promise<IFolderData> {
  return await invoke<IFolderData>('get_folder_data', { position });
}

export async function updateFolderPathFromStorage(
  folder: IFolder,
): Promise<void> {
  await invoke('update_folder_path', { ...folder });
}

export async function updateFolderSortType(
  position: number,
  sortType: string,
): Promise<void> {
  await invoke('update_sort_type', { position, sortType });
}

export async function removeFolderFromStorage(folder: IFolder): Promise<void> {
  await invoke('delete_folder', { ...folder });
}

export async function updateFolderList(folders: IFolder[]): Promise<void> {
  await invoke('reorder_folder', { folderList: folders.map(o => o.name) });
}

export async function getSetting(): Promise<ISetting> {
  return await invoke<ISetting>('get_setting');
}

export async function hideSidePanel(show: boolean): Promise<void> {
  await invoke('hide_side_panel', { hide: show ? 0 : 1 });
}

export async function changeSkipFolders(skipFolders: string): Promise<void> {
  await invoke('update_skip_folders', { skipFolders });
}
