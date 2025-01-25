import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useFooterStore, useMenuStore } from '@/lib/context';
import { openFile } from '@/lib/os';
import { IFolder, IMediaData, MediaType } from '@/type';
import join from 'lodash/join';
import { ReactNode } from 'react';

interface IContextProps {
  index: number;
  media: IMediaData;
  folder: IFolder;
  select: VoidFunction;
  children: ReactNode;
}

async function openContainedFolder(
  folderPath: string,
  mediaType: MediaType,
  mediaPath: string,
) {
  switch (mediaType) {
    case MediaType.COMIC:
      await openFile(folderPath);
      break;
    case MediaType.MOVIE:
    case MediaType.TV_SERIES:
      await openFile(join([folderPath, mediaPath], '/'));
      break;
  }
}

function Context({ index, media, folder, children, select }: IContextProps) {
  const { openMenu } = useMenuStore();
  const { update } = useFooterStore();

  async function handleOpen(media: IMediaData) {
    switch (media.type) {
      case MediaType.COMIC:
        await openFile(join([folder.path, media.file], '/'));
        break;
      case MediaType.MOVIE:
        await openFile(join([folder.path, media.path, media.file], '/'));
        break;
      case MediaType.TV_SERIES:
        openMenu({
          folder,
          data: media,
        });
        break;
    }
  }

  function onSelect() {
    select();
    const anchor = document.getElementById(`c${index}`);
    if (anchor) {
      anchor.focus({ preventScroll: false });
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    update(media.title);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id={`c${index}`}
        onClick={onSelect}
        onDoubleClick={() => handleOpen(media)}
        tabIndex={-1}
        className="flex w-full cursor-pointer p-2 hover:rounded-xl focus:rounded-md focus:bg-white/20 focus:shadow-lg focus:ring-0 data-[state='open']:rounded-xl data-[state='open']:bg-white/20"
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 border-0 bg-secondary text-selected">
        <ContextMenuItem
          className="cursor-pointer focus:bg-selected focus:text-hover"
          inset
          onClick={() =>
            openContainedFolder(folder.path, media.type, media.path)
          }
        >
          Open in Folder
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default Context;
