import { debounce } from '@solid-primitives/scheduled';
import { useQuery } from '@tanstack/solid-query';
import { useStore } from '@tanstack/solid-store';
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	ErrorBoundary,
	For,
	lazy,
	on,
	onCleanup,
	Show,
	Suspense,
} from 'solid-js';
import Context from '@/components/Content/context';
import Media from '@/components/Content/media';
import { LoadingContent } from '@/components/Loading';
import { searchStore, updateFooter } from '@/lib/context';
import { useFilter } from '@/lib/context/filterContext';
import { filterOnSearchKey } from '@/lib/filter';
import { openMedia } from '@/lib/os';
import { contentQueryOptions } from '@/lib/queries';
import { cn, isModalOpen } from '@/lib/utils';
import {
	type FilterType,
	type IMediaData,
	type ITVShowData,
	MediaType,
} from '@/type';

const Menu = lazy(() => import('./menu'));

function useWindowWidth(): Accessor<number> {
	const [width, setWidth] = createSignal(window.innerWidth);

	const controller = new AbortController();

	const updateWidth = debounce(() => setWidth(window.innerWidth), 150);

	window.addEventListener('resize', updateWidth, {
		signal: controller.signal,
	});

	onCleanup(() => controller.abort());

	return width;
}

interface IContentProps {
	folderId: Accessor<number>;
	folderPath: Accessor<string>;
	filterType: Accessor<FilterType>;
}

function Content(props: IContentProps) {
	const { getTags } = useFilter();

	const width = useWindowWidth();
	const column = createMemo(() => {
		if (width() < 2560) return 6;
		if (width() < 3840) return 8;
		return 12;
	});

	const [selected, setSelected] = createSignal<number>(-1);
	const [selectedTVShow, setSelectedTVShow] = createSignal<ITVShowData | null>(
		null
	);

	async function handleOpen(folderPath: string, media: IMediaData) {
		if (media.type === MediaType.TV_SERIES) {
			setSelectedTVShow(media as ITVShowData);
		}
		await openMedia(folderPath, media);
	}

	const searchKey = useStore(searchStore);

	const folderContentQuery = useQuery(() =>
		contentQueryOptions(
			props.folderId(),
			props.filterType(),
			getTags(props.folderId()).toArray()
		)
	);
	const media = () => folderContentQuery.data || [];

	const mediaList = createMemo(() => filterOnSearchKey(media(), searchKey()));

	createEffect(on(mediaList, m => updateFooter(`Total ${m.length}`)));

	const controller = new AbortController();

	function focus() {
		const anchor = document.getElementById(`c${selected()}`);
		if (anchor) {
			anchor.focus({ preventScroll: false });
		}
	}

	function moveVertical(newRow: number, newColumn: number) {
		const index = newRow * column() + newColumn;
		if (index >= 0 && index <= mediaList().length - 1) {
			setSelected(index);
		}
	}

	async function handleKeyPress(ev: KeyboardEvent) {
		// when menu is opened, do not listen to key change
		if (isModalOpen() || mediaList().length === 0) {
			return;
		}

		const c = selected() % column();
		const r = Math.floor(selected() / column());

		const keyActions: Record<string, () => void> = {
			ArrowLeft: () => {
				setSelected(prev => (prev - 1 < 0 ? mediaList().length - 1 : prev - 1));
			},
			ArrowRight: () => {
				setSelected(prev => (prev + 1) % mediaList().length);
			},
			ArrowUp: () => {
				ev.preventDefault();
				moveVertical(r - 1, c);
			},
			ArrowDown: () => {
				ev.preventDefault();
				moveVertical(r + 1, c);
			},
			Enter: () => {
				const m = mediaList()[selected()];
				handleOpen(props.folderPath(), m);
			},
		};

		const action = keyActions[ev.key];
		if (action) {
			action();
			if (ev.key !== 'Enter') {
				focus();
			}
		}
	}

	document.addEventListener('keydown', handleKeyPress, {
		signal: controller.signal,
	});

	onCleanup(() => controller.abort());

	return (
		<ErrorBoundary fallback={<p>Error: {folderContentQuery.error?.message}</p>}>
			<Suspense fallback={<LoadingContent />}>
				<div
					class={cn(
						'm-0 border-0 pb-6',
						'grid grid-flow-dense auto-rows-fr',
						'sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12'
					)}
				>
					<For each={mediaList()}>
						{(media, index) => (
							<Context
								index={index}
								media={media}
								folderPath={props.folderPath()}
								select={() => setSelected(index())}
								onOpen={handleOpen}
							>
								<Media media={media} />
							</Context>
						)}
					</For>
				</div>
				<Show when={selectedTVShow()}>
					{tvShow => <Menu media={tvShow()} folderPath={props.folderPath()} />}
				</Show>
			</Suspense>
		</ErrorBoundary>
	);
}

export default Content;
