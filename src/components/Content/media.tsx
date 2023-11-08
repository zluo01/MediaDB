import Poster from '@/components/ImageLoader/poster';
import { openFile } from '@/lib/os';
import classNames from '@/lib/utils';
import { IFolder, IMediaData, IMovieData, MOVIE } from '@/type';
import path from 'path';
import React, { memo } from 'react';

interface IMediaProps {
  index: number;
  current: boolean;
  media: IMediaData;
  folder: IFolder;
  select: VoidFunction;
  openMenu: VoidFunction;
}

function Media({
  index,
  current,
  media,
  folder,
  select,
  openMenu,
}: IMediaProps) {
  async function handleOpen(media: IMediaData) {
    switch (media.type) {
      // case 'comic':
      case 'movie':
        await openFile(path.join(folder.path, media.relativePath, media.file));
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

  return (
    <div
      id={`c${index}`}
      onClick={select}
      onDoubleClick={() => handleOpen(media)}
      className={classNames(
        current ? 'bg-white/20 shadow-lg rounded-md' : '',
        'flex w-full flex-col items-center justify-center p-2 hover:scale-105 hover:transition-all hover:rounded-xl',
      )}
    >
      <Poster
        folder={folder}
        src={path.join(media.relativePath, media.posters['main'])}
        alt={media.title}
        width={240}
        height={320}
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

export default memo(
  Media,
  (prevProps, nextProps) =>
    prevProps.index == nextProps.index &&
    prevProps.current == nextProps.current &&
    prevProps.media === nextProps.media,
);
