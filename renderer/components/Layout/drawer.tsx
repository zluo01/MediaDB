import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../lib/source';
import { updateFolder } from '../../lib/source/actions';
import { IFolder, IState } from '../../type';

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

const DirectoryModal = dynamic(() => import('../modals/getDirectory'), {
  ssr: false,
});

interface ISidePanel {
  currFolderIndex?: number;
}

function SidePanel({ currFolderIndex }: ISidePanel): JSX.Element {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { folders, setting } = useAppSelector((state: IState) => state);

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
          width: setting.showSidePanelName ? 240 : 60,
          [`& .MuiDrawer-paper`]: {
            width: setting.showSidePanelName ? 240 : 60,
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
                  <ListItemButton
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
                    {setting.showSidePanelName && (
                      <ListItemText primary={folder.name} />
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
          <FunctionList>
            <Divider />
            <ListItemButton onClick={handleOpen}>
              <ListItemIcon>
                <AddIcon sx={{ fill: '#6f7a83' }} />
              </ListItemIcon>
              {setting.showSidePanelName && (
                <ListItemText primary={'Add Video'} />
              )}
            </ListItemButton>
            <ListItemButton onClick={() => router.push('/setting')}>
              <ListItemIcon>
                <SettingsIcon sx={{ fill: '#6f7a83' }} />
              </ListItemIcon>
              {setting.showSidePanelName && (
                <ListItemText primary={'Setting'} />
              )}
            </ListItemButton>
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
