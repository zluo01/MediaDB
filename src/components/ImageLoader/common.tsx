import { IFolder } from '@/type';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import path from 'path';

export const BLUR_IMG =
  'data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJnIj4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzMzMyIgb2Zmc2V0PSIyMCUiIC8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMyMjIiIG9mZnNldD0iNTAlIiAvPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMzMzIiBvZmZzZXQ9IjcwJSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMzIwIiBmaWxsPSIjMzMzIiAvPgogIDxyZWN0IGlkPSJyIiB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMyMCIgZmlsbD0idXJsKCNnKSIgLz4KICA8YW5pbWF0ZSB4bGluazpocmVmPSIjciIgYXR0cmlidXRlTmFtZT0ieCIgZnJvbT0iLTI0MCIgdG89IjI0MCIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiICAvPgo8L3N2Zz4=';

export function getCacheImagePath(folder: IFolder, src: string): string {
  return convertFileSrc(
    path.join(
      folder.appDir,
      'thumbnails',
      folder.name,
      src
        .replace('\\', '/')
        .replace('.jpg', '')
        .replace('.png', '')
        .replace('.jpeg', '')
        .replace('.bmp', '')
        .replace('.gif', '')
        .replace('.webp', ''),
    ),
  );
}
