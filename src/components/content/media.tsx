import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { IMediaData, IMovieData, MediaType } from '@/type';
import clsx from 'clsx';
import join from 'lodash/join';

interface IMediaProps {
  media: IMediaData;
  folderDir: string;
  folderName: string;
}

function Media({ media, folderDir, folderName }: IMediaProps) {
  function subStyle() {
    if (media.type === MediaType.MOVIE && (media as IMovieData).year) {
      return 'opacity-100';
    }
    return 'opacity-0';
  }

  const cover = getCacheImagePath(
    folderDir,
    folderName,
    media.type === MediaType.COMIC
      ? media.posters.main
      : join([media.path, media.posters.main], '/'),
  );

  return (
    <div className="flex w-full cursor-pointer flex-col items-center justify-center">
      <div className="flex size-full overflow-hidden rounded-md">
        <Poster
          className="w-full transition-all hover:scale-105"
          src={cover}
          alt={media.title}
          width={240}
          height={320}
        />
      </div>
      <div className="flex w-full flex-col pt-1">
        <span title={media.title} className="truncate text-base text-primary">
          {media.title}
        </span>
        <span className={clsx(subStyle(), 'truncate text-sm text-secondary')}>
          {media.type === MediaType.MOVIE
            ? (media as IMovieData).year || 'DUMMY_TEXT'
            : 'DUMMY_TEXT'}
        </span>
      </div>
    </div>
  );
}

export default Media;
