import { BLUR_IMG, getCacheImagePath } from '@/components/ImageLoader/common';
import { IFolder } from '@/type';
import Image, { ImageProps } from 'next/image';
import { ReactElement } from 'react';

interface IImageLoaderPops extends ImageProps {
  folder: IFolder;
}

function Cover({ folder, src, ...props }: IImageLoaderPops): ReactElement {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      src={getCacheImagePath(folder, src as string)}
      placeholder={'blur'}
      blurDataURL={BLUR_IMG}
      style={{
        width: 'auto',
        height: '100%',
      }}
      {...props}
    />
  );
}

export default Cover;
