import { type Map, OrderedSet } from 'immutable';
import type { FilterOption } from '@/type';

export function modifyTagInFolder(
	tagRecord: Map<number, OrderedSet<FilterOption>>,
	folderId: number,
	tag: FilterOption
) {
	if (!tagRecord.has(folderId)) {
		return tagRecord.set(folderId, OrderedSet.of(tag));
	}
	const previousTags = tagRecord.get(folderId);
	const nextTags = previousTags!.includes(tag)
		? previousTags!.delete(tag)
		: previousTags!.add(tag);
	return tagRecord.set(folderId, nextTags);
}

export function removeLastTagInFolder(
	tagRecord: Map<number, OrderedSet<FilterOption>>,
	folderId: number
) {
	if (!tagRecord.has(folderId)) {
		return tagRecord;
	}
	return tagRecord.set(folderId, tagRecord.get(folderId)!.butLast());
}

export function removeFolderFromStore(
	tagRecord: Map<number, OrderedSet<FilterOption>>,
	folderId: number
) {
	return tagRecord.delete(folderId);
}
