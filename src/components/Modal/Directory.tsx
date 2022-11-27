import { buildDirectory, getDirectory, notify } from '@/lib/os';
import { revalidateFolderData } from '@/lib/queries';
import { IFolder } from '@/type';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Dialog, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useSWRConfig } from 'swr';

import {
  ActionButtonGroups,
  DialogButton,
  ModalContent,
  ModalTitle,
  MoreButton,
} from './styles';

interface IDirectoryModal {
  open: boolean;
  close: () => void;
  folderList: IFolder[];
}

function DirectoryModal({
  open,
  close,
  folderList,
}: IDirectoryModal): JSX.Element {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDirectory() {
    const dir = await getDirectory();
    const name = dir.split('\\').pop().split('/').pop();
    setName(name);
    setPath(dir);
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      await buildDirectory({ position: 0, name, path });
      await revalidateFolderData(mutate, folderList.length);
      await handleClose();
      await router.reload();
    } catch (e) {
      await notify(`Import Folders Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleClose() {
    close();
  }

  async function onClose() {
    if (!loading) {
      close();
    }
  }

  const nameError = folderList?.map(o => o.name).includes(name);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={true}
      aria-labelledby="form-dialog-title"
    >
      <ModalTitle id="alert-dialog-slide-title">Add Directory</ModalTitle>
      <ModalContent>
        <TextField
          id="name"
          label="Name"
          type="text"
          margin="dense"
          variant="standard"
          value={name}
          onChange={e => setName(e.target.value)}
          error={nameError || !name}
          helperText={nameError && 'Name Already Exists'}
          disabled={loading}
          required
          fullWidth
        />
        <TextField
          id="dir"
          label="Directory"
          margin="normal"
          variant="standard"
          value={path}
          InputProps={{
            endAdornment: (
              <MoreButton onClick={handleDirectory}>
                <MoreHorizIcon />
              </MoreButton>
            ),
          }}
          onChange={e => setPath(e.target.value)}
          disabled={loading}
          autoFocus
          required
          fullWidth
        />
      </ModalContent>
      <ActionButtonGroups>
        <DialogButton onClick={handleClose} disabled={loading}>
          Cancel
        </DialogButton>
        <DialogButton
          onClick={handleSubmit}
          disabled={!path || nameError || loading}
        >
          {loading ? 'loading...' : 'Add'}
        </DialogButton>
      </ActionButtonGroups>
    </Dialog>
  );
}

export default DirectoryModal;
