import { buildDirectory } from '@/lib/os';
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
import { IFolder, IFolderData, ISetting } from '@/type';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

const FOLDER_LIST = 'folderList';
const SETTING = 'setting;';

const FOLDER_KEY = (index: number) => `folder/${index}`;
const FOLDER_DETAIL_KEY = (index: number) => `folder/info/${index}`;

export function useGetFolderListQuery() {
  return useSWR<IFolder[]>(FOLDER_LIST, getFolderList);
}

export function useGetFolderQuery(route: number) {
  return useSWR<IFolder>(FOLDER_KEY(route), () => getFolder(route));
}

export function useGetFolderDataQuery(route: number) {
  return useSWR<IFolderData>(FOLDER_DETAIL_KEY(route), () =>
    getFolderInfo(route)
  );
}

export function useUpdateSortTypeTrigger(position: number) {
  return useSWRMutation(FOLDER_DETAIL_KEY(position), async (_url, { arg }) => {
    await updateFolderSortType(position, arg);
  });
}

export function useCreateLibraryTrigger(position: number) {
  const { mutate } = useSWRConfig();
  return useSWRMutation(FOLDER_DETAIL_KEY(position), async (_url, { arg }) => {
    const { folder, update } = arg;
    await buildDirectory(folder, update);
    await mutate(FOLDER_LIST);
  });
}

export function useUpdateFolderPathTrigger(position: number) {
  const { mutate } = useSWRConfig();
  return useSWRMutation(FOLDER_DETAIL_KEY(position), async (_url, { arg }) => {
    await updateFolderPathFromStorage(arg);
    await mutate(FOLDER_LIST);
    await mutate(FOLDER_KEY(position));
  });
}

export function useRemoveFolderTrigger() {
  return useSWRMutation(FOLDER_LIST, async (_url, { arg }) => {
    await removeFolderFromStorage(arg);
  });
}

export function useGetSettingQuery() {
  return useSWR<ISetting>(SETTING, getSetting);
}

export function useHidePanelTrigger() {
  return useSWRMutation(
    SETTING,
    async (_url, { arg }) => await hideSidePanel(arg)
  );
}

export function useChangeCardSizeTrigger() {
  return useSWRMutation(
    SETTING,
    async (_url, { arg }) => await changeCardSize(arg)
  );
}

export function useUpdateSkipFoldersTrigger() {
  return useSWRMutation(
    SETTING,
    async (_url, { arg }) => await changeSkipFolders(arg)
  );
}
