import { type Map, OrderedSet } from 'immutable';
import type { FilterOption } from '@/type';

function isSameTag(a: FilterOption, b: FilterOption) {
	return a.group === b.group && a.label === b.label;
}

export function hasTag(
	tagSet: OrderedSet<FilterOption>,
	tag: FilterOption
): boolean {
	return tagSet.some(candidate => isSameTag(candidate, tag));
}

export function modifyTagInFolder(
	tagRecord: Map<number, OrderedSet<FilterOption>>,
	folderId: number,
	tag: FilterOption
) {
	if (!tagRecord.has(folderId)) {
		return tagRecord.set(folderId, OrderedSet.of(tag));
	}
	const previousTags = tagRecord.get(folderId);
	const existingTag = previousTags!.find(candidate =>
		isSameTag(candidate, tag)
	);
	const nextTags = existingTag
		? previousTags!.delete(existingTag)
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
