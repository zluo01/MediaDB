import { updateFooter } from '@/lib/context';
import { openFile } from '@/lib/os';
import { openModal } from '@/lib/utils';
import { IMediaData, MediaType } from '@/type';
import { Menu } from '@tauri-apps/api/menu/menu';
import join from 'lodash/join';
import { Accessor, JSXElement } from 'solid-js';
import { DOMElement } from 'solid-js/jsx-runtime';

interface IContextProps {
  index: Accessor<number>;
  media: IMediaData;
  folderPath: string;
  select: VoidFunction;
  children: JSXElement;
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

function Context({
  index,
  media,
  folderPath,
  children,
  select,
}: IContextProps) {
  async function handleOpen(media: IMediaData) {
    switch (media.type) {
      case MediaType.COMIC:
        await openFile(join([folderPath, media.file], '/'));
        break;
      case MediaType.MOVIE:
        await openFile(join([folderPath, media.path, media.file], '/'));
        break;
      case MediaType.TV_SERIES:
        openModal(`menu-${media.title}`);
        break;
    }
  }

  function onSelect() {
    select();
    updateFooter(media.title);
  }

  async function openMenu(
    e: MouseEvent & { currentTarget: HTMLDivElement; target: DOMElement },
  ) {
    e.preventDefault();
    const menu = await Menu.new({
      items: [
        {
          id: 'openInFolder',
          text: 'Open in Folder',
          action: () => openContainedFolder(folderPath, media.type, media.path),
        },
      ],
    });

    await menu.popup();
  }

  return (
    <div
      id={`c${index()}`}
      tabIndex={-1}
      onClick={onSelect}
      onContextMenu={openMenu}
      onDblClick={() => handleOpen(media)}
      onFocus={e =>
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      class="flex w-full cursor-pointer p-2 hover:rounded-xl focus:rounded-md focus:bg-white/20 focus:shadow-lg focus:ring-0"
    >
      {children}
    </div>
  );
}

export default Context;
