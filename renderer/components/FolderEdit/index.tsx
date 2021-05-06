import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';

import { getFolder, updateFolderName } from '../../store';
import { IFolder } from '../../type';

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
  const classes = useStyles();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folderIndex >= 0) {
      setName(getFolder(folderIndex).name);
    }
  }, [folderIndex]);

  function handleSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setLoading(true);
    updateFolderName(folderIndex, name)
      .then(folders => updateFolder(folders))
      .then(() => setLoading(false))
      .then(() => setName(''))
      .then(() => close())
      .catch(err => console.error(err));
  }

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
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          error={!name}
          required
          fullWidth
        />
      </DialogContent>
      <DialogActions className={classes.root}>
        <Button onClick={close} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'loading...' : 'Change'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FolderNameEdit;
