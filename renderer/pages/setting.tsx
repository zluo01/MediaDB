import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import FolderIcon from '@material-ui/icons/Folder';
import { useRouter } from 'next/router';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Layout from '../components/Layout';
import { updateFolder, updateSetting } from '../lib/store';
import { removeFolder, setSetting } from '../store';
import {
  IFolder,
  IFolderAction,
  IReduxState,
  ISetting,
  ISettingAction,
} from '../type';

interface ISettingProps {
  folders: IFolder[];
  setting: ISetting;
  dispatch: Dispatch<IFolderAction | ISettingAction>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    formControl: {
      width: 'inherit',
      margin: theme.spacing(3),
    },
    divider: {
      backgroundColor: theme.palette.text.secondary,
      marginTop: 6,
      marginBottom: 6,
    },
    text: {
      color: theme.palette.text.secondary,
      marginTop: 6,
      marginBottom: 6,
    },
    button: {
      marginTop: 6,
      alignSelf: 'flex-end',
      width: 120,
      color: theme.palette.text.primary,
      borderColor: theme.palette.action.selected,

      '&:hover': {
        backgroundColor: theme.palette.action.selected,
        borderColor: theme.palette.action.selected,
      },
    },
  })
);

// Todo handle exclude directory change
function Setting({ dispatch, folders, setting }: ISettingProps) {
  const classes = useStyles();

  const router = useRouter();

  function handleCheckBox(event: React.ChangeEvent<HTMLInputElement>) {
    setSetting({
      ...setting,
      showSidePanelName: event.target.checked,
    })
      .then(s => updateSetting(dispatch, s))
      .catch(err => console.error(err));
  }

  function handleRemove(name: string) {
    removeFolder(name)
      .then(data => updateFolder(dispatch, data))
      .catch(err => console.error(err));
  }

  return (
    <Layout disableSearch>
      <Container maxWidth={'md'} fixed>
        <FormControl className={classes.formControl}>
          <Typography variant="h3" component="h2">
            Setting
          </Typography>
          <Divider className={classes.divider} />
          <FormControlLabel
            value="end"
            control={
              <Checkbox
                checked={setting.showSidePanelName}
                color="primary"
                onChange={handleCheckBox}
              />
            }
            label="Show Slide Panel Button Name."
            labelPlacement="end"
          />
          <Typography variant="body1" className={classes.text}>
            Imported Folders
          </Typography>
          <List>
            {folders.map(folder => (
              <ListItem key={folder.name}>
                <ListItemIcon>
                  <FolderIcon />
                </ListItemIcon>
                <ListItemText primary={folder.name} secondary={folder.dir} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemove(folder.name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Typography variant="body1" className={classes.text}>
            Exclude Directory
          </Typography>
          <TextareaAutosize
            rowsMax={12}
            rowsMin={6}
            value={setting.skippingDirectory}
            placeholder={'Separate directory with comma.'}
          />
          <Button
            className={classes.button}
            variant={'outlined'}
            onClick={() => router.push('/home')}
            color={'primary'}
          >
            Save
          </Button>
        </FormControl>
      </Container>
    </Layout>
  );
}

const mapStateToProps = (state: IReduxState) => ({
  setting: state.setting,
  folders: state.folders,
});

export default connect(mapStateToProps)(Setting);
