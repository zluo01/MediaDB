import { modalStatus } from '@/lib/controls';
import { notify } from '@/lib/os';
import { useGetFolderListQuery, useRemoveFolderTrigger } from '@/lib/queries';
import { updateFolderList } from '@/lib/storage';
import { IFolder, ModalType } from '@/type';
import {
  FolderIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { Fragment, lazy, ReactElement, Suspense, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';

const EditFolderModal = lazy(() => import('@/components/Modal/Folder'));

function FolderList(): ReactElement {
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

  function openModal(id: number) {
    setFolderIndex(id);
    modalStatus.value = ModalType.EDIT_FOLDER;
  }

  return (
    <Fragment>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {provided => (
            <ul
              className="w-full"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {folderList?.map(folder => (
                <Draggable
                  key={folder.name}
                  draggableId={folder.name}
                  index={folder.position}
                >
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ ...provided.draggableProps.style }}
                    >
                      <li className="flex w-[100%] flex-row items-center justify-between p-2">
                        <div className="flex grow flex-row items-center text-secondary">
                          <FolderIcon className="mr-2 h-10 w-10" />
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
                            onClick={() => openModal(folder.position)}
                            type="button"
                            className="inline-flex items-center rounded-lg bg-none p-2.5 text-center text-sm font-medium text-secondary hover:text-hover focus:outline-none focus:ring-0"
                          >
                            <PencilSquareIcon className="h-6 w-6" />
                            <span className="sr-only">Add new folder</span>
                          </button>
                          <button
                            onClick={() => handleRemove(folder)}
                            type="button"
                            className="inline-flex items-center rounded-lg bg-none p-2.5 text-center text-sm font-medium text-secondary hover:text-hover focus:outline-none focus:ring-0"
                          >
                            <TrashIcon className="h-6 w-6" />
                            <span className="sr-only">Add new folder</span>
                          </button>
                        </div>
                      </li>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
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
