import { useModalStore } from '@/lib/context';
import { notify } from '@/lib/os';
import { useGetFolderListQuery, useRemoveFolderTrigger } from '@/lib/queries';
import { updateFolderList } from '@/lib/storage';
import { IFolder, ModalType } from '@/type';
import {
  FolderIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { Reorder, useDragControls } from 'motion/react';
import {
  lazy,
  MutableRefObject,
  ReactElement,
  Suspense,
  useRef,
  useState,
} from 'react';

const EditFolderModal = lazy(() => import('@/components/Modal/Folder'));

interface IFolderItemProps {
  folder: IFolder;
  open: (id: number) => void;
  remove: (folder: IFolder) => void;
  container: MutableRefObject<null>;
}

function FolderItem({
  folder,
  open,
  remove,
  container,
}: IFolderItemProps): ReactElement {
  const controls = useDragControls();

  return (
    <Reorder.Item
      key={folder.name}
      className="flex w-full cursor-grab flex-row items-center justify-between p-2"
      value={folder}
      whileDrag={{
        scale: 1.05,
        boxShadow: '0px 4px 10px rgba(0,0,0,0.3)',
      }}
      dragListener={false}
      dragControls={controls}
      dragConstraints={container}
      dragElastic={0.1}
    >
      <div
        className="flex grow flex-row items-center text-secondary"
        onPointerDown={e => controls.start(e)}
      >
        <FolderIcon className="mr-2 size-10" />
        <div className="flex flex-col items-start justify-around ">
          <span className="truncate text-primary">{folder.name}</span>
          <span className="truncate text-sm">{folder.path}</span>
        </div>
      </div>
      <div className="flex flex-row flex-nowrap items-center justify-end">
        <button
          onClick={() => open(folder.position)}
          type="button"
          className="inline-flex items-center rounded-lg bg-none p-2.5 text-center text-sm font-medium text-secondary hover:text-hover focus:outline-none focus:ring-0"
        >
          <PencilSquareIcon className="size-6" />
          <span className="sr-only">Add new folder</span>
        </button>
        <button
          onClick={() => remove(folder)}
          type="button"
          className="inline-flex items-center rounded-lg bg-none p-2.5 text-center text-sm font-medium text-secondary hover:text-hover focus:outline-none focus:ring-0"
        >
          <TrashIcon className="size-6" />
          <span className="sr-only">Add new folder</span>
        </button>
      </div>
    </Reorder.Item>
  );
}

function FolderList(): ReactElement {
  const container = useRef(null);

  const { openModal } = useModalStore();

  const { data: folderList, mutate: revalidateFolderList } =
    useGetFolderListQuery();
  const { trigger } = useRemoveFolderTrigger();

  const [folderIndex, setFolderIndex] = useState(-1);

  function open(id: number) {
    setFolderIndex(id);
    openModal(ModalType.EDIT_FOLDER);
  }

  async function remove(folder: IFolder) {
    try {
      await trigger(folder);
    } catch (e) {
      await notify(`Update Folder Error: ${e}`);
    }
  }

  async function onDragEnd(newOrder: IFolder[]) {
    // dropped outside the list
    if (!folderList || !newOrder) {
      return;
    }
    try {
      await updateFolderList(newOrder);
      await revalidateFolderList();
    } catch (e) {
      await notify(`Drag End: ${e}`);
    }
  }

  return (
    <>
      <Reorder.Group
        className="flex w-full select-none flex-col flex-nowrap"
        values={folderList || []}
        axis="y"
        onReorder={onDragEnd}
        ref={container}
      >
        {folderList?.map(folder => (
          <FolderItem
            key={folder.name}
            folder={folder}
            open={open}
            remove={remove}
            container={container}
          />
        ))}
      </Reorder.Group>
      <Suspense>
        <EditFolderModal index={folderIndex} />
      </Suspense>
    </>
  );
}

export default FolderList;
