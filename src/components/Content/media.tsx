import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { useAppDispatch } from '@/lib/context';
import { openMenu } from '@/lib/context/slice/menuSlice';
import { openFile } from '@/lib/os';
import {
  COMIC,
  CoverType,
  IFolder,
  IMediaData,
  IMovieData,
  MOVIE,
  TV_SERIES,
} from '@/type';
import clsx from 'clsx';
import join from 'lodash/join';

interface IMediaProps {
  index: number;
  media: IMediaData;
  folder: IFolder;
  select: VoidFunction;
}

function Media({ index, media, folder, select }: IMediaProps) {
  const dispatch = useAppDispatch();

  async function handleOpen(media: IMediaData) {
    switch (media.type) {
      case COMIC:
      case MOVIE:
        await openFile(
          join([folder.path, media.relativePath, media.file], '/'),
        );
        break;
      case TV_SERIES:
        dispatch(
          openMenu({
            folder,
            data: media,
          }),
        );
        break;
    }
  }

  function subStyle() {
    if (media.type === MOVIE && (media as IMovieData).year) {
      return 'opacity-100';
    }
    return 'opacity-0';
  }

  const { thumbnail, cover } = getCacheImagePath(
    folder,
    join([media.relativePath, media.posters.main], '/'),
  );

  function onSelect() {
    select();
    const anchor = document.getElementById(`c${index}`);
    if (anchor) {
      anchor.focus({ preventScroll: false });
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const footer = document.getElementById('footer');
    if (footer) {
      footer.innerText = media.title;
    }
  }

  return (
    <div
      id={`c${index}`}
      onClick={onSelect}
      onDoubleClick={() => handleOpen(media)}
      tabIndex={-1}
      className="flex w-full cursor-pointer flex-col items-center justify-center p-2 hover:scale-105 hover:rounded-xl hover:transition-all focus:rounded-md focus:bg-white/20 focus:shadow-lg focus:ring-0"
    >
      <Poster
        thumbnail={thumbnail}
        cover={cover}
        alt={media.title}
        width={240}
        height={320}
        t={CoverType.POSTER}
      />
      <div className="flex w-full flex-col pt-1">
        <span title={media.title} className="truncate text-base text-primary">
          {media.title}
        </span>
        <span className={clsx(subStyle(), 'truncate text-sm text-secondary')}>
          {media.type === MOVIE
            ? (media as IMovieData).year || 'DUMMY_TEXT'
            : 'DUMMY_TEXT'}
        </span>
      </div>
    </div>
  );
}

export default Media;
