import Media from '@/components/Content/media';
import { openFile } from '@/lib/os';
import {
  COMIC,
  DEFAULT,
  FILTER,
  IFolderData,
  IMediaData,
  IMovieData,
  ITags,
  ITVShowData,
  MOVIE,
  TITLE_ASC,
  TITLE_DSC,
  TV_SERIES,
  YEAR_ASC,
  YEAR_DSC,
} from '@/type';
import { computed, Signal } from '@preact/signals-react';
import forEach from 'lodash/forEach';
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
  filters: Signal<ITags>;
}

function Content({ folderData, filters }: IContentProps): ReactElement {
  const column = useGetColumnSize();

  const [menuStatus, setMenuStatus] = useState(false);

  const selected = useRef<number>(-1);

  const data = computed(() => {
    let media = [...folderData.data];

    forEach(filters.value, (value, tag) => {
      value.forEach(
        v => (media = media.filter(o => o[tag as FILTER].includes(v))),
      );
    });

    switch (folderData.sort) {
      case DEFAULT:
        break;
      case TITLE_ASC:
        media.sort((a: IMediaData, b: IMediaData) =>
          a.title > b.title ? 1 : -1,
        );
        break;
      case TITLE_DSC:
        media.sort((a: IMediaData, b: IMediaData) =>
          a.title < b.title ? 1 : -1,
        );
        break;
      case YEAR_DSC:
        if (media[0].type === MOVIE) {
          media.sort((a: IMediaData, b: IMediaData) =>
            (a as IMovieData).year < (b as IMovieData).year ? 1 : -1,
          );
        }
        break;
      case YEAR_ASC:
        if (media[0].type === MOVIE) {
          media.sort((a: IMediaData, b: IMediaData) =>
            (a as IMovieData).year > (b as IMovieData).year ? 1 : -1,
          );
        }
        break;
    }
    return media;
  });

  useEffect(() => {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.innerText = `Total ${data.value.length}`;
    }
  }, [data]);

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
      if (index >= 0 && index <= data.value.length - 1) {
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
            current - 1 < 0 ? data.value.length - 1 : current - 1;
        },
        ArrowRight: () => {
          selected.current = (current + 1) % data.value.length;
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
          const media = data.value[selected.current] as IMediaData;
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
  }, [data, folderData, column, open]);

  const menu = computed(() => {
    if (selected.current < 0) {
      return <div />;
    }
    const type = data.value[selected.current]?.type;
    if (type === TV_SERIES) {
      return (
        <Suspense>
          <Menu
            folder={folderData}
            data={data.value[selected.current] as ITVShowData}
            status={menuStatus}
            closeMenu={() => setMenuStatus(false)}
          />
        </Suspense>
      );
    }
    return <div />;
  });

  return (
    <Fragment>
      <div className="grid auto-rows-fr pb-6 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
        {data.value.map((media, index) => (
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
      {menu}
    </Fragment>
  );
}

export default Content;
