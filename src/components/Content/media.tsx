import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { openFile } from '@/lib/os';
import classNames from '@/lib/utils';
import {
  COMIC,
  CoverType,
  IFolder,
  IMediaData,
  IMovieData,
  MOVIE,
  TV_SERIES,
} from '@/type';
import { batch, computed, Signal } from '@preact/signals-react';
import join from 'lodash/join';

interface IMediaProps {
  index: number;
  current: Signal<number>;
  media: IMediaData;
  folder: IFolder;
  footer: Signal<string>;
  menu: Signal<boolean>;
}

function Media({ index, current, media, folder, footer, menu }: IMediaProps) {
  const isCurrent = computed(() => current.value === index);

  async function handleOpen(media: IMediaData) {
    switch (media.type) {
      case COMIC:
      case MOVIE:
        await openFile(
          join([folder.path, media.relativePath, media.file], '/'),
        );
        break;
      case TV_SERIES:
        menu.value = true;
        break;
    }
  }

  function subStyle() {
    if (media.type === MOVIE && (media as IMovieData).year) {
      return 'opacity-100';
    }
    return 'opacity-0';
  }

  function select() {
    batch(() => {
      current.value = index;
      footer.value = media.title;
    });
  }

  const { thumbnail, cover } = getCacheImagePath(
    folder,
    join([media.relativePath, media.posters.main], '/'),
  );

  return (
    <div
      id={`c${index}`}
      onClick={select}
      onDoubleClick={() => handleOpen(media)}
      className={classNames(
        isCurrent.value ? 'bg-white/20 shadow-lg rounded-md' : '',
        'flex w-full flex-col items-center justify-center p-2 hover:scale-105 hover:transition-all hover:rounded-xl cursor-pointer',
      )}
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
        <span
          className={classNames(subStyle(), 'truncate text-sm text-secondary')}
        >
          {media.type === MOVIE
            ? (media as IMovieData).year || 'DUMMY_TEXT'
            : 'DUMMY_TEXT'}
        </span>
      </div>
    </div>
  );
}

export default Media;
