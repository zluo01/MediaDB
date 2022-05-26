import { Dialog, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useAppDispatch } from '../../lib/source';
import { notify } from '../../lib/source/actions';
import { getFolder, updateFolderName } from '../../lib/store';
import { IFolder } from '../../type';
import {
  ActionButtonGroups,
  ModalContent,
  DialogButton,
  ModalTitle,
} from './styles';

interface IFolderNameEdit {
  open: boolean;
  close: () => void;
  folderIndex: number;
  updateFolder: (folders: IFolder[]) => void;
}

function FolderNameEdit({
  open,
  close,
  folderIndex,
  updateFolder,
}: IFolderNameEdit): JSX.Element {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folderIndex >= 0) {
      setName(getFolder(folderIndex).name);
    }
  }, [folderIndex]);

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      const folders = updateFolderName(folderIndex, name);
      updateFolder(folders);
      setLoading(false);
      setName('');
      close();
    } catch (e) {
      notify(dispatch, true, `Edit Folder Name Error: ${e}`);
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
          value={name}
          onChange={e => setName(e.target.value)}
          error={!name}
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

export default FolderNameEdit;
