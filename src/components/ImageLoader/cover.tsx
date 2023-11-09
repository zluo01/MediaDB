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

function Cover({ folder, src, ...props }: IImageLoaderPops): ReactElement {
  const imgPath = getCacheImagePath(folder, src as string);
  const [imgSrc, setImgSrc] = useState(imgPath + '-thumbnail' || src);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
    };
  }, [src]);

  return (
    <img className="h-full w-auto" src={imgSrc} {...props} alt={props.alt} />
  );
}

export default Cover;
