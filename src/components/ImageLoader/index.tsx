import { IFolder } from '@/type';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import crypto from 'crypto';
import Image, { ImageProps } from 'next/image';
import path from 'path';

interface IImageLoaderPops extends ImageProps {
  folder: IFolder;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

function ImageLoader({ folder, src, ...props }: IImageLoaderPops): JSX.Element {
  function getCacheImagePath(src: string): string {
    const fileName = crypto.createHash('md5').update(src).digest('hex');
    console.log(`${src} -> ${fileName}`);
    return convertFileSrc(
      path.join(folder.appDir, 'thumbnails', folder.name, fileName)
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      src={getCacheImagePath(src as string)}
      placeholder={'blur'}
      blurDataURL={`data:image/svg+xml;base64,${toBase64(
        shimmer(props.width as number, props.height as number)
      )}`}
      {...props}
    />
  );
}

export default ImageLoader;
