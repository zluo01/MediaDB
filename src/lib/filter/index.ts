import type { IMediaData } from '@/type';

export function filterOnSearchKey(
	mediaList: IMediaData[],
	searchKey: string
): IMediaData[] {
	const key = searchKey.trim().toLowerCase();
	if (mediaList.length === 0 || key.length === 0) {
		return mediaList;
	}
	return mediaList.filter(m => m.title.toLowerCase().includes(key));
}
