import React, { useState } from 'react';

import { ICardSize } from '../../type';
import { getCacheImagePath } from '../../utils/store';

interface IImageProps {
  dir: string;
  title: string;
  size: ICardSize;
}

function ImageHolder({ dir, title, size }: IImageProps): JSX.Element {
  const [src, setSrc] = useState<string>(getCacheImagePath(dir));

  async function handleError() {
    setSrc('file://' + dir);
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      onError={handleError}
      alt={title}
      style={{ width: size.width, height: size.height }}
      loading={'lazy'}
    />
  );
}

export default ImageHolder;
