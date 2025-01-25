import { buildDirectory } from '@/lib/os';
import {
  changeSkipFolders,
  getFolder,
  getFolderInfo,
  getFolderList,
  getFolderMedia,
  getFolderMediaTags,
  getSetting,
  hideSidePanel,
  removeFolderFromStorage,
  updateFolderList,
  updateFolderPathFromStorage,
  updateFolderSortType,
} from '@/lib/storage';
import {
  FilterOption,
  FolderStatus,
  GroupedOption,
  IFolder,
  IFolderData,
  IMediaData,
  ISetting,
  SORT,
} from '@/type';
import { getVersion } from '@tauri-apps/api/app';
import useSWR, { useSWRConfig, mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRMutation from 'swr/mutation';

const FOLDER_LIST = 'folderList';
const SETTING = 'setting;';

const FOLDER_KEY = (index: number) => `folder/${index}`;
const FOLDER_CONTENT_KEY = (index: number) => `content/${index}`;
const FOLDER_DETAIL_KEY = (index: number) => `folder/info/${index}`;

export function useGetFolderListQuery() {
  return useSWR<IFolder[]>(FOLDER_LIST, getFolderList);
}

export function useGetFolderQuery(folderId: number) {
  return useSWR<IFolder>(FOLDER_KEY(folderId), () => getFolder(folderId));
}

export function useGetFolderContent(
  folderId: number,
  searchKey: string,
  tags: FilterOption[],
) {
  return useSWR<IMediaData[]>(FOLDER_CONTENT_KEY(folderId), () =>
    getFolderMedia(folderId, searchKey, tags),
  );
}

export function useGetFolderMediaTags(folderId: number) {
  return useSWR<GroupedOption[]>(FOLDER_KEY(folderId) + '/tags', () =>
    getFolderMediaTags(folderId),
  );
}

export function useGetFolderDataQuery(folderId: number) {
  const { data, isLoading } = useSWR<IFolderData>(
    FOLDER_DETAIL_KEY(folderId),
    () => getFolderInfo(folderId),
  );

  if (isLoading || data?.status === FolderStatus.LOADING) {
    return {
      isLoading: true,
    };
  }
  return {
    data,
    isLoading: false,
  };
}

export async function updateSortType(folderId: number, sortType: SORT) {
  await updateFolderSortType(folderId, sortType);
  await mutate(
    key =>
      typeof key === 'string' &&
      [FOLDER_DETAIL_KEY(folderId), FOLDER_CONTENT_KEY(folderId)].includes(key),
    undefined,
    { revalidate: true },
  );
}

export async function createLibrary(folder: IFolder, update?: boolean) {
  await buildDirectory(folder, update);
  await mutate(
    key =>
      typeof key === 'string' &&
      [
        FOLDER_DETAIL_KEY(folder.position),
        FOLDER_LIST,
        FOLDER_KEY(folder.position) + '/tags',
      ].includes(key),
    undefined,
    { revalidate: true },
  );
}

export async function updateFolderOrder(folders: IFolder[]) {
  await updateFolderList(folders);
  await mutate(
    key =>
      typeof key === 'string' &&
      (key === FOLDER_LIST || key.startsWith('content/')),
    undefined,
    { revalidate: true },
  );
}

export function useUpdateFolderPathTrigger(folderId: number) {
  const { mutate } = useSWRConfig();
  return useSWRMutation(
    FOLDER_DETAIL_KEY(folderId),
    async (_url, opts: { arg: IFolder }) => {
      await updateFolderPathFromStorage(opts.arg);
      await mutate(FOLDER_LIST);
      await mutate(FOLDER_KEY(folderId));
    },
  );
}

export function useRemoveFolderTrigger() {
  return useSWRMutation(FOLDER_LIST, async (_url, opts: { arg: IFolder }) => {
    await removeFolderFromStorage(opts.arg);
  });
}

export function useGetSettingQuery() {
  return useSWR<ISetting>(SETTING, getSetting);
}

export function useHidePanelTrigger() {
  return useSWRMutation(
    SETTING,
    async (_url, opts: { arg: boolean }) => await hideSidePanel(opts.arg),
  );
}

export function useUpdateSkipFoldersTrigger() {
  return useSWRMutation(
    SETTING,
    async (_url, opts: { arg: string }) => await changeSkipFolders(opts.arg),
  );
}

export function useGetVersionQuery() {
  return useSWRImmutable<string>('VERSION', getVersion);
}
