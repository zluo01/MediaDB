import Media from '@/components/Content/media';
import { openFile } from '@/lib/os';
import { useAppDispatch, useAppSelector } from '@/lib/source';
import { update } from '@/lib/source/slice/footerSlice';
import { RootState } from '@/lib/source/store';
import {
  DEFAULT,
  IFolderData,
  IMediaData,
  IMovieData,
  ITVShowData,
  MOVIE,
  TITLE_ASC,
  TITLE_DSC,
  TV_SERIES,
  YEAR_ASC,
  YEAR_DSC,
} from '@/type';
import path from 'path';
import React, {
  Fragment,
  lazy,
  ReactElement,
  useEffect,
  useState,
} from 'react';

const Menu = lazy(() => import('./menu'));

interface ICardProps {
  folderData: IFolderData;
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

function filterData(
  folderData: IFolderData,
  tags: string[],
  genres: string[],
  actors: string[],
  studios: string[],
): IMediaData[] {
  let media = [...folderData.data];

  tags.forEach(t => {
    media = media.filter(o => o.tags.includes(t));
  });

  genres.forEach(g => {
    media = media.filter(o => o.genres.includes(g));
  });

  actors.forEach(a => {
    media = media.filter(o => o.actors.includes(a));
  });

  studios.forEach(a => {
    media = media.filter(o => o.studios.includes(a));
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
}

function Content({ folderData }: ICardProps): ReactElement {
  const column = useGetColumnSize();

  const dispatch = useAppDispatch();

  const { tags, genres, actors, studios } = useAppSelector(
    (state: RootState) => state.filter,
  );

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(-1);

  const data = filterData(folderData, tags, genres, actors, studios);

  useEffect(() => {
    const anchor = document.getElementById(`c${current}`);
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [current]);

  useEffect(() => {
    async function handleKeyPress(ev: KeyboardEvent) {
      // when menu is opened, do not listen to key change
      if (open) {
        return;
      }
      const c = current % column;
      const r = Math.floor(current / column);
      let index: number;
      switch (ev.key) {
        case 'ArrowLeft':
          setCurrent(prevState =>
            prevState - 1 < 0 ? data.length - 1 : prevState - 1,
          );
          break;
        case 'ArrowRight':
          setCurrent(prevState => (prevState + 1) % data.length);
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
          if (index > data.length - 1) {
            return;
          }
          setCurrent(index);
          break;
        case 'Enter':
          switch (data[current].type) {
            case MOVIE:
              const media = data[current] as IMovieData;
              const filePath = path.join(
                folderData.path,
                media.relativePath,
                media.file,
              );
              await openFile(filePath);
              break;
            case TV_SERIES:
              setOpen(true);
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

  useEffect(() => {
    const content = current < 0 ? `Total ${data.length}` : data[current]?.title;
    dispatch(update(content));
  }, [data, current, dispatch]);

  function TVMenu() {
    if (current < 0) {
      return <div />;
    }
    const type = data[current]?.type;
    if (type === TV_SERIES) {
      return (
        <Menu
          folder={folderData}
          data={data[current] as ITVShowData}
          open={open}
          close={() => setOpen(false)}
        />
      );
    }
    return <div />;
  }

  return (
    <Fragment>
      <div className="grid auto-rows-fr sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
        {data.map((media, index) => (
          <Media
            key={index}
            index={index}
            media={media}
            current={current === index}
            folder={folderData}
            select={() => setCurrent(index)}
            openMenu={() => setOpen(true)}
          />
        ))}
      </div>
      <TVMenu />
    </Fragment>
  );
}

export default Content;
