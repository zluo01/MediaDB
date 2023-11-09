import { CoverType, IImageLoaderPops } from '@/type';
import { effect, useSignal } from '@preact/signals-react';
import { ReactElement } from 'react';

function Poster({
  thumbnail,
  cover,
  t,
  ...props
}: IImageLoaderPops): ReactElement {
  const imgSrc = useSignal(thumbnail);

  effect(() => {
    const img = new Image();
    img.src = cover;
    img.onload = () => {
      imgSrc.value = cover;
    };
  });

  return (
    <img
      className={
        t === CoverType.POSTER ? 'h-full w-full object-cover' : 'h-full w-auto'
      }
      src={imgSrc.value}
      {...props}
      alt={props.alt}
      loading="lazy"
    />
  );
}

export default Poster;
