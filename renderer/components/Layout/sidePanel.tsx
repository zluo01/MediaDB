import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import FolderIcon from '@material-ui/icons/Folder';
import SettingsIcon from '@material-ui/icons/Settings';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { updateFolder } from '../../lib/store';
import { IFolder, IFolderAction, IReduxState, TProps } from '../../type';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: (props: TProps) => (props.show ? 240 : 60),
      flexShrink: 0,
    },
    drawerPaper: {
      width: (props: TProps) => (props.show ? 240 : 60),
      backgroundColor: theme.palette.secondary.main,
    },
    drawerContainer: {
      overflow: 'hidden',
    },
    functionList: {
      width: '100%',
      bottom: 0,
      position: 'absolute',
      overflow: 'hidden',
    },
    icon: {
      fill: '#6f7a83',
    },
  })
);

const DirectoryModal = dynamic(() => import('../Directory'), { ssr: false });

interface ISidePanel {
  folders: IFolder[];
  showPanelName: boolean;
  currFolderIndex?: number;
  dispatch: Dispatch<IFolderAction>;
}

function SidePanel({
  folders,
  showPanelName,
  currFolderIndex,
  dispatch,
}: ISidePanel): JSX.Element {
  const router = useRouter();

  const classes = useStyles({ show: showPanelName });

  const [openModal, setOpenModal] = useState(false);

  function handleOpen() {
    setOpenModal(true);
  }

  function handleClose() {
    setOpenModal(false);
  }

  function handleUpdateFolder(folders: IFolder[]) {
    updateFolder(dispatch, folders);
  }

  return (
    <>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar />
        <div className={classes.drawerContainer}>
          <List>
            {folders.map((folder, index) => {
              const isCurr = index === currFolderIndex;
              return (
                <Tooltip key={index} title={folder.name}>
                  <ListItem
                    button
                    disabled={isCurr}
                    onClick={() => router.push(`/folder/${index}`)}
                  >
                    <ListItemIcon>
                      <FolderIcon
                        style={{
                          fill: isCurr ? '#21e18c' : '#6f7a83',
                        }}
                      />
                    </ListItemIcon>
                    {showPanelName && <ListItemText primary={folder.name} />}
                  </ListItem>
                </Tooltip>
              );
            })}
          </List>
          <List className={classes.functionList}>
            <Divider />
            <ListItem button onClick={handleOpen}>
              <ListItemIcon>
                <AddIcon className={classes.icon} />
              </ListItemIcon>
              {showPanelName && <ListItemText primary={'Add Video'} />}
            </ListItem>
            <ListItem button onClick={() => router.push('/setting')}>
              <ListItemIcon>
                <SettingsIcon className={classes.icon} />
              </ListItemIcon>
              {showPanelName && <ListItemText primary={'Setting'} />}
            </ListItem>
          </List>
        </div>
      </Drawer>
      <DirectoryModal
        open={openModal}
        close={handleClose}
        folders={folders}
        updateFolder={handleUpdateFolder}
      />
    </>
  );
}

const mapStateToProps = (state: IReduxState) => ({
  showPanelName: state.setting.showSidePanelName,
  folders: state.folders,
});

export default connect(mapStateToProps)(SidePanel);
