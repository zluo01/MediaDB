import Context from '@/components/Content/content/context';
import Media from '@/components/Content/content/media';
import { useFilterStore, useMenuStore, useSearchStore } from '@/lib/context';
import { errorLog } from '@/lib/log';
import { openFile } from '@/lib/os';
import { getFolderMedia } from '@/lib/storage';
import { FolderStatus, IFolderData, IMediaData, MediaType, SORT } from '@/type';
import clsx from 'clsx';
import join from 'lodash/join';
import {
  Fragment,
  lazy,
  ReactElement,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';

const Menu = lazy(() => import('./menu'));

function useGetFolderMediaData(
  folderIndex: number,
  status: FolderStatus,
  sortType: SORT,
) {
  const { tags } = useFilterStore();
  const { searchKey } = useSearchStore();
  const [media, setMedia] = useState<IMediaData[]>([]);

  useEffect(() => {
    getFolderMedia(folderIndex, searchKey, tags)
      .then(o => {
        setMedia(o);
        const footer = document.getElementById('footer');
        if (footer) {
          footer.innerText = `Total ${o.length}`;
        }
        return null;
      })
      .catch(e => errorLog(e));
  }, [folderIndex, searchKey, tags, sortType, status]);

  return media;
}

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
  folderInfo: IFolderData;
}

function Content({ folderInfo }: IContentProps): ReactElement {
  const mediaData = useGetFolderMediaData(
    folderInfo.position,
    folderInfo.status,
    folderInfo.sort,
  );

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
              openFile(join([folderInfo.path, media.file], '/'));
              break;
            case MediaType.MOVIE:
              openFile(join([folderInfo.path, media.path, media.file], '/'));
              break;
            case MediaType.TV_SERIES:
              openMenu({
                folder: folderInfo,
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
  }, [folderInfo, column, open, mediaData]);

  return (
    <Fragment>
      <div
        className={clsx(
          'm-0 border-0 pb-6',
          'grid grid-flow-dense auto-rows-fr',
          'sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12',
        )}
      >
        {mediaData.map((media, index) => (
          <Context
            key={index}
            index={index}
            media={media}
            folder={folderInfo}
            select={() => (selected.current = index)}
          >
            <Media media={media} folder={folderInfo} />
          </Context>
        ))}
      </div>
      <Suspense>
        <Menu />
      </Suspense>
    </Fragment>
  );
}

export default Content;
