import { BLUR_IMG, getCacheImagePath } from '@/components/ImageLoader/common';
import { IFolder } from '@/type';
import Image, { ImageProps } from 'next/image';
import { ReactElement } from 'react';

interface IImageLoaderPops extends ImageProps {
  folder: IFolder;
}

function Poster({ folder, src, ...props }: IImageLoaderPops): ReactElement {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      className="h-full w-full object-cover"
      src={getCacheImagePath(folder, src as string)}
      placeholder={'blur'}
      blurDataURL={BLUR_IMG}
      {...props}
    />
  );
}

export default Poster;
