import { QueryClient, queryOptions } from '@tanstack/solid-query';
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
	switchFolderFilterType,
	updateFolderSortType,
} from '@/lib/storage';
import type { IFolder, SORT } from '@/type';

const FOLDER_LIST = 'folderList';
const SETTING = 'setting';
const TAGS = 'TAGS';
const FOLDER_DETAIL = 'folder/info';
const FOLDER_CONTENT = 'content';

export const queryClient = new QueryClient();

export const folderListQueryOptions = () =>
	queryOptions({
		queryKey: [FOLDER_LIST],
		queryFn: getFolderList,
	});

export const contentQueryOptions = (folderId: number) =>
	queryOptions({
		queryKey: [FOLDER_CONTENT, folderId],
		queryFn: () => getFolderMedia(folderId),
		throwOnError: true,
	});

export const mediaTagsQueryOptions = (folderId: number) =>
	queryOptions({
		queryKey: [TAGS, folderId],
		queryFn: () => getFolderMediaTags(folderId),
	});

export const folderDataQueryOptions = (folderId: number) =>
	queryOptions({
		queryKey: [FOLDER_DETAIL, folderId],
		queryFn: () => getFolderInfo(folderId),
		throwOnError: true,
	});

export async function switchFilterType(folderId: number) {
	await switchFolderFilterType(folderId);
	queryClient.invalidateQueries({ queryKey: [FOLDER_DETAIL, folderId] });
}

export async function updateSortType(folderId: number, sortType: SORT) {
	await updateFolderSortType(folderId, sortType);
	queryClient.invalidateQueries({ queryKey: [FOLDER_CONTENT, folderId] });
	queryClient.invalidateQueries({ queryKey: [FOLDER_DETAIL, folderId] });
}

export async function createLibrary(
	folderName: string,
	folderPath: string,
	folderPosition: number,
	update?: boolean
) {
	await buildDirectory(folderName, folderPath, folderPosition, update);
	queryClient.invalidateQueries({ queryKey: [FOLDER_LIST] });
	queryClient.invalidateQueries({ queryKey: [TAGS, folderPosition] });
	queryClient.invalidateQueries({ queryKey: [FOLDER_DETAIL, folderPosition] });
}

export function invalidateForFolderPathChange(folderId: number) {
	queryClient.invalidateQueries({ queryKey: [FOLDER_DETAIL, folderId] });
	queryClient.invalidateQueries({ queryKey: [FOLDER_CONTENT, folderId] });
	queryClient.invalidateQueries({ queryKey: [TAGS, folderId] });
}

export async function removeFolder(folder: IFolder) {
	try {
		await removeFolderFromStorage(folder);
		invalidateFolderListChange();
	} catch (e) {
		await notify(`Update Folder Error: ${e}`);
	}
}

export function invalidateFolderListChange() {
	queryClient.invalidateQueries({ queryKey: [FOLDER_LIST] });
}

export function invalidateFolderInformation(folderId: number) {
	queryClient.invalidateQueries({ queryKey: [TAGS, folderId] });
	queryClient.invalidateQueries({ queryKey: [FOLDER_DETAIL, folderId] });
}

export async function changePanelDisplay(status: boolean) {
	await hideSidePanel(status);
	invalidSetting();
}

export const settingQueryOptions = () =>
	queryOptions({
		queryKey: [SETTING],
		queryFn: getSetting,
	});

export async function updateSkipFolder(skipFolders: string) {
	await changeSkipFolders(skipFolders);
	invalidSetting();
}

function invalidSetting() {
	queryClient.invalidateQueries({ queryKey: [SETTING] });
}
