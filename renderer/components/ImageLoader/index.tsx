import Skeleton from '@material-ui/lab/Skeleton';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { ICardSize } from '../../type';
import { readImage } from '../../utils/electron';

interface IImageProps {
  dir: string;
  title: string;
  size: ICardSize;
}

function ImageHolder({ dir, title, size }: IImageProps): JSX.Element {
  const [data, setData] = useState<string>();
  const [error, setError] = useState();

  useEffect(() => {
    readImage(dir)
      .then(data => setData(data))
      .catch(err => setError(err));
  });

  if (error) {
    return <Skeleton variant="rect" width={size.width} height={size.height} />;
  }
  if (!data) {
    return (
      <Skeleton
        animation="wave"
        variant="rect"
        width={size.width}
        height={size.height}
      />
    );
  }
  return (
    <Image src={data} alt={title} width={size.width} height={size.height} />
  );
}

export default ImageHolder;
