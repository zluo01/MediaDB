import { getDirectory, notify } from '@/lib/os';
import { updateFolderPath, useGetFolderQuery } from '@/lib/queries';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Dialog, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';

import {
  ActionButtonGroups,
  DialogButton,
  ModalContent,
  ModalTitle,
  MoreButton,
} from './styles';

interface IFolderNameEdit {
  open: boolean;
  close: () => void;
  index: number;
}

function FolderEditModal({ open, close, index }: IFolderNameEdit): JSX.Element {
  const { mutate } = useSWRConfig();
  const { data: folder } = useGetFolderQuery(index);

  const [path, setPath] = useState(folder?.path || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPath(folder?.path);
  }, [folder?.path]);

  async function handleDirectory() {
    setPath(await getDirectory());
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateFolderPath(mutate, index, path);
      setLoading(false);
      setPath('');
      close();
    } catch (e) {
      await notify(`Edit Folder Name Error: ${e}`);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth={true}
      aria-labelledby="form-dialog-title"
    >
      <ModalTitle>Change Name</ModalTitle>
      <ModalContent>
        <TextField
          id="name"
          label="Name"
          type="text"
          margin="normal"
          variant="standard"
          value={folder?.name || ''}
          fullWidth
          disabled
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
        <DialogButton onClick={close} disabled={loading}>
          Cancel
        </DialogButton>
        <DialogButton onClick={handleSubmit} disabled={loading}>
          {loading ? 'loading...' : 'Change'}
        </DialogButton>
      </ActionButtonGroups>
    </Dialog>
  );
}

export default FolderEditModal;
