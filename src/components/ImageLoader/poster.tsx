import { CoverType, IImageLoaderPops } from '@/type';
import clsx from 'clsx';

function Poster({ cover, t, ...props }: IImageLoaderPops) {
  return (
    <img
      className={clsx(
        'h-full w-auto max-w-full bg-cover bg-no-repeat object-cover align-middle italic',
        t === CoverType.POSTER && 'w-full transition-all hover:scale-105',
      )}
      src={cover}
      {...props}
      alt={props.alt}
      loading="lazy"
    />
  );
}

export default Poster;
