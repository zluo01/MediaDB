import { describe, expect, test } from '@jest/globals';
import { Map, OrderedSet } from 'immutable';
import {
	hasTag,
	modifyTagInFolder,
	removeFolderFromStore,
	removeLastTagInFolder,
} from '@/lib/context/helper';
import type { FilterOption } from '@/type';

describe('Test Filter Context Helper Functions', () => {
	test('Add new tag for a new folder', () => {
		const source: Map<number, OrderedSet<FilterOption>> = Map({});
		const tag = { label: 'a', group: 'genres' };
		const result = modifyTagInFolder(source, 0, tag);

		expect(source.has(0)).toBeFalsy();
		expect(source.has(1)).toBeFalsy();
		expect(result.has(0)).toBeTruthy();
		expect(result.has(1)).toBeFalsy();
		expect(result.get(0)?.has(tag)).toBeTruthy();
	});

	test('Add new tag for a folder', () => {
		const t1 = { label: 'a', group: 'genres' };
		let source: Map<number, OrderedSet<FilterOption>> = Map({});
		source = source.set(0, OrderedSet.of(t1));

		const tag = { label: 'b', group: 'studio' };
		const result = modifyTagInFolder(source, 0, tag);

		expect(source.has(0)).toBeTruthy();
		expect(source.has(1)).toBeFalsy();
		expect(source.get(0)?.size).toBe(1);
		expect(source.get(0)?.has(t1)).toBeTruthy();

		expect(result.has(0)).toBeTruthy();
		expect(result.has(1)).toBeFalsy();
		expect(result.get(0)?.size).toBe(2);
		expect(result.get(0)?.has(t1)).toBeTruthy();
		expect(result.get(0)?.has(tag)).toBeTruthy();
	});

	test('Add new tag for new folder with existing folder', () => {
		const t1 = { label: 'a', group: 'genres' };
		let source: Map<number, OrderedSet<FilterOption>> = Map({});
		source = source.set(0, OrderedSet.of(t1));

		const tag = { label: 'b', group: 'studio' };
		const result = modifyTagInFolder(source, 1, tag);

		expect(source.has(0)).toBeTruthy();
		expect(source.has(1)).toBeFalsy();
		expect(source.get(0)?.size).toBe(1);
		expect(source.get(0)?.has(t1)).toBeTruthy();

		expect(result.has(0)).toBeTruthy();
		expect(result.has(1)).toBeTruthy();
		expect(result.get(0)?.size).toBe(1);
		expect(result.get(1)?.size).toBe(1);
		expect(result.get(0)?.has(t1)).toBeTruthy();
		expect(result.get(1)?.has(tag)).toBeTruthy();
	});

	test('Remove a tag from existing folder', () => {
		const t1 = { label: 'a', group: 'genres' };
		let source: Map<number, OrderedSet<FilterOption>> = Map({});
		source = source.set(0, OrderedSet.of(t1, { label: 'b', group: 'genres' }));

		const result = modifyTagInFolder(source, 0, t1);

		expect(source.has(0)).toBeTruthy();
		expect(source.has(1)).toBeFalsy();
		expect(source.get(0)?.size).toBe(2);
		expect(source.get(0)?.has(t1)).toBeTruthy();

		expect(result.has(0)).toBeTruthy();
		expect(result.has(1)).toBeFalsy();
		expect(result.get(0)?.size).toBe(1);
		expect(result.get(0)?.has(t1)).toBeFalsy();
	});

	test('Toggle existing tag by semantic identity instead of object reference', () => {
		const existingTag = { label: 'a', group: 'genres' };
		let source: Map<number, OrderedSet<FilterOption>> = Map({});
		source = source.set(0, OrderedSet.of(existingTag));

		const sameTagDifferentRef = { label: 'a', group: 'genres' };
		expect(source.get(0)?.has(sameTagDifferentRef)).toBeFalsy();
		expect(hasTag(source.get(0)!, sameTagDifferentRef)).toBeTruthy();
		const result = modifyTagInFolder(source, 0, sameTagDifferentRef);

		expect(result.get(0)?.size).toBe(0);
	});

	test('Remove last tag from existing folder', () => {
		const t1 = { label: 'a', group: 'genres' };
		let source: Map<number, OrderedSet<FilterOption>> = Map({});
		source = source.set(0, OrderedSet.of(t1, { label: 'b', group: 'genres' }));

		let result = removeLastTagInFolder(source, 0);

		expect(source.has(0)).toBeTruthy();
		expect(source.has(1)).toBeFalsy();
		expect(source.get(0)?.size).toBe(2);
		expect(source.get(0)?.has(t1)).toBeTruthy();

		expect(result.has(0)).toBeTruthy();
		expect(result.has(1)).toBeFalsy();
		expect(result.get(0)?.size).toBe(1);
		expect(result.get(0)?.has(t1)).toBeTruthy();

		result = removeLastTagInFolder(result, 0);

		expect(result.has(0)).toBeTruthy();
		expect(result.has(1)).toBeFalsy();
		expect(result.get(0)?.size).toBe(0);

		// what if empty set
		result = removeLastTagInFolder(result, 0);
		expect(result.has(0)).toBeTruthy();
		expect(result.has(1)).toBeFalsy();
		expect(result.get(0)?.size).toBe(0);
	});

	test('Remove folder', () => {
		const t1 = { label: 'a', group: 'genres' };
		let source: Map<number, OrderedSet<FilterOption>> = Map({});
		source = source
			.set(0, OrderedSet.of(t1))
			.set(1, OrderedSet.of({ label: 'b', group: 'genres' }));

		let result = removeFolderFromStore(source, 0);

		expect(source.has(0)).toBeTruthy();
		expect(source.has(1)).toBeTruthy();
		expect(source.get(0)?.size).toBe(1);
		expect(source.get(1)?.size).toBe(1);

		expect(result.has(0)).toBeFalsy();
		expect(result.has(1)).toBeTruthy();
		expect(result.get(1)?.size).toBe(1);

		result = removeFolderFromStore(result, 1);

		expect(result.has(0)).toBeFalsy();
		expect(result.has(1)).toBeFalsy();

		// try to remove key when map does not have the key
		result = removeFolderFromStore(result, 1);

		expect(result.has(0)).toBeFalsy();
		expect(result.has(1)).toBeFalsy();
	});
});
