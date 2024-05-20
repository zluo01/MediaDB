import { CoverType, IImageLoaderPops } from '@/type';
import clsx from 'clsx';
import { ReactElement } from 'react';

function Poster({ cover, t, ...props }: IImageLoaderPops): ReactElement {
  return (
    <img
      className={clsx(
        t === CoverType.POSTER ? 'w-full object-cover' : 'w-auto',
        'h-full max-w-full bg-cover bg-no-repeat align-middle italic',
      )}
      src={cover}
      {...props}
      alt={props.alt}
      loading="lazy"
    />
  );
}

export default Poster;
