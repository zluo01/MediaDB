import { buildDirectory } from '@/lib/os';
import {
  changeSkipFolders,
  getFolder,
  getFolderInfo,
  getFolderList,
  getFolderMediaTags,
  getSetting,
  hideSidePanel,
  removeFolderFromStorage,
  updateFolderPathFromStorage,
  updateFolderSortType,
} from '@/lib/storage';
import {
  FolderStatus,
  GroupedOption,
  IFolder,
  IFolderData,
  ISetting,
} from '@/type';
import { getVersion } from '@tauri-apps/api/app';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
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

export function useGetFolderMediaTags(route: number) {
  return useSWR<GroupedOption[]>(FOLDER_KEY(route) + '/tags', () =>
    getFolderMediaTags(route),
  );
}

export function useGetFolderDataQuery(route: number) {
  const { data, isLoading } = useSWR<IFolderData>(
    FOLDER_DETAIL_KEY(route),
    () => getFolderInfo(route),
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

export function useUpdateSortTypeTrigger(position: number) {
  return useSWRMutation(
    FOLDER_DETAIL_KEY(position),
    async (_url, opts: { arg: number }) => {
      await updateFolderSortType(position, opts.arg);
    },
  );
}

interface ICreateLibraryProps {
  folder: IFolder;
  update?: boolean;
}

export function useCreateLibraryTrigger(position: number) {
  const { mutate } = useSWRConfig();
  return useSWRMutation(
    FOLDER_DETAIL_KEY(position),
    async (_url, opts: { arg: ICreateLibraryProps }) => {
      const { folder, update } = opts.arg;
      await buildDirectory(folder, update);
      await mutate(FOLDER_LIST);
      await mutate(FOLDER_KEY(position) + '/tags');
    },
  );
}

export function useUpdateFolderPathTrigger(position: number) {
  const { mutate } = useSWRConfig();
  return useSWRMutation(
    FOLDER_DETAIL_KEY(position),
    async (_url, opts: { arg: IFolder }) => {
      await updateFolderPathFromStorage(opts.arg);
      await mutate(FOLDER_LIST);
      await mutate(FOLDER_KEY(position));
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
