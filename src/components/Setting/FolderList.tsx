import { notify } from '@/lib/os';
import { removeFolder, useGetFolderListQuery } from '@/lib/queries';
import { updateFolderList } from '@/lib/storage';
import { IFolder } from '@/type';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FolderIcon from '@mui/icons-material/Folder';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { useSWRConfig } from 'swr';

const EditFolderModal = dynamic(() => import('@/components/Modal/Folder'));

function FolderList(): JSX.Element {
  const { mutate } = useSWRConfig();
  const { data: folderList, mutate: revalidateFolderList } =
    useGetFolderListQuery();

  const [folderIndex, setFolderIndex] = useState(-1);

  function reorder(list: IFolder[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }

  async function handleRemove(folder: IFolder) {
    try {
      await removeFolder(mutate, folder);
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

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {provided => (
            <List ref={provided.innerRef} {...provided.droppableProps}>
              {folderList?.map((folder, index) => (
                <Draggable
                  key={folder.name}
                  draggableId={folder.name}
                  index={index}
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
                          <FolderIcon />
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
                            onClick={() => setFolderIndex(index)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size={'large'}
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemove(folder)}
                          >
                            <DeleteIcon />
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
      <EditFolderModal
        open={folderIndex >= 0}
        close={() => setFolderIndex(-1)}
        index={folderIndex}
      />
    </>
  );
}

export default FolderList;
