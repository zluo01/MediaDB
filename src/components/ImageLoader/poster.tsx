import { getCacheImagePath } from '@/components/ImageLoader/common';
import { IFolder } from '@/type';
import { ReactElement, useEffect, useState } from 'react';

interface IImageLoaderPops {
  folder: IFolder;
  src: string;
  alt: string;
  width: number;
  height: number;
}

function Poster({ folder, src, ...props }: IImageLoaderPops): ReactElement {
  const { thumbnail, cover } = getCacheImagePath(folder, src as string);
  const [imgSrc, setImgSrc] = useState(thumbnail);

  useEffect(() => {
    const img = new Image();
    img.src = cover;
    img.onload = () => {
      setImgSrc(cover);
    };
  }, [src]);

  return (
    <img
      className="h-full w-full object-cover"
      src={imgSrc}
      {...props}
      alt={props.alt}
    />
  );
}

export default Poster;
