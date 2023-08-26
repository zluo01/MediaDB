import { notify } from '@/lib/os';
import { useUpdateSkipFoldersTrigger } from '@/lib/queries';
import { useAppDispatch, useAppSelector } from '@/lib/source';
import {
  closeSkipFolderModal,
  updateSkipFolderName,
} from '@/lib/source/slice/skipFolderModalSlice';
import { RootState } from '@/lib/source/store';
import { Dialog, TextField } from '@mui/material';
import React, { ReactElement, useState } from 'react';

import {
  ActionButtonGroups,
  DialogButton,
  ModalContent,
  ModalTitle,
} from './styles';

interface ISkipFolderModal {
  skipFolders: string[];
}

function SkipFolderModal({ skipFolders }: ISkipFolderModal): ReactElement {
  const { trigger } = useUpdateSkipFoldersTrigger();

  const dispatch = useAppDispatch();
  const { name, open } = useAppSelector(
    (state: RootState) => state.skipFolderModal,
  );

  const [loading, setLoading] = useState(false);

  function close() {
    dispatch(closeSkipFolderModal());
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      await trigger([...skipFolders, name].join(','));
      setLoading(false);
      close();
    } catch (e) {
      await notify(`Edit Folder Name Error: ${e}`);
    }
  }

  const nameError = skipFolders.includes(name);

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
          value={name}
          onChange={e => dispatch(updateSkipFolderName(e.target.value))}
          disabled={loading}
          error={nameError || !name}
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
