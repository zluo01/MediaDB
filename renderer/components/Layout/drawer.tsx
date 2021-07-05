import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
} from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import FolderIcon from '@material-ui/icons/Folder';
import SettingsIcon from '@material-ui/icons/Settings';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Dispatch } from 'redux';

import { updateFolder } from '../../lib/store';
import { IFolder, IFolderAction } from '../../type';

const FunctionList = styled(List)(() => ({
  width: '100%',
  bottom: 0,
  position: 'absolute',
  overflow: 'hidden',
}));

const Panel = styled(Drawer)(({ theme }) => ({
  flexShrink: 0,
  [`& .MuiDrawer-paper`]: {
    boxSizing: 'border-box',
    backgroundColor: theme.palette.secondary.main,
  },
}));

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
      <Panel
        variant="permanent"
        sx={{
          width: showPanelName ? 240 : 60,
          [`& .MuiDrawer-paper`]: {
            width: showPanelName ? 240 : 60,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'hidden' }}>
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
          <FunctionList>
            <Divider />
            <ListItem button onClick={handleOpen}>
              <ListItemIcon>
                <AddIcon sx={{ fill: '#6f7a83' }} />
              </ListItemIcon>
              {showPanelName && <ListItemText primary={'Add Video'} />}
            </ListItem>
            <ListItem button onClick={() => router.push('/setting')}>
              <ListItemIcon>
                <SettingsIcon sx={{ fill: '#6f7a83' }} />
              </ListItemIcon>
              {showPanelName && <ListItemText primary={'Setting'} />}
            </ListItem>
          </FunctionList>
        </Box>
      </Panel>
      <DirectoryModal
        open={openModal}
        close={handleClose}
        folders={folders}
        updateFolder={handleUpdateFolder}
      />
    </>
  );
}

export default SidePanel;
