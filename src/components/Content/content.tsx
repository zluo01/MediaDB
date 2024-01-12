import Media from '@/components/Content/media';
import { openFile } from '@/lib/os';
import {
  COMIC,
  IFolderData,
  IMediaData,
  ITVShowData,
  MOVIE,
  TV_SERIES,
} from '@/type';
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
  const column = useGetColumnSize();

  const [menuStatus, setMenuStatus] = useState(false);

  const selected = useRef<number>(-1);

  useEffect(() => {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.innerText = `Total ${folderData.data.length}`;
    }
  }, [folderData]);

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
              setMenuStatus(true);
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

  function TVMenu() {
    if (selected.current < 0) {
      return <div />;
    }
    const type = folderData.data[selected.current]?.type;
    if (type === TV_SERIES) {
      return (
        <Suspense>
          <Menu
            folder={folderData}
            data={folderData.data[selected.current] as ITVShowData}
            status={menuStatus}
            closeMenu={() => setMenuStatus(false)}
          />
        </Suspense>
      );
    }
    return <div />;
  }

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
            openMenu={() => setMenuStatus(true)}
          />
        ))}
      </div>
      <TVMenu />
    </Fragment>
  );
}

export default Content;
