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
import { Dispatch } from 'redux';

import { updateFolder } from '../../lib/store';
import { IFolder, IFolderAction, ISettingAction } from '../../type';
import { removeFolder, updateFolders } from '../../utils/store';

const EditFolder = dynamic(() => import('../modals/editFolder'), {
  ssr: false,
});

interface IFolderList {
  folderData: IFolder[];
  dispatch: Dispatch<IFolderAction | ISettingAction>;
}

function FolderList({ folderData, dispatch }: IFolderList): JSX.Element {
  const [folderIndex, setFolderIndex] = useState(-1);

  function reorder(list: IFolder[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }

  async function handleUpdateFolder(folders: IFolder[]) {
    updateFolder(dispatch, folders);
  }

  async function handleRemove(name: string) {
    try {
      const data = await removeFolder(name);
      updateFolder(dispatch, data);
    } catch (e) {
      console.error(e);
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
        const result = reorder(folderData, src, dst);
        await updateFolders(result);
        updateFolder(dispatch, result);
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {provided => (
            <List ref={provided.innerRef} {...provided.droppableProps}>
              {folderData.map((folder, index) => (
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
                          secondary={folder.dir}
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
                            onClick={() => handleRemove(folder.name)}
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
      <EditFolder
        open={folderIndex >= 0}
        close={() => setFolderIndex(-1)}
        folderIndex={folderIndex}
        updateFolder={handleUpdateFolder}
      />
    </>
  );
}

export default FolderList;
