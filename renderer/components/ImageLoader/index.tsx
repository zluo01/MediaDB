import React from 'react';

import { ICardSize } from '../../type';

interface IImageProps {
  dir: string;
  title: string;
  size: ICardSize;
}

function ImageHolder({ dir, title, size }: IImageProps): JSX.Element {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`file://${dir}`}
      alt={title}
      style={{ width: size.width, height: size.height }}
    />
  );
}

export default ImageHolder;
