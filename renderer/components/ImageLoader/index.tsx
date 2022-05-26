import React, { CSSProperties, useState } from 'react';

import { getCacheImagePath } from '../../lib/store';

interface IImageProps {
  dir: string;
  title: string;
  style: CSSProperties;
}

function ImageHolder({ dir, title, style }: IImageProps): JSX.Element {
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
      style={style}
      loading={'lazy'}
    />
  );
}

export default ImageHolder;
