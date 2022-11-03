import { IFolder } from '@/type';
import { appDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import crypto from 'crypto';
import Image, { ImageProps } from 'next/image';
import path from 'path';
import React, { useEffect, useState } from 'react';

interface IImageLoaderPops extends ImageProps {
  folder: IFolder;
}

function ImageLoader({ folder, src, ...props }: IImageLoaderPops): JSX.Element {
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    async function getCacheImagePath(): Promise<string> {
      const appDirPath = await appDir();
      const folder_dir = folder.path.substring(
        folder.path.lastIndexOf('/') + 1
      );
      const fileName = crypto
        .createHash('md5')
        .update(src as string)
        .digest('hex');
      return convertFileSrc(
        path.join(appDirPath, 'thumbnails', folder_dir, fileName)
      );
    }

    let isMount = true;
    getCacheImagePath().then(url => {
      if (isMount) {
        setSource(url);
      }
    });

    return () => {
      isMount = false;
    };
  }, [folder.path, src]);

  return <Image src={source} {...props} />;
}

export default ImageLoader;
