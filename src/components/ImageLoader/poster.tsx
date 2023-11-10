import classNames from '@/lib/utils';
import { CoverType, IImageLoaderPops } from '@/type';
import { ReactElement } from 'react';

function Poster({
  thumbnail,
  cover,
  t,
  ...props
}: IImageLoaderPops): ReactElement {
  return (
    <img
      className={classNames(
        t === CoverType.POSTER ? 'w-full object-cover' : 'w-auto',
        'max-w-full bg-no-repeat bg-cover italic align-middle h-full',
      )}
      src={cover}
      style={{ backgroundImage: `url(${thumbnail})` }}
      {...props}
      alt={props.alt}
    />
  );
}

export default Poster;
