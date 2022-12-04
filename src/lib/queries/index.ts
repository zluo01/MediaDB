import {
  changeCardSize,
  changeSkipFolders,
  getFolder,
  getFolderInfo,
  getFolderList,
  getSetting,
  hideSidePanel,
  removeFolderFromStorage,
  updateFolderPathFromStorage,
  updateFolderSortType,
} from '@/lib/storage';
import { ICardSize, IFolder, IFolderData, ISetting } from '@/type';
import useSWR from 'swr';
import { ScopedMutator } from 'swr/dist/types';

const FOLDER = 'folder';
const FOLDER_LIST = 'folderList';
const SETTING = 'setting;';

const FOLDER_KEY = (index: number) => `folder/${index}`;
const FOLDER_DETAIL_KEY = (index: number) => `folder/info/${index}`;

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

export function useGetFolderDataQuery(route: number) {
  const { data, error, mutate } = useSWR<IFolderData>(
    FOLDER_DETAIL_KEY(route),
    () => getFolderInfo(route)
  );

  return {
    data,
    mutate,
    isLoading: !error && !data,
  };
}

export async function updateSortType(
  mutate: ScopedMutator,
  position: number,
  sortType: string
): Promise<void> {
  await updateFolderSortType(position, sortType);
  await mutations(mutate, FOLDER, FOLDER_DETAIL_KEY(position));
}

export async function revalidateFolderData(
  mutate: ScopedMutator,
  position: number
) {
  await mutations(mutate, FOLDER_LIST, FOLDER_DETAIL_KEY(position));
}

export async function updateFolderPath(mutate: ScopedMutator, folder: IFolder) {
  await updateFolderPathFromStorage(folder);
  await mutations(
    mutate,
    FOLDER_LIST,
    FOLDER_KEY(folder.position),
    FOLDER_DETAIL_KEY(folder.position)
  );
}

export async function removeFolder(mutate: ScopedMutator, folder: IFolder) {
  await removeFolderFromStorage(folder);
  await mutations(mutate, FOLDER_LIST);
}

export function useGetSettingQuery() {
  const { data, error } = useSWR<ISetting>(SETTING, getSetting);

  return {
    data,
    isLoading: !error && !data,
  };
}

export async function hidePanel(mutate: ScopedMutator, show: boolean) {
  await hideSidePanel(show);
  await mutate(SETTING);
}

export async function updateCardSize(
  mutate: ScopedMutator,
  cardSize: ICardSize
) {
  await changeCardSize(cardSize);
  await mutate(SETTING);
}

export async function updateSkipFolders(
  mutate: ScopedMutator,
  skipFolders: string
) {
  await changeSkipFolders(skipFolders);
  await mutate(SETTING);
}

export async function mutations(mutate: ScopedMutator, ...keys: string[]) {
  await Promise.all(keys.map(o => mutate(o)));
}
