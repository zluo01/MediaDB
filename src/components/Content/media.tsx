import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { useMenuStore } from '@/lib/context';
import { openFile } from '@/lib/os';
import { CoverType, IFolder, IMediaData, IMovieData, MediaType } from '@/type';
import clsx from 'clsx';
import join from 'lodash/join';

interface IMediaProps {
  index: number;
  media: IMediaData;
  folder: IFolder;
  select: VoidFunction;
}

function Media({ index, media, folder, select }: IMediaProps) {
  const { openMenu } = useMenuStore();

  async function handleOpen(media: IMediaData) {
    switch (media.type) {
      case MediaType.COMIC:
        await openFile(join([folder.path, media.file], '/'));
        break;
      case MediaType.MOVIE:
        await openFile(join([folder.path, media.path, media.file], '/'));
        break;
      case MediaType.TV_SERIES:
        openMenu({
          folder,
          data: media,
        });
        break;
    }
  }

  function subStyle() {
    if (media.type === MediaType.MOVIE && (media as IMovieData).year) {
      return 'opacity-100';
    }
    return 'opacity-0';
  }

  const cover = getCacheImagePath(
    folder,
    media.type === MediaType.COMIC
      ? media.posters.main
      : join([media.path, media.posters.main], '/'),
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
          {media.type === MediaType.MOVIE
            ? (media as IMovieData).year || 'DUMMY_TEXT'
            : 'DUMMY_TEXT'}
        </span>
      </div>
    </div>
  );
}

export default Media;
