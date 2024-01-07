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
import { computed, effect, Signal } from '@preact/signals-react';
import forEach from 'lodash/forEach';
import join from 'lodash/join';
import {
  Fragment,
  lazy,
  ReactElement,
  Suspense,
  useEffect,
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
  footer: Signal<string>;
}

function Content({ folderData, filters, footer }: IContentProps): ReactElement {
  const column = useGetColumnSize();

  const [menuStatus, setMenuStatus] = useState(false);
  const [current, setCurrent] = useState(-1);

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

  effect(() => {
    footer.value = `Total ${data.value.length}`;
  });

  useEffect(() => {
    if (current < 0) {
      return;
    }
    const anchor = document.getElementById(`c${current}`);
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [current]);

  useEffect(() => {
    async function handleKeyPress(ev: KeyboardEvent) {
      // when menu is opened, do not listen to key change
      if (menuStatus) {
        return;
      }
      const c = current % column;
      const r = Math.floor(current / column);
      let index: number;
      switch (ev.key) {
        case 'ArrowLeft':
          setCurrent(prev => (prev - 1 < 0 ? data.value.length - 1 : prev - 1));
          break;
        case 'ArrowRight':
          setCurrent(prev => (prev + 1) % data.value.length);
          break;
        case 'ArrowUp':
          ev.preventDefault();
          index = (r - 1) * column + c;
          if (index < 0) {
            return;
          }
          setCurrent(index);
          break;
        case 'ArrowDown':
          ev.preventDefault();
          index = (r + 1) * column + c;
          if (index > data.value.length - 1) {
            return;
          }
          setCurrent(index);
          break;
        case 'Enter':
          switch (data.value[current].type) {
            case COMIC:
            case MOVIE:
              // eslint-disable-next-line no-case-declarations
              const media = data.value[current] as IMovieData;
              // eslint-disable-next-line no-case-declarations
              const filePath = join(
                [folderData.path, media.relativePath, media.file],
                '/',
              );
              await openFile(filePath);
              break;
            case TV_SERIES:
              setMenuStatus(true);
              break;
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [current, data, folderData, column, open]);

  const menu = computed(() => {
    if (current < 0) {
      return <div />;
    }
    const type = data.value[current]?.type;
    if (type === TV_SERIES) {
      return (
        <Suspense>
          <Menu
            folder={folderData}
            data={data.value[current] as ITVShowData}
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
      <div className="grid auto-rows-fr sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
        {data.value.map((media, index) => (
          <Media
            key={index}
            index={index}
            media={media}
            current={current}
            select={() => setCurrent(index)}
            folder={folderData}
            footer={footer}
            openMenu={() => setMenuStatus(true)}
          />
        ))}
      </div>
      {menu}
    </Fragment>
  );
}

export default Content;
