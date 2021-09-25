import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Dialog, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import path from 'path';
import React, { useState } from 'react';

import { IFolder } from '../../type';
import { getDirectory } from '../../utils/electron';
import { buildDirectory } from '../../utils/parser';
import { addFolder } from '../../utils/store';
import {
  ModalTitle,
  ModalContent,
  ActionButtonGroups,
  DialogButton,
} from './styles';

interface IDirectoryModal {
  open: boolean;
  close: () => void;
  folders: IFolder[];
  updateFolder: (folders: IFolder[]) => void;
}

const MoreButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,

  '&:hover': {
    color: theme.palette.action.selected,
  },
}));

function DirectoryModal({
  open,
  close,
  folders,
  updateFolder,
}: IDirectoryModal): JSX.Element {
  const [value, setValue] = useState<IFolder>({
    dir: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleDirectory() {
    const dir = await getDirectory();
    const subDir = dir.split(path.sep);
    setValue({ ...value, name: subDir[subDir.length - 1], dir: dir });
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await buildDirectory(value.dir);
      updateFolder(addFolder(value, data));
      setLoading(false);
      setValue({ name: '', dir: '' });
      close();
    } catch (e) {
      console.error('import folders', e);
    }
  }

  async function handleClose() {
    setValue({
      dir: '',
      name: '',
    });
    close();
  }

  const nameError = folders.map(o => o.name).includes(value.name);

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth={true}
      aria-labelledby="form-dialog-title"
    >
      <ModalTitle id="alert-dialog-slide-title">Add Directory</ModalTitle>
      <ModalContent>
        <TextField
          id="dir"
          label="Directory"
          margin="normal"
          variant="standard"
          value={value.dir}
          InputProps={{
            endAdornment: (
              <MoreButton onClick={handleDirectory}>
                <MoreHorizIcon />
              </MoreButton>
            ),
          }}
          onChange={e => setValue({ ...value, dir: e.target.value })}
          autoFocus
          required
          fullWidth
        />
        <TextField
          id="name"
          label="Name"
          type="text"
          margin="dense"
          variant="standard"
          value={value.name}
          onChange={e => setValue({ ...value, name: e.target.value })}
          error={nameError || !value.name}
          helperText={nameError && 'Name Already Exists'}
          required
          fullWidth
        />
      </ModalContent>
      <ActionButtonGroups>
        <DialogButton onClick={handleClose} disabled={loading}>
          Cancel
        </DialogButton>
        <DialogButton onClick={handleSubmit} disabled={!value.dir || loading}>
          {loading ? 'loading...' : 'Add'}
        </DialogButton>
      </ActionButtonGroups>
    </Dialog>
  );
}

export default DirectoryModal;
