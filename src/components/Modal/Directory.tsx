import { buildDirectory, getDirectory, notify } from '@/lib/os';
import { insertFunction } from '@/lib/queries';
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

  const [folder, setFolder] = useState<IFolder>({
    path: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleDirectory() {
    const dir = await getDirectory();
    const name = dir.split('\\').pop().split('/').pop();
    setFolder({ ...folder, name, path: dir });
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      const info = await buildDirectory(folder);
      await insertFunction(mutate, folder, info);
      await handleClose();
      await router.reload();
    } catch (e) {
      await notify(`Import Folders Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFolder({
      path: '',
      name: '',
    });
  }

  async function handleClose() {
    reset();
    close();
  }

  async function onClose() {
    if (!loading) {
      close();
    }
  }

  const nameError = folderList?.map(o => o.name).includes(folder.name);

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
          value={folder.name}
          onChange={e => setFolder({ ...folder, name: e.target.value })}
          error={nameError || !folder.name}
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
          value={folder.path}
          InputProps={{
            endAdornment: (
              <MoreButton onClick={handleDirectory}>
                <MoreHorizIcon />
              </MoreButton>
            ),
          }}
          onChange={e => setFolder({ ...folder, path: e.target.value })}
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
          disabled={!folder.path || nameError || loading}
        >
          {loading ? 'loading...' : 'Add'}
        </DialogButton>
      </ActionButtonGroups>
    </Dialog>
  );
}

export default DirectoryModal;
