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

function Media(props: IMediaProps) {
  const cover = () =>
    getCacheImagePath(
      props.folderDir(),
      props.folderName,
      props.media.type === MediaType.COMIC
        ? props.media.posters.main
        : join([props.media.path, props.media.posters.main], '/'),
    );

  return (
    <div class="flex w-full cursor-pointer flex-col items-center justify-center">
      <div class="flex size-full overflow-hidden rounded-md">
        <Poster
          styles="w-full transition-all hover:scale-105"
          src={cover()}
          alt={props.media.title}
          width={240}
          height={320}
        />
      </div>
      <div class="flex w-full flex-col pt-1">
        <span title={props.media.title} class="truncate text-base">
          {props.media.title}
        </span>
        <span
          class={cn(
            'truncate text-sm opacity-0',
            props.media.type === MediaType.MOVIE &&
              (props.media as IMovieData).year &&
              'opacity-30',
          )}
        >
          {props.media.type === MediaType.MOVIE
            ? (props.media as IMovieData).year || 'DUMMY_TEXT'
            : 'DUMMY_TEXT'}
        </span>
      </div>
    </div>
  );
}

export default Media;
