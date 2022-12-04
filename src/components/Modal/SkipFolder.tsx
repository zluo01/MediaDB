import { notify } from '@/lib/os';
import { updateSkipFolders } from '@/lib/queries';
import { Dialog, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useSWRConfig } from 'swr';

import {
  ActionButtonGroups,
  DialogButton,
  ModalContent,
  ModalTitle,
} from './styles';

interface ISkipFolderModal {
  open: boolean;
  close: () => void;
  skipFolders: string[];
}

function SkipFolderModal({
  open,
  close,
  skipFolders,
}: ISkipFolderModal): JSX.Element {
  const { mutate } = useSWRConfig();

  const [folder, setFolder] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSkipFolders(mutate, [...skipFolders, folder].join(','));
      setLoading(false);
      close();
    } catch (e) {
      await notify(`Edit Folder Name Error: ${e}`);
    }
  }

  const nameError = skipFolders.includes(folder);

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth={true}
      aria-labelledby="form-dialog-title"
    >
      <ModalTitle>Add Skip Folder</ModalTitle>
      <ModalContent>
        <TextField
          id="name"
          label="Name"
          type="text"
          margin="normal"
          variant="standard"
          value={folder}
          onChange={e => setFolder(e.target.value)}
          disabled={loading}
          error={nameError || !folder}
          helperText={nameError && 'Name Already Exists'}
          autoFocus
          fullWidth
          required
        />
      </ModalContent>
      <ActionButtonGroups>
        <DialogButton onClick={close} disabled={loading}>
          Cancel
        </DialogButton>
        <DialogButton onClick={handleSubmit} disabled={nameError || loading}>
          {loading ? 'loading...' : 'Add'}
        </DialogButton>
      </ActionButtonGroups>
    </Dialog>
  );
}

export default SkipFolderModal;
