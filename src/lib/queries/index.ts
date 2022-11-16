import {
  addFolder,
  FOLDER_LIST,
  getFolder,
  getFolderInfo,
  getFolderList,
  getSetting,
  removeFolderFromStorage,
  SETTING,
  updateFolderPathFromStorage,
  updateSetting,
} from '@/lib/storage';
import { IFolder, IFolderInfo, ISetting } from '@/type';
import useSWR from 'swr';
import { ScopedMutator } from 'swr/dist/types';

const FOLDER_KEY = (index: number) => `folder/${index}`;
const FOLDER_DETAIL_KEY = (name: string) => `folder/info/${name}`;

export function useGetFolderListQuery() {
  const { data, error, mutate } = useSWR<IFolder[]>(FOLDER_LIST, getFolderList);

  return {
    data,
    mutate,
    isLoading: !error && !data,
  };
}

export function useGetFolderQuery(route: number) {
  const { data, error, mutate } = useSWR<IFolder>(FOLDER_KEY(route), () =>
    getFolder(route)
  );

  return {
    data,
    mutate,
    isLoading: !error && !data,
  };
}

export function useGetFolderInfoQuery(name?: string) {
  const { data, error, mutate } = useSWR<IFolderInfo>(
    name ? FOLDER_DETAIL_KEY(name) : null,
    () => getFolderInfo(name)
  );

  return {
    data,
    mutate,
    isLoading: !error && !data,
  };
}

export async function insertFunction(
  mutate: ScopedMutator,
  folder: IFolder,
  info: IFolderInfo
) {
  await addFolder(folder, info);
  await mutations(mutate, FOLDER_LIST, FOLDER_DETAIL_KEY(folder.name));
}

export async function updateFolderPath(
  mutate: ScopedMutator,
  index: number,
  path: string
) {
  await updateFolderPathFromStorage(index, path);
  await mutations(mutate, FOLDER_LIST, FOLDER_KEY(index));
}

export async function removeFolder(mutate: ScopedMutator, folder: IFolder) {
  await removeFolderFromStorage(folder);
  await mutations(mutate, FOLDER_LIST, FOLDER_DETAIL_KEY(folder.name));
}

export function useGetSettingQuery() {
  const { data, error } = useSWR<ISetting>(SETTING, getSetting);

  return {
    data,
    isLoading: !error && !data,
  };
}

export async function setSetting(mutate: ScopedMutator, setting: ISetting) {
  await updateSetting(setting);
  await mutate(SETTING);
}

export async function mutations(mutate: ScopedMutator, ...keys: string[]) {
  await Promise.all(keys.map(o => mutate(o)));
}
