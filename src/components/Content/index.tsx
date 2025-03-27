import Context from '@/components/Content/context';
import Media from '@/components/Content/media';
import ErrorHandler from '@/components/Error';
import { filterStore, footerStore, searchStore } from '@/lib/context';
import { openFile } from '@/lib/os';
import { contentQueryOptions } from '@/lib/queries';
import { cn, openModal } from '@/lib/utils';
import { FolderStatus, ITVShowData, MediaType } from '@/type';
import { createQuery } from '@tanstack/solid-query';
import { useLocation } from '@tanstack/solid-router';
import { useStore } from '@tanstack/solid-store';
import join from 'lodash/join';
import {
  Accessor,
  createEffect,
  createSignal,
  For,
  lazy,
  Match,
  on,
  onCleanup,
  Show,
  Switch,
} from 'solid-js';
import { Loading, LoadingContent } from 'src/components/Loading';

const Menu = lazy(() => import('./menu'));

function useGetColumnSize(): Accessor<number> {
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

  return () => {
    if (width() < 2560) {
      return 6;
    } else if (width() < 3840) {
      return 8;
    }
    return 12;
  };
}

interface IContentProps {
  appDir: Accessor<string>;
}

function Content({ appDir }: IContentProps) {
  const column = useGetColumnSize();
  const [selected, setSelected] = createSignal<number>(-1);

  const location = useLocation();
  const folderId = () => (location().search.id as number) || 0;

  // const { update } = useFooterStore();
  const searchKey = useStore(searchStore);
  const tags = useStore(filterStore);

  const folderContentQuery = createQuery(() =>
    contentQueryOptions(folderId(), searchKey(), tags()),
  );

  const folderName = () => folderContentQuery.data?.name || '';
  const folderPath = () => folderContentQuery.data?.path || '';
  const media = () => folderContentQuery.data?.media || [];

  createEffect(on(media, m => footerStore.setState(() => `Total ${m.length}`)));

  const controller = new AbortController();

  function focus() {
    const anchor = document.getElementById(`c${selected()}`);
    if (anchor) {
      anchor.focus({ preventScroll: false });
    }
  }

  function moveVertical(newRow: number, newColumn: number) {
    const index = newRow * column() + newColumn;
    if (index >= 0 && index <= media().length - 1) {
      setSelected(index);
    }
  }

  async function handleKeyPress(ev: KeyboardEvent) {
    // when menu is opened, do not listen to key change
    if (!folderPath() || !media()) {
      return;
    }

    const c = selected() % column();
    const r = Math.floor(selected() / column());

    const keyActions: Record<string, () => void> = {
      ArrowLeft: () => {
        setSelected(prev => (prev - 1 < 0 ? media().length - 1 : prev - 1));
      },
      ArrowRight: () => {
        setSelected(prev => (prev + 1) % media().length);
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
        const m = media()[selected()];
        switch (m.type) {
          case MediaType.COMIC:
            openFile(join([folderPath(), m.file], '/'));
            break;
          case MediaType.MOVIE:
            openFile(join([folderPath(), m.path, m.file], '/'));
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
    <Switch fallback={<p>What the hell</p>}>
      <Match when={folderContentQuery.isPending}>
        <LoadingContent />
      </Match>
      <Match when={folderContentQuery.isError}>
        <p>Error: {folderContentQuery.error?.message}</p>
      </Match>
      <Match when={folderContentQuery.isSuccess}>
        <Switch>
          <Match when={folderContentQuery.data?.status === FolderStatus.ERROR}>
            <ErrorHandler
              folderName={folderName()}
              folderPath={folderPath()}
              folderPosition={folderId()}
            />
          </Match>
          <Match
            when={folderContentQuery.data?.status === FolderStatus.LOADING}
          >
            <Loading />
          </Match>
          <Match when={folderContentQuery.data?.status === FolderStatus.NONE}>
            <>
              <div
                class={cn(
                  'm-0 border-0 pb-6',
                  'grid grid-flow-dense auto-rows-fr',
                  'sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12',
                )}
              >
                <For each={folderContentQuery.data?.media || []}>
                  {(media, index) => (
                    <>
                      <Context
                        index={index}
                        media={media}
                        folderPath={folderPath()}
                        select={() => setSelected(index())}
                      >
                        <Media
                          media={media}
                          folderDir={appDir}
                          folderName={folderContentQuery.data!.name}
                        />
                      </Context>
                      <Show when={media.type === MediaType.TV_SERIES}>
                        <Menu
                          appDir={appDir}
                          media={media as ITVShowData}
                          folderName={folderName()}
                          folderPath={folderPath()}
                        />
                      </Show>
                    </>
                  )}
                </For>
              </div>
            </>
          </Match>
        </Switch>
      </Match>
    </Switch>
  );
}

export default Content;
