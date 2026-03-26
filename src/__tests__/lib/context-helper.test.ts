import { describe, expect, test } from '@jest/globals';
import { Map, OrderedSet } from 'immutable';
import {
	hasTag,
	modifyTagInFolder,
	removeFolderFromStore,
	removeLastTagInFolder,
} from '@/lib/context/helper';
import type { FilterOption } from '@/type';

const ACTION: FilterOption = { group: 'genres', label: 'Action' };
const COMEDY: FilterOption = { group: 'genres', label: 'Comedy' };
const PIXAR: FilterOption = { group: 'studios', label: 'Pixar' };

describe('hasTag', () => {
	test('returns true when tag exists in set', () => {
		const set = OrderedSet.of(ACTION, COMEDY);
		expect(hasTag(set, ACTION)).toBe(true);
	});

	test('returns false when tag does not exist', () => {
		const set = OrderedSet.of(ACTION);
		expect(hasTag(set, COMEDY)).toBe(false);
	});

	test('returns false for empty set', () => {
		expect(hasTag(OrderedSet(), ACTION)).toBe(false);
	});

	test('matches by group and label, not reference', () => {
		const set = OrderedSet.of(ACTION);
		expect(hasTag(set, { group: 'genres', label: 'Action' })).toBe(true);
	});
});

describe('modifyTagInFolder', () => {
	test('adds tag to new folder', () => {
		const record = Map<number, OrderedSet<FilterOption>>();
		const result = modifyTagInFolder(record, 0, ACTION);
		expect(result.get(0)!.toArray()).toStrictEqual([ACTION]);
	});

	test('adds tag to existing folder', () => {
		const record = Map<number, OrderedSet<FilterOption>>().set(
			0,
			OrderedSet.of(ACTION)
		);
		const result = modifyTagInFolder(record, 0, COMEDY);
		expect(result.get(0)!.toArray()).toStrictEqual([ACTION, COMEDY]);
	});

	test('removes tag if already exists (toggle)', () => {
		const record = Map<number, OrderedSet<FilterOption>>().set(
			0,
			OrderedSet.of(ACTION, COMEDY)
		);
		const result = modifyTagInFolder(record, 0, ACTION);
		expect(result.get(0)!.toArray()).toStrictEqual([COMEDY]);
	});

	test('does not affect other folders', () => {
		const record = Map<number, OrderedSet<FilterOption>>().set(
			0,
			OrderedSet.of(ACTION)
		);
		const result = modifyTagInFolder(record, 1, PIXAR);
		expect(result.get(0)!.toArray()).toStrictEqual([ACTION]);
		expect(result.get(1)!.toArray()).toStrictEqual([PIXAR]);
	});
});

describe('removeLastTagInFolder', () => {
	test('removes last added tag', () => {
		const record = Map<number, OrderedSet<FilterOption>>().set(
			0,
			OrderedSet.of(ACTION, COMEDY)
		);
		const result = removeLastTagInFolder(record, 0);
		expect(result.get(0)!.toArray()).toStrictEqual([ACTION]);
	});

	test('returns unchanged record for missing folder', () => {
		const record = Map<number, OrderedSet<FilterOption>>();
		const result = removeLastTagInFolder(record, 0);
		expect(result.size).toBe(0);
	});
});

describe('removeFolderFromStore', () => {
	test('removes folder entry', () => {
		const record = Map<number, OrderedSet<FilterOption>>().set(
			0,
			OrderedSet.of(ACTION)
		);
		const result = removeFolderFromStore(record, 0);
		expect(result.has(0)).toBe(false);
	});

	test('no-op for missing folder', () => {
		const record = Map<number, OrderedSet<FilterOption>>();
		const result = removeFolderFromStore(record, 99);
		expect(result.size).toBe(0);
	});
});
