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
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import FolderIcon from '@material-ui/icons/Folder';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Layout from '../components/Layout';
import { updateFolder, updateSetting } from '../lib/store';
import { removeFolder, setSetting, updateFolders } from '../store';
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
  currFolderIndex: number;
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

const EditFolder = dynamic(() => import('../components/FolderEdit'), {
  ssr: false,
});

function reorder(list: IFolder[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

function Setting({ dispatch, folders, setting }: ISettingProps) {
  const classes = useStyles();

  const [folderData, setFolderData] = useState<IFolder[]>(folders);
  const [folderIndex, setFolderIndex] = useState(-1);

  useEffect(() => {
    if (JSON.stringify(folders) !== JSON.stringify(folderData)) {
      setFolderData(folders);
    }
  }, [folders]);

  async function handleCheckBox(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const s = await setSetting({
        ...setting,
        showSidePanelName: event.target.checked,
      });
      updateSetting(dispatch, s);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRemove(name: string) {
    try {
      const data = await removeFolder(name);
      updateFolder(dispatch, data);
    } catch (e) {
      console.error(e);
    }
  }

  function handleUpdateFolder(folders: IFolder[]) {
    updateFolder(dispatch, folders);
  }

  async function onDragEnd(result: DropResult) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const src = result.source.index;
    const dst = result.destination.index;

    if (result.source.index !== result.destination.index) {
      try {
        const result = reorder(folderData, src, dst);
        await updateFolders(result);
        updateFolder(dispatch, result);
      } catch (e) {
        console.error(e);
      }
    }
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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {provided => (
                <List ref={provided.innerRef} {...provided.droppableProps}>
                  {folderData.map((folder, index) => (
                    <Draggable
                      key={folder.name}
                      draggableId={folder.name}
                      index={index}
                    >
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ ...provided.draggableProps.style }}
                        >
                          <ListItem>
                            <ListItemIcon>
                              <FolderIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={folder.name}
                              secondary={folder.dir}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                aria-label="edit"
                                onClick={() => setFolderIndex(index)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleRemove(folder.name)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </FormControl>
      </Container>
      <EditFolder
        open={folderIndex >= 0}
        close={() => setFolderIndex(-1)}
        folderIndex={folderIndex}
        updateFolder={handleUpdateFolder}
      />
    </Layout>
  );
}

const mapStateToProps = (state: IReduxState) => ({
  setting: state.setting,
  folders: state.folders,
});

export default connect(mapStateToProps)(Setting);
