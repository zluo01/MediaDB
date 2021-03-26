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
  const [dir, setDir] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const classes = useStyles();

  async function handleDirectory() {
    const dir = await getDirectory();
    const subDir = dir.split(path.sep);
    setName(subDir[subDir.length - 1]);
    setDir(dir);
  }

  function handleSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setLoading(true);
    buildDirectory(dir)
      .then(data => updateFolder(addFolder({ name: name, dir: dir }, data)))
      .then(() => setLoading(false))
      .then(() => setDir(''))
      .then(() => setName(''))
      .finally(() => close())
      .catch(error => console.error(error));
  }

  const nameError = folders.map(o => o.name).includes(name);

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
          value={dir}
          InputProps={{
            endAdornment: (
              <Button onClick={handleDirectory}>
                <MoreHorizIcon />
              </Button>
            ),
          }}
          onChange={e => setDir(e.target.value)}
          required
          fullWidth
        />
        <TextField
          id="name"
          label="Name"
          type="text"
          disabled={!name}
          value={name}
          onChange={e => setName(e.target.value)}
          error={nameError}
          helperText={nameError && 'Name Already Exists'}
          required
          fullWidth
        />
      </DialogContent>
      <DialogActions className={classes.root}>
        <Button onClick={close}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!dir || loading}>
          {loading ? 'loading...' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DirectoryModal;
