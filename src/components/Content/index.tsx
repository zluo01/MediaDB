import Context from '@/components/Content/context';
import Media from '@/components/Content/media';
import { searchStore, updateFooter } from '@/lib/context';
import { useFilter } from '@/lib/context/filterContext';
import { filterMedia } from '@/lib/filter';
import { openFile } from '@/lib/os';
import { contentQueryOptions } from '@/lib/queries';
import { cn, isModalOpen, openModal } from '@/lib/utils';
import { FilterType, ITVShowData, MediaType } from '@/type';
import { useQuery } from '@tanstack/solid-query';
import { useStore } from '@tanstack/solid-store';
import join from 'lodash/join';
import {
  Accessor,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  ErrorBoundary,
  For,
  lazy,
  on,
  onCleanup,
  Show,
  Suspense,
} from 'solid-js';
import { LoadingContent } from 'src/components/Loading';

const Menu = lazy(() => import('./menu'));

function useWindowWidth(): Accessor<number> {
  const [width, setWidth] = createSignal(window.innerWidth);

  const controller = new AbortController();

  window.addEventListener(
    'resize',
    () => {
      setWidth(window.innerWidth);
    },
    {
      signal: controller.signal,
    },
  );

  onCleanup(() => controller.abort());

  return width;
}

interface IContentProps {
  appDir: Accessor<string>;
  folderId: Accessor<number>;
  folderName: Accessor<string>;
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

  const searchKey = useStore(searchStore);

  const folderContentQuery = useQuery(() =>
    contentQueryOptions(props.folderId()),
  );
  const media = () => folderContentQuery.data || [];

  const [mediaList] = createResource(
    () => ({
      folderId: props.folderId(),
      mediaList: media(),
      filterType: props.filterType(),
      searchKey: searchKey(),
      tags: getTags(props.folderId()).toArray(),
    }),
    filterMedia,
  );

  createEffect(on(mediaList, m => updateFooter(`Total ${m?.length}`)));

  const controller = new AbortController();

  function focus() {
    const anchor = document.getElementById(`c${selected()}`);
    if (anchor) {
      anchor.focus({ preventScroll: false });
    }
  }

  function moveVertical(newRow: number, newColumn: number) {
    const index = newRow * column() + newColumn;
    if (index >= 0 && index <= mediaList()!.length - 1) {
      setSelected(index);
    }
  }

  async function handleKeyPress(ev: KeyboardEvent) {
    // when menu is opened, do not listen to key change
    if (isModalOpen() || !mediaList() || !mediaList()) {
      return;
    }

    const c = selected() % column();
    const r = Math.floor(selected() / column());

    const keyActions: Record<string, () => void> = {
      ArrowLeft: () => {
        setSelected(prev =>
          prev - 1 < 0 ? mediaList()!.length - 1 : prev - 1,
        );
      },
      ArrowRight: () => {
        setSelected(prev => (prev + 1) % mediaList()!.length);
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
        const m = mediaList()![selected()];
        switch (m.type) {
          case MediaType.COMIC:
            openFile(join([props.folderPath(), m.file], '/'));
            break;
          case MediaType.MOVIE:
            openFile(join([props.folderPath(), m.path, m.file], '/'));
            break;
          case MediaType.TV_SERIES:
            openModal(`menu-${m.title}`);
            break;
        }
      },
    };

    const action = keyActions[ev.key];
    if (action) {
      action();
      if (ev.key !== 'ENTER') {
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
            'sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12',
          )}
        >
          <For each={mediaList()}>
            {(media, index) => (
              <>
                <Context
                  index={index}
                  media={media}
                  folderPath={props.folderPath()}
                  select={() => setSelected(index())}
                >
                  <Media
                    media={media}
                    folderDir={props.appDir}
                    folderName={props.folderName()}
                  />
                </Context>
                <Show when={media.type === MediaType.TV_SERIES}>
                  <Menu
                    appDir={props.appDir}
                    media={media as ITVShowData}
                    folderName={props.folderName()}
                    folderPath={props.folderPath()}
                  />
                </Show>
              </>
            )}
          </For>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default Content;
