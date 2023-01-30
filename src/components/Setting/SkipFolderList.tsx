import { notify } from '@/lib/os';
import { useUpdateSkipFoldersTrigger } from '@/lib/queries';
import { Delete, Folder } from '@mui/icons-material';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import React from 'react';

interface ISkipFolderListProps {
  skipFolders: string[];
}

function SkipFolderList({ skipFolders }: ISkipFolderListProps): JSX.Element {
  const { trigger } = useUpdateSkipFoldersTrigger();

  async function handleRemove(folder: string) {
    try {
      await trigger(skipFolders.filter(o => o !== folder).join(','));
    } catch (e) {
      await notify(`Update Folder Error: ${e}`);
    }
  }

  return (
    <List>
      {skipFolders.map((folder, index) => (
        <ListItem key={index}>
          <ListItemIcon>
            <Folder />
          </ListItemIcon>
          <ListItemText primary={folder} />
          <ListItemSecondaryAction>
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
      ))}
    </List>
  );
}

export default SkipFolderList;
