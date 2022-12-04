import { notify } from '@/lib/os';
import { updateSkipFolders } from '@/lib/queries';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import React from 'react';
import { useSWRConfig } from 'swr';

interface ISkipFolderListProps {
  skipFolders: string[];
}

function SkipFolderList({ skipFolders }: ISkipFolderListProps): JSX.Element {
  const { mutate } = useSWRConfig();

  async function handleRemove(folder: string) {
    try {
      const newSkipFolders = skipFolders.filter(o => o !== folder).join(',');
      await updateSkipFolders(mutate, newSkipFolders);
    } catch (e) {
      await notify(`Update Folder Error: ${e}`);
    }
  }

  return (
    <List>
      {skipFolders.map((folder, index) => (
        <ListItem key={index}>
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary={folder} />
          <ListItemSecondaryAction>
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
      ))}
    </List>
  );
}

export default SkipFolderList;
