import { buildDirectory, notify } from '@/lib/os';
import {
  changeSkipFolders,
  getFolderInfo,
  getFolderList,
  getFolderMedia,
  getFolderMediaTags,
  getSetting,
  hideSidePanel,
  removeFolderFromStorage,
  updateFolderSortType,
} from '@/lib/storage';
import { FilterOption, IFolder, SORT } from '@/type';
import { QueryClient, queryOptions } from '@tanstack/solid-query';

const FOLDER_LIST = 'folderList';
const SETTING = 'setting';
const TAGS = 'TAGS';

const FOLDER_KEY = `folder`;
const FOLDER_CONTENT_KEY = `content`;
const FOLDER_DETAIL_KEY = `folder/info`;

export const queryClient = new QueryClient();

export const folderListQueryOptions = () =>
  queryOptions({
    queryKey: [FOLDER_LIST],
    queryFn: getFolderList,
  });

export const contentQueryOptions = (
  folderId: number,
  searchKey: string,
  tags: FilterOption[],
) =>
  queryOptions({
    queryKey: [FOLDER_CONTENT_KEY, folderId, searchKey, tags],
    queryFn: () => getFolderMedia(folderId, searchKey, tags),
  });

export const mediaTagsQueryOptions = (folderId: number) =>
  queryOptions({
    queryKey: [TAGS, folderId],
    queryFn: () => getFolderMediaTags(folderId),
  });

export const folderDataQueryOptions = (folderId: number) =>
  queryOptions({
    queryKey: [FOLDER_DETAIL_KEY, folderId],
    queryFn: () => getFolderInfo(folderId),
  });

export async function updateSortType(folderId: number, sortType: SORT) {
  await updateFolderSortType(folderId, sortType);
  await queryClient.invalidateQueries({
    predicate: query => {
      return (
        [FOLDER_CONTENT_KEY, FOLDER_DETAIL_KEY].includes(
          query.queryKey[0] as string,
        ) && query.queryKey[1] === folderId
      );
    },
    refetchType: 'active',
  });
}

export async function createLibrary(
  folderName: string,
  folderPath: string,
  folderPosition: number,
  update?: boolean,
) {
  await buildDirectory(folderName, folderPath, folderPosition, update);
  await queryClient.invalidateQueries({
    predicate: query => {
      return (
        [FOLDER_LIST, TAGS, FOLDER_DETAIL_KEY].includes(
          query.queryKey[0] as string,
        ) && query.queryKey[1] === folderPosition
      );
    },
    refetchType: 'active',
  });
}

// export async function updateFolderOrder(folders: IFolder[]) {
//   await updateFolderList(folders);
//   await mutate(
//     key =>
//       typeof key === 'string' &&
//       (key === FOLDER_LIST || key.startsWith('content/')),
//     undefined,
//     { revalidate: true },
//   );
// }

export async function invalidateForFolderPathChange(folderId: number) {
  await queryClient.invalidateQueries({
    predicate: query => {
      return (
        [FOLDER_LIST, FOLDER_KEY, FOLDER_DETAIL_KEY].includes(
          query.queryKey[0] as string,
        ) && query.queryKey[1] === folderId
      );
    },
    refetchType: 'active',
  });
}

export async function removeFolder(folder: IFolder) {
  try {
    await removeFolderFromStorage(folder);
    await invalidateFolderListChange();
  } catch (e) {
    await notify(`Update Folder Error: ${e}`);
  }
}

export async function invalidateFolderListChange() {
  await queryClient.invalidateQueries({
    queryKey: [FOLDER_LIST],
    exact: true,
    refetchType: 'active',
  });
}

export async function invalidateFolderInformation(folderId: number) {
  await queryClient.invalidateQueries({
    predicate: query => {
      return (
        [TAGS, FOLDER_DETAIL_KEY].includes(query.queryKey[0] as string) &&
        query.queryKey[1] === folderId
      );
    },
    refetchType: 'active',
  });
}

export async function changePanelDisplay(status: boolean) {
  await hideSidePanel(status);
  await invalidSetting();
}

export const settingQueryOptions = () =>
  queryOptions({
    queryKey: [SETTING],
    queryFn: getSetting,
  });

export async function updateSkipFolder(skipFolders: string) {
  await changeSkipFolders(skipFolders);
  await invalidSetting();
}

async function invalidSetting() {
  await queryClient.invalidateQueries({
    queryKey: [SETTING],
    exact: true,
    refetchType: 'active',
  });
}
