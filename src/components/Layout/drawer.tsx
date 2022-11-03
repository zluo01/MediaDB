import { FOLDER_LIST, getFolderList, getSetting, SETTING } from '@/lib/storage';
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
import useSWR from 'swr';

const DirectoryModal = dynamic(() => import('@/components/Modal/Directory'), {
  ssr: false,
});

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

interface ISidePanel {
  currFolderIndex?: number;
}

function SidePanel({ currFolderIndex }: ISidePanel): JSX.Element {
  const router = useRouter();

  const isSettingPage = router.asPath === '/setting';

  const { data: setting } = useSWR(SETTING, getSetting);
  const { data: folderList } = useSWR(FOLDER_LIST, getFolderList);

  const [openModal, setOpenModal] = useState(false);

  function handleOpen() {
    setOpenModal(true);
  }

  function handleClose() {
    setOpenModal(false);
  }

  return (
    <>
      <Panel
        variant="permanent"
        sx={{
          width: setting?.showSidePanelName ? 240 : 60,
          [`& .MuiDrawer-paper`]: {
            width: setting?.showSidePanelName ? 240 : 60,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'hidden' }} component={'div'}>
          <List>
            {folderList?.map((folder, index) => {
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
                    {setting?.showSidePanelName && (
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
              {setting?.showSidePanelName && (
                <ListItemText primary={'Add Video'} />
              )}
            </ListItemButton>
            <ListItemButton
              onClick={() => router.push(`/setting`)}
              disabled={isSettingPage}
            >
              <ListItemIcon>
                <SettingsIcon
                  style={{
                    fill: isSettingPage ? '#21e18c' : '#6f7a83',
                  }}
                />
              </ListItemIcon>
              {setting?.showSidePanelName && (
                <ListItemText primary={'Setting'} />
              )}
            </ListItemButton>
          </FunctionList>
        </Box>
      </Panel>
      <DirectoryModal
        open={openModal}
        close={handleClose}
        folderList={folderList}
      />
    </>
  );
}

export default SidePanel;
