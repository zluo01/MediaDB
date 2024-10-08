import Media from '@/components/Content/media';
import { useMenuStore } from '@/lib/context';
import { errorLog } from '@/lib/log';
import { openFile } from '@/lib/os';
import { IFolderData, IMediaData, MediaType } from '@/type';
import clsx from 'clsx';
import join from 'lodash/join';
import {
  Fragment,
  lazy,
  ReactElement,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const Menu = lazy(() => import('./menu'));

function useGetColumnSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth);
    });
    return () => {
      window.removeEventListener('resize', () => {
        setWidth(window.innerWidth);
      });
    };
  }, []);

  if (width < 2560) {
    return 6;
  } else if (width < 3840) {
    return 8;
  }
  return 12;
}

interface IContentProps {
  folderIndo: IFolderData;
  mediaData: IMediaData[];
}

const PAGE_SIZE = 24;

function Content({ folderIndo, mediaData }: IContentProps): ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [index, setIndex] = useState(1);
  const [items, setItems] = useState(mediaData.slice(0, PAGE_SIZE));
  const loaderRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setItems(prevItems => [
      ...prevItems,
      ...mediaData.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE),
    ]);
    setIndex(prevIndex => prevIndex + 1);

    setIsLoading(false);
  }, [index, isLoading, mediaData]);

  const { menuStatus, openMenu } = useMenuStore();

  const column = useGetColumnSize();

  const selected = useRef<number>(-1);

  useEffect(() => {
    function focus() {
      const anchor = document.getElementById(`c${selected.current}`);
      if (anchor) {
        anchor.focus({ preventScroll: false });
        anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function moveVertical(newRow: number, newColumn: number) {
      const index = newRow * column + newColumn;
      if (index >= 0 && index <= mediaData.length - 1) {
        selected.current = index;
      }
    }

    async function handleKeyPress(ev: KeyboardEvent) {
      // when menu is opened, do not listen to key change
      if (menuStatus) {
        return;
      }

      const { current } = selected;
      const c = current % column;
      const r = Math.floor(current / column);

      const keyActions: Record<string, () => void> = {
        ArrowLeft: () => {
          selected.current =
            current - 1 < 0 ? mediaData.length - 1 : current - 1;
        },
        ArrowRight: () => {
          selected.current = (current + 1) % mediaData.length;
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
          const media = mediaData[selected.current];
          switch (media.type) {
            case MediaType.COMIC:
              openFile(join([folderIndo.path, media.file], '/'));
              break;
            case MediaType.MOVIE:
              openFile(join([folderIndo.path, media.path, media.file], '/'));
              break;
            case MediaType.TV_SERIES:
              openMenu({
                folder: folderIndo,
                data: media,
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

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [folderIndo, column, open]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const target = entries[0];
      if (target.isIntersecting) {
        fetchData().catch(errorLog);
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [fetchData]);

  return (
    <Fragment>
      <div
        className={clsx(
          'm-0 border-0 pb-6',
          'grid grid-flow-dense auto-rows-fr',
          'sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12',
        )}
      >
        {items.map((media, index) => (
          <Media
            key={index}
            index={index}
            media={media}
            select={() => (selected.current = index)}
            folder={folderIndo}
          />
        ))}
      </div>
      <div ref={loaderRef} className="-z-10 mt-[-35vh] w-full pb-6 opacity-0" />
      <Suspense>
        <Menu />
      </Suspense>
    </Fragment>
  );
}

export default Content;
