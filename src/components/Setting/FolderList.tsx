import { notify } from '@/lib/os';
import { useGetFolderListQuery, useRemoveFolderTrigger } from '@/lib/queries';
import { useAppDispatch } from '@/lib/source';
import { openEditFolderModal } from '@/lib/source/slice/editFolderModalSlice';
import { updateFolderList } from '@/lib/storage';
import { IFolder } from '@/type';
import { Delete, Edit, Folder } from '@mui/icons-material';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import dynamic from 'next/dynamic';
import React, { Fragment, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';

const EditFolderModal = dynamic(() => import('@/components/Modal/Folder'));

function FolderList(): JSX.Element {
  const dispatch = useAppDispatch();

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
    if (!result.destination) {
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
    dispatch(openEditFolderModal());
  }

  return (
    <Fragment>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {provided => (
            <List ref={provided.innerRef} {...provided.droppableProps}>
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
                      <ListItem>
                        <ListItemIcon>
                          <Folder />
                        </ListItemIcon>
                        <ListItemText
                          primary={folder.name}
                          secondary={folder.path}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size={'large'}
                            edge="end"
                            aria-label="edit"
                            onClick={() => openModal(folder.position)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size={'large'}
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemove(folder)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      <EditFolderModal index={folderIndex} />
    </Fragment>
  );
}

export default FolderList;
