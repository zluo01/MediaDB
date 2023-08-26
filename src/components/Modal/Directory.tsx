import { getDirectory, notify } from '@/lib/os';
import { useCreateLibraryTrigger } from '@/lib/queries';
import { useAppDispatch, useAppSelector } from '@/lib/source';
import {
  closeDirectoryModal,
  updateDirectoryData,
  updateName,
  updatePath,
} from '@/lib/source/slice/directoryModalSlice';
import { RootState } from '@/lib/source/store';
import { IFolder } from '@/type';
import { MoreHoriz } from '@mui/icons-material';
import { Dialog, TextField } from '@mui/material';
import React, { ReactElement, useState } from 'react';

import {
  ActionButtonGroups,
  DialogButton,
  ModalContent,
  ModalTitle,
  MoreButton,
} from './styles';

interface IDirectoryModal {
  folderList: IFolder[];
}

function DirectoryModal({ folderList }: IDirectoryModal): ReactElement {
  const dispatch = useAppDispatch();

  const { name, path, open } = useAppSelector(
    (state: RootState) => state.directoryModal,
  );

  const { trigger: createLibraryTrigger } = useCreateLibraryTrigger(
    folderList?.length,
  );

  const [loading, setLoading] = useState(false);

  async function handleDirectory() {
    const path = await getDirectory();
    const name = path.split('\\').pop().split('/').pop();
    dispatch(
      updateDirectoryData({
        name,
        path,
      }),
    );
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      await createLibraryTrigger({
        folder: { position: 0, name, path },
      });
      setLoading(false);
      close();
    } catch (e) {
      await notify(`Import Folders Error: ${e}`);
    }
  }

  function close() {
    dispatch(closeDirectoryModal());
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
          onChange={e => dispatch(updateName(e.target.value))}
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
                <MoreHoriz />
              </MoreButton>
            ),
          }}
          onChange={e => dispatch(updatePath(e.target.value))}
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
