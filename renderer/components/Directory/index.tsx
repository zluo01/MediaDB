import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import React, { useState } from 'react';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { getDirectory } from '../../utils/electron';
import { IFolder } from '../../type';
import { addFolder } from '../../store';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { buildDirectory } from '../../utils/parser';
import path from 'path';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.secondary.main,
    },
    title: {
      textColor: theme.palette.text.primary,
      backgroundColor: theme.palette.primary.main,
    },
  })
);

interface IDirectoryModal {
  open: boolean;
  close: () => void;
  folders: IFolder[];
  updateFolder: (folders: IFolder[]) => void;
}

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

  const classes = useStyles();

  async function handleDirectory() {
    const dir = await getDirectory();
    const subDir = dir.split(path.sep);
    setValue({ ...value, name: subDir[subDir.length - 1], dir: dir });
  }

  function handleSubmit() {
    buildDirectory(value.dir)
      .then(data => updateFolder(addFolder(value, data)))
      .then(() => setValue({ name: '', dir: '' }))
      .then(() => close())
      .catch(error => console.error(error));
  }

  const nameError = folders.map(o => o.name).includes(value.name);

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={close}
      fullWidth={true}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle className={classes.title} id="alert-dialog-slide-title">
        Add Directory
      </DialogTitle>
      <DialogContent className={classes.root}>
        <TextField
          id="dir"
          label="Directory"
          value={value.dir}
          InputProps={{
            endAdornment: (
              <Button onClick={handleDirectory}>
                <MoreHorizIcon />
              </Button>
            ),
          }}
          onChange={e => setValue({ ...value, dir: e.target.value })}
          required
          fullWidth
        />
        <TextField
          id="name"
          label="Name"
          type="text"
          disabled={!value.name}
          value={value.name}
          onChange={e => setValue({ ...value, name: e.target.value })}
          error={nameError}
          helperText={nameError && 'Name Already Exists'}
          required
          fullWidth
        />
      </DialogContent>
      <DialogActions className={classes.root}>
        <Button onClick={close}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!value.dir}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DirectoryModal;
