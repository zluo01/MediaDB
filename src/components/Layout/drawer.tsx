import { useGetFolderListQuery, useGetSettingQuery } from '@/lib/queries';
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

  const { data: setting } = useGetSettingQuery();
  const { data: folderList } = useGetFolderListQuery();

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
          width: setting?.showSidePanel ? 240 : 60,
          [`& .MuiDrawer-paper`]: {
            width: setting?.showSidePanel ? 240 : 60,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'hidden' }} component={'div'}>
          <List>
            {folderList?.map(folder => {
              const isCurr = folder.position === currFolderIndex;
              return (
                <Tooltip key={folder.position} title={folder.name}>
                  <ListItemButton
                    disabled={isCurr}
                    onClick={() => router.push(`/?id=${folder.position}`)}
                  >
                    <ListItemIcon>
                      <FolderIcon
                        style={{
                          fill: isCurr ? '#21e18c' : '#6f7a83',
                        }}
                      />
                    </ListItemIcon>
                    {setting?.showSidePanel && (
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
              {setting?.showSidePanel && <ListItemText primary={'Add Video'} />}
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
              {setting?.showSidePanel && <ListItemText primary={'Setting'} />}
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
