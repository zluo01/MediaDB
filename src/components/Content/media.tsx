import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { cn } from '@/lib/utils';
import { IMediaData, IMovieData, MediaType } from '@/type';
import join from 'lodash/join';
import { Accessor } from 'solid-js';

interface IMediaProps {
  media: IMediaData;
  folderDir: Accessor<string>;
  folderName: string;
}

function Media({ media, folderDir, folderName }: IMediaProps) {
  const cover = getCacheImagePath(
    folderDir(),
    folderName,
    media.type === MediaType.COMIC
      ? media.posters.main
      : join([media.path, media.posters.main], '/'),
  );

  return (
    <div class="flex w-full cursor-pointer flex-col items-center justify-center">
      <div class="flex size-full overflow-hidden rounded-md">
        <Poster
          styles="w-full transition-all hover:scale-105"
          src={cover}
          alt={media.title}
          width={240}
          height={320}
        />
      </div>
      <div class="flex w-full flex-col pt-1">
        <span title={media.title} class="truncate text-base">
          {media.title}
        </span>
        <span
          class={cn(
            'truncate text-sm opacity-0',
            media.type === MediaType.MOVIE &&
              (media as IMovieData).year &&
              'opacity-30',
          )}
        >
          {media.type === MediaType.MOVIE
            ? (media as IMovieData).year || 'DUMMY_TEXT'
            : 'DUMMY_TEXT'}
        </span>
      </div>
    </div>
  );
}

export default Media;
