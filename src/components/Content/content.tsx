import Media from '@/components/Content/media';
import { useAppDispatch, useAppSelector } from '@/lib/context';
import { openMenu } from '@/lib/context/slice/menuSlice';
import { RootState } from '@/lib/context/store';
import { openFile } from '@/lib/os';
import { COMIC, IFolderData, IMediaData, MOVIE, TV_SERIES } from '@/type';
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
  folderData: IFolderData;
}

function Content({ folderData }: IContentProps): ReactElement {
  const dispatch = useAppDispatch();
  const menuStatus = useAppSelector((state: RootState) => state.menu.open);

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
      if (index >= 0 && index <= folderData.data.length - 1) {
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
            current - 1 < 0 ? folderData.data.length - 1 : current - 1;
        },
        ArrowRight: () => {
          selected.current = (current + 1) % folderData.data.length;
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
          const media = folderData.data[selected.current] as IMediaData;
          switch (media.type) {
            case COMIC:
            case MOVIE:
              openFile(
                join([folderData.path, media.relativePath, media.file], '/'),
              );
              break;
            case TV_SERIES:
              dispatch(
                openMenu({
                  folder: folderData,
                  data: media,
                }),
              );
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
  }, [folderData, column, open]);

  return (
    <Fragment>
      <div className="grid auto-rows-fr pb-6 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
        {folderData.data.map((media, index) => (
          <Media
            key={index}
            index={index}
            media={media}
            select={() => (selected.current = index)}
            folder={folderData}
          />
        ))}
      </div>
      <Suspense>
        <Menu />
      </Suspense>
    </Fragment>
  );
}

export default Content;
