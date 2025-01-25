import Context from '@/components/content/context';
import Media from '@/components/content/media';
import ErrorHandler from '@/components/error';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useFilterStore,
  useFooterStore,
  useMenuStore,
  useSearchStore,
} from '@/lib/context';
import { errorLog } from '@/lib/log';
import { openFile } from '@/lib/os';
import { useGetFolderContent, useGetFolderDataQuery } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { FolderStatus, MediaType } from '@/type';
import join from 'lodash/join';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Loading, LoadingContent } from 'src/components/loading';

const Menu = lazy(() => import('./menu'));

function useGetColumnSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
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
    return () => controller.abort();
  }, []);

  if (width < 2560) {
    return 6;
  } else if (width < 3840) {
    return 8;
  }
  return 12;
}

function Content() {
  const [searchParams] = useSearchParams();

  const folderId = parseInt(searchParams.get('id') || '0');

  const { update } = useFooterStore();
  const { tags } = useFilterStore();
  const { searchKey } = useSearchStore();
  const debounceSearch = useDebounce(searchKey);

  const { data: folderInfo, isLoading: folderLoadingState } =
    useGetFolderDataQuery(folderId);
  const {
    data: media,
    isLoading: contentLoadingState,
    mutate,
  } = useGetFolderContent(folderId, debounceSearch, tags);

  const { menuStatus, openMenu } = useMenuStore();

  const column = useGetColumnSize();

  const selected = useRef<number>(-1);

  useEffect(() => {
    if (media) {
      update(`Total ${media.length}`);
    }
  }, [update, media]);

  useEffect(() => {
    mutate().catch(e => errorLog(e));
  }, [debounceSearch, tags, mutate]);

  useEffect(() => {
    const controller = new AbortController();

    function focus() {
      const anchor = document.getElementById(`c${selected.current}`);
      if (anchor) {
        anchor.focus({ preventScroll: false });
        anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function moveVertical(newRow: number, newColumn: number) {
      const index = newRow * column + newColumn;
      if (index >= 0 && index <= media!.length - 1) {
        selected.current = index;
      }
    }

    async function handleKeyPress(ev: KeyboardEvent) {
      // when menu is opened, do not listen to key change
      if (menuStatus || !folderInfo || !media) {
        return;
      }

      const { current } = selected;
      const c = current % column;
      const r = Math.floor(current / column);

      const keyActions: Record<string, () => void> = {
        ArrowLeft: () => {
          selected.current = current - 1 < 0 ? media.length - 1 : current - 1;
        },
        ArrowRight: () => {
          selected.current = (current + 1) % media.length;
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
          const m = media[selected.current];
          switch (m.type) {
            case MediaType.COMIC:
              openFile(join([folderInfo.path, m.file], '/'));
              break;
            case MediaType.MOVIE:
              openFile(join([folderInfo.path, m.path, m.file], '/'));
              break;
            case MediaType.TV_SERIES:
              openMenu({
                folder: folderInfo,
                data: m,
              });
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

    return () => controller.abort();
  }, [folderInfo, column, media, menuStatus, openMenu]);

  if (folderLoadingState) {
    return <Loading />;
  }
  if (!folderInfo) {
    return <div />;
  }
  if (folderInfo.status === FolderStatus.ERROR) {
    return <ErrorHandler folderInfo={folderInfo} />;
  }
  return (
    <>
      <div
        className={cn(
          'm-0 border-0 pb-6',
          'grid grid-flow-dense auto-rows-fr',
          'sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12',
        )}
      >
        {contentLoadingState ? (
          <LoadingContent />
        ) : (
          media?.map((media, index) => (
            <Context
              key={index}
              index={index}
              media={media}
              folder={folderInfo}
              select={() => (selected.current = index)}
            >
              <Media
                media={media}
                folderDir={folderInfo.appDir!}
                folderName={folderInfo.name}
              />
            </Context>
          ))
        )}
      </div>
      <Suspense>
        <Menu />
      </Suspense>
    </>
  );
}

export default Content;
