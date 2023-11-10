import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { openFile } from '@/lib/os';
import classNames from '@/lib/utils';
import { CoverType, IFolder, IMediaData, IMovieData, MOVIE } from '@/type';
import { computed, Signal } from '@preact/signals-core';
import join from 'lodash/join';

interface IMediaProps {
  index: number;
  current: Signal<number>;
  media: IMediaData;
  folder: IFolder;
  openMenu: VoidFunction;
}

function Media({ index, current, media, folder, openMenu }: IMediaProps) {
  const isCurrent = computed(() => current.value === index);

  async function handleOpen(media: IMediaData) {
    switch (media.type) {
      // case 'comic':
      case 'movie':
        await openFile(
          join([folder.path, media.relativePath, media.file], '/'),
        );
        break;
      case 'tvshow':
        openMenu();
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

  return (
    <div
      id={`c${index}`}
      onClick={() => (current.value = index)}
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
