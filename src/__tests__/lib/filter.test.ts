import { describe, expect, jest, test } from '@jest/globals';
import { filterMedia } from '@/lib/filter';
import * as stores from '@/lib/storage';
import { FilterType, type IMediaData } from '@/type';

const MEDIA_DATA: IMediaData[] = [
	{
		type: 0,
		path: 'Batman Begins',
		title: 'Batman Begins',
		posters: { main: 'Batman Begins-poster.jpg' },
		year: '2005',
		file: 'Batman Begins.mkv',
	},
	{
		type: 0,
		path: 'Blade Runner',
		title: 'Blade Runner',
		posters: { main: 'Blade Runner-poster.jpg' },
		year: '1982',
		file: 'Blade Runner.mkv',
	},
	{
		type: 0,
		path: 'Blade Runner 2049',
		title: 'Blade Runner 2049',
		posters: { main: 'Blade Runner 2049-poster.jpg' },
		year: '2017',
		file: 'Blade Runner 2049.mkv',
	},
	{
		type: 0,
		path: 'Dune',
		title: 'Dune',
		posters: { main: 'Dune-poster.jpg' },
		year: '2021',
		file: 'Dune.mkv',
	},
	{
		type: 0,
		path: 'John Wick',
		title: 'John Wick',
		posters: { main: 'John Wick-poster.jpg' },
		year: '2014',
		file: 'John Wick.mkv',
	},
	{
		type: 0,
		path: 'John Wick - Chapter 2',
		title: 'John Wick: Chapter 2',
		posters: { main: 'John Wick - Chapter 2-poster.jpg' },
		year: '2017',
		file: 'John Wick - Chapter 2.mkv',
	},
	{
		type: 0,
		path: 'John Wick - Chapter 3 - Parabellum',
		title: 'John Wick: Chapter 3 - Parabellum',
		posters: { main: 'John Wick - Chapter 3 - Parabellum-poster.jpg' },
		year: '2019',
		file: 'John Wick - Chapter 3 - Parabellum.mkv',
	},
	{
		type: 0,
		path: 'John Wick - Chapter 4',
		title: 'John Wick: Chapter 4',
		posters: { main: 'John Wick - Chapter 4-poster.jpg' },
		year: '2023',
		file: 'John Wick - Chapter 4.mkv',
	},
	{
		type: 0,
		path: 'Love Letter',
		title: 'Love Letter',
		posters: { main: 'Love Letter-poster.jpg' },
		year: '1995',
		file: 'Love Letter.mp4',
	},
	{
		type: 0,
		path: 'Metropolis',
		title: 'Metropolis',
		posters: { main: 'Metropolis-poster.jpg' },
		year: '1927',
		file: 'Metropolis.mkv',
	},
	{
		type: 0,
		path: 'Mission - Impossible',
		title: 'Mission: Impossible',
		posters: { main: 'Mission - Impossible-poster.jpg' },
		year: '1996',
		file: 'Mission - Impossible.mkv',
	},
	{
		type: 0,
		path: 'New York, I Love You',
		title: 'New York, I Love You',
		posters: { main: 'New York, I Love You-poster.jpg' },
		year: '2008',
		file: 'New York, I Love You.mkv',
	},
	{
		type: 0,
		path: 'Oppenheimer',
		title: 'Oppenheimer',
		posters: { main: 'Oppenheimer-poster.jpg' },
		year: '2023',
		file: 'Oppenheimer.mkv',
	},
	{
		type: 0,
		path: "Paris Je T'aime",
		title: "Paris Je T'aime",
		posters: { main: "Paris Je T'aime-poster.jpg" },
		year: '2006',
		file: "Paris Je T'aime.mkv",
	},
	{
		type: 0,
		path: 'The Dark Knight',
		title: 'The Dark Knight',
		posters: { main: 'The Dark Knight-poster.jpg' },
		year: '2008',
		file: 'The Dark Knight.mkv',
	},
	{
		type: 0,
		path: 'The Dark Knight Rises',
		title: 'The Dark Knight Rises',
		posters: { main: 'The Dark Knight Rises-poster.jpg' },
		year: '2012',
		file: 'The Dark Knight Rises.mkv',
	},
	{
		type: 0,
		path: 'The Godfather',
		title: 'The Godfather',
		posters: { main: 'The Godfather-poster.jpg' },
		year: '1972',
		file: 'The Godfather.mkv',
	},
	{
		type: 0,
		path: 'The Last Emperor',
		title: 'The Last Emperor',
		posters: { main: 'The Last Emperor-poster.jpg' },
		year: '1987',
		file: 'The Last Emperor.mkv',
	},
	{
		type: 0,
		path: 'The Lord of the Rings - The Fellowship of the Ring',
		title: 'The Lord of the Rings: The Fellowship of the Ring',
		posters: {
			main: 'The Lord of the Rings - The Fellowship of the Ring-poster.jpg',
		},
		year: '2001',
		file: 'The Lord of the Rings - The Fellowship of the Ring.mkv',
	},
	{
		type: 0,
		path: 'The Lord of the Rings - The Return of the King',
		title: 'The Lord of the Rings: The Return of the King',
		posters: {
			main: 'The Lord of the Rings - The Return of the King-poster.jpg',
		},
		year: '2003',
		file: 'The Lord of the Rings - The Return of the King.mkv',
	},
	{
		type: 0,
		path: 'The Lord of the Rings - The Two Towers',
		title: 'The Lord of the Rings: The Two Towers',
		posters: { main: 'The Lord of the Rings - The Two Towers-poster.jpg' },
		year: '2002',
		file: 'The Lord of the Rings - The Two Towers.mkv',
	},
	{
		type: 0,
		path: 'The Pianist',
		title: 'The Pianist',
		posters: { main: 'The Pianist-poster.jpg' },
		year: '2002',
		file: 'The Pianist.mkv',
	},
	{
		type: 0,
		path: 'Tinker Tailor Soldier Spy',
		title: 'Tinker Tailor Soldier Spy',
		posters: { main: 'Tinker Tailor Soldier Spy-poster.jpg' },
		year: '2011',
		file: 'Tinker Tailor Soldier Spy.mkv',
	},
	{
		type: 0,
		path: 'Watchmen',
		title: 'Watchmen',
		posters: { main: 'Watchmen-poster.jpg' },
		year: '2009',
		file: 'Watchmen.mkv',
	},
	{
		type: 0,
		path: 'もののけ姫',
		title: 'もののけ姫',
		posters: { main: 'もののけ姫-poster.jpg' },
		year: '1997',
		file: 'もののけ姫.mkv',
	},
	{
		type: 0,
		path: 'メトロポリス',
		title: 'メトロポリス',
		posters: { main: 'メトロポリス-poster.jpg' },
		year: '2001',
		file: 'メトロポリス.mkv',
	},
	{
		type: 0,
		path: '寒战2',
		title: '寒战2',
		posters: { main: '寒战2-poster.jpg' },
		year: '2016',
		file: '寒战2.mkv',
	},
	{
		type: 0,
		path: '白夜行',
		title: '白夜行',
		posters: { main: '白夜行-poster.jpg' },
		year: '2011',
		file: '白夜行.mkv',
	},
	{
		type: 0,
		path: '让子弹飞',
		title: '让子弹飞',
		posters: { main: '让子弹飞-poster.jpg' },
		year: '2010',
		file: '让子弹飞.mkv',
	},
];

describe('Test Filter Media', () => {
	test('When search with empty string, should not trigger filtering', async () => {
		expect(
			await filterMedia({
				folderId: 0,
				mediaList: MEDIA_DATA,
				filterType: FilterType.OR,
				searchKey: '',
				tags: [],
			})
		).toStrictEqual(MEDIA_DATA);
	});

	test('When search with key, should trigger filtering', async () => {
		const expected = [
			{
				type: 0,
				path: 'John Wick',
				title: 'John Wick',
				posters: { main: 'John Wick-poster.jpg' },
				year: '2014',
				file: 'John Wick.mkv',
			},
			{
				type: 0,
				path: 'John Wick - Chapter 2',
				title: 'John Wick: Chapter 2',
				posters: { main: 'John Wick - Chapter 2-poster.jpg' },
				year: '2017',
				file: 'John Wick - Chapter 2.mkv',
			},
			{
				type: 0,
				path: 'John Wick - Chapter 3 - Parabellum',
				title: 'John Wick: Chapter 3 - Parabellum',
				posters: { main: 'John Wick - Chapter 3 - Parabellum-poster.jpg' },
				year: '2019',
				file: 'John Wick - Chapter 3 - Parabellum.mkv',
			},
			{
				type: 0,
				path: 'John Wick - Chapter 4',
				title: 'John Wick: Chapter 4',
				posters: { main: 'John Wick - Chapter 4-poster.jpg' },
				year: '2023',
				file: 'John Wick - Chapter 4.mkv',
			},
		];

		expect(
			await filterMedia({
				folderId: 0,
				mediaList: MEDIA_DATA,
				filterType: FilterType.OR,
				searchKey: 'jo',
				tags: [],
			})
		).toStrictEqual(expected);

		expect(
			await filterMedia({
				folderId: 0,
				mediaList: MEDIA_DATA,
				filterType: FilterType.OR,
				searchKey: 'Jo',
				tags: [],
			})
		).toStrictEqual(expected);

		expect(
			await filterMedia({
				folderId: 0,
				mediaList: MEDIA_DATA,
				filterType: FilterType.OR,
				searchKey: 'JO',
				tags: [],
			})
		).toStrictEqual(expected);

		expect(
			await filterMedia({
				folderId: 0,
				mediaList: MEDIA_DATA,
				filterType: FilterType.OR,
				searchKey: ' Jo',
				tags: [],
			})
		).toStrictEqual(expected);

		expect(
			await filterMedia({
				folderId: 0,
				mediaList: MEDIA_DATA,
				filterType: FilterType.OR,
				searchKey: 'jO ',
				tags: [],
			})
		).toStrictEqual(expected);
	});

	test('Should return empty when no match media', async () => {
		const tags = [
			{ label: 'a', group: 'genres' },
			{ label: 'b', group: 'studios' },
		];
		jest.spyOn(stores, 'filterMediaWithTag').mockResolvedValue([]);
		expect(
			await filterMedia({
				folderId: 0,
				mediaList: MEDIA_DATA,
				filterType: FilterType.OR,
				searchKey: '',
				tags,
			})
		).toStrictEqual([]);
	});

	test('Should return media contains by filter list', async () => {
		const tags = [
			{ label: 'a', group: 'genres' },
			{ label: 'b', group: 'studios' },
		];

		const expected = [
			{
				type: 0,
				path: 'Oppenheimer',
				title: 'Oppenheimer',
				posters: { main: 'Oppenheimer-poster.jpg' },
				year: '2023',
				file: 'Oppenheimer.mkv',
			},
			{
				type: 0,
				path: "Paris Je T'aime",
				title: "Paris Je T'aime",
				posters: { main: "Paris Je T'aime-poster.jpg" },
				year: '2006',
				file: "Paris Je T'aime.mkv",
			},
			{
				type: 0,
				path: 'The Godfather',
				title: 'The Godfather',
				posters: { main: 'The Godfather-poster.jpg' },
				year: '1972',
				file: 'The Godfather.mkv',
			},
			{
				type: 0,
				path: 'The Last Emperor',
				title: 'The Last Emperor',
				posters: { main: 'The Last Emperor-poster.jpg' },
				year: '1987',
				file: 'The Last Emperor.mkv',
			},
		];

		jest
			.spyOn(stores, 'filterMediaWithTag')
			.mockResolvedValue([
				'Oppenheimer',
				"Paris Je T'aime",
				'The Godfather',
				'The Last Emperor',
			]);
		expect(
			await filterMedia({
				folderId: 0,
				mediaList: MEDIA_DATA,
				filterType: FilterType.OR,
				searchKey: '',
				tags,
			})
		).toStrictEqual(expected);
	});

	test('Should return empty when no match media and with search key', async () => {
		const tags = [
			{ label: 'a', group: 'genres' },
			{ label: 'b', group: 'studios' },
		];
		jest.spyOn(stores, 'filterMediaWithTag').mockResolvedValue([]);
		expect(
			await filterMedia({
				folderId: 0,
				mediaList: MEDIA_DATA,
				filterType: FilterType.OR,
				searchKey: 'jo',
				tags,
			})
		).toStrictEqual([]);
	});

	test('Should return media contains by filter list and match search key', async () => {
		const tags = [
			{ label: 'a', group: 'genres' },
			{ label: 'b', group: 'studios' },
		];

		const expected = [
			{
				type: 0,
				path: 'The Godfather',
				title: 'The Godfather',
				posters: { main: 'The Godfather-poster.jpg' },
				year: '1972',
				file: 'The Godfather.mkv',
			},
			{
				type: 0,
				path: 'The Last Emperor',
				title: 'The Last Emperor',
				posters: { main: 'The Last Emperor-poster.jpg' },
				year: '1987',
				file: 'The Last Emperor.mkv',
			},
		];

		jest
			.spyOn(stores, 'filterMediaWithTag')
			.mockResolvedValue([
				'Oppenheimer',
				"Paris Je T'aime",
				'The Godfather',
				'The Last Emperor',
			]);
		expect(
			await filterMedia({
				folderId: 0,
				mediaList: MEDIA_DATA,
				filterType: FilterType.OR,
				searchKey: 'th',
				tags,
			})
		).toStrictEqual(expected);
	});
});
