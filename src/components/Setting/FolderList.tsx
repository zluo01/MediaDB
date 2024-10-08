import { useModalStore } from '@/lib/context';
import { notify } from '@/lib/os';
import { useGetFolderListQuery, useRemoveFolderTrigger } from '@/lib/queries';
import { updateFolderList } from '@/lib/storage';
import { IFolder, ModalType } from '@/type';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from '@hello-pangea/dnd';
import {
  FolderIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { Fragment, lazy, ReactElement, Suspense, useState } from 'react';

const EditFolderModal = lazy(() => import('@/components/Modal/Folder'));

function FolderList(): ReactElement {
  const { openModal } = useModalStore();

  const { data: folderList, mutate: revalidateFolderList } =
    useGetFolderListQuery();
  const { trigger } = useRemoveFolderTrigger();

  const [folderIndex, setFolderIndex] = useState(-1);

  function reorder(list: IFolder[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }

  async function handleRemove(folder: IFolder) {
    try {
      await trigger(folder);
    } catch (e) {
      await notify(`Update Folder Error: ${e}`);
    }
  }

  async function onDragEnd(result: DropResult) {
    // dropped outside the list
    if (!folderList || !result.destination) {
      return;
    }

    const src = result.source.index;
    const dst = result.destination.index;

    if (result.source.index !== result.destination.index) {
      try {
        const result = reorder(folderList, src, dst);
        await updateFolderList(result);
        await revalidateFolderList();
      } catch (e) {
        await notify(`Drag End: ${e}`);
      }
    }
  }

  function open(id: number) {
    setFolderIndex(id);
    openModal(ModalType.EDIT_FOLDER);
  }

  return (
    <Fragment>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(dropProvided: DroppableProvided) => (
            <ul
              className="w-full"
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
            >
              {folderList?.map(folder => (
                <Draggable
                  key={folder.name}
                  draggableId={folder.name}
                  index={folder.position}
                >
                  {(dragProvided: DraggableProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      style={{ ...dragProvided.draggableProps.style }}
                    >
                      <li className="flex w-full flex-row items-center justify-between p-2">
                        <div className="flex grow flex-row items-center text-secondary">
                          <FolderIcon className="mr-2 size-10" />
                          <div className="flex flex-col items-start justify-around ">
                            <span className="truncate text-primary">
                              {folder.name}
                            </span>
                            <span className="truncate text-sm">
                              {folder.path}
                            </span>
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
                            onClick={() => handleRemove(folder)}
                            type="button"
                            className="inline-flex items-center rounded-lg bg-none p-2.5 text-center text-sm font-medium text-secondary hover:text-hover focus:outline-none focus:ring-0"
                          >
                            <TrashIcon className="size-6" />
                            <span className="sr-only">Add new folder</span>
                          </button>
                        </div>
                      </li>
                    </div>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <Suspense>
        <EditFolderModal index={folderIndex} />
      </Suspense>
    </Fragment>
  );
}

export default FolderList;
