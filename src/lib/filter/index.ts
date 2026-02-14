import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import { filterMediaWithTag } from '@/lib/storage';
import type { FilterOption, FilterType, IMediaData } from '@/type';

export async function filterMedia({
	folderId,
	mediaList,
	filterType,
	searchKey,
	tags,
}: {
	folderId: number;
	mediaList: IMediaData[];
	filterType: FilterType;
	searchKey: string;
	tags: FilterOption[];
}) {
	if (!isEmpty(tags)) {
		const filteredMediaPaths = await filterMediaWithTag(
			folderId,
			filterType,
			tags
		);

		const filteredMedia = filter(mediaList, m =>
			filteredMediaPaths.includes(m.path)
		);
		return filterOnSearchKey(filteredMedia, searchKey);
	}

	return filterOnSearchKey(mediaList, searchKey);
}

function filterOnSearchKey(mediaList: IMediaData[], searchKey: string) {
	const key = searchKey.trim().toLowerCase();
	if (isEmpty(mediaList) || key.length === 0) {
		return mediaList;
	}
	return filter(mediaList, m => m.title.toLowerCase().includes(key));
}
