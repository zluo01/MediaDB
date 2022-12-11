import { Loading } from '@/components/Content/styles';
import Layout from '@/components/Layout';
import FolderList from '@/components/Setting/FolderList';
import SkipFolderList from '@/components/Setting/SkipFolderList';
import { notify } from '@/lib/os';
import { useGetSettingQuery, useHidePanelTrigger } from '@/lib/queries';
import AddIcon from '@mui/icons-material/Add';
import {
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

const SettingDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: theme.palette.text.secondary,
  marginTop: 6,
  marginBottom: 6,
}));

const SettingTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: 6,
  marginBottom: 6,
}));

const SkipFolderModal = dynamic(() => import('@/components/Modal/SkipFolder'), {
  ssr: false,
});

function Setting(): JSX.Element {
  const { trigger } = useHidePanelTrigger();
  const { data: setting } = useGetSettingQuery();

  const [openModal, setOpenModal] = useState(false);

  function handleOpen() {
    setOpenModal(true);
  }

  function handleClose() {
    setOpenModal(false);
  }

  async function handleCheckBox(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      await trigger(event.target.checked);
    } catch (e) {
      await notify(`Check Box Error: ${e}`);
    }
  }

  function Content(): JSX.Element {
    if (!setting) {
      return <Loading />;
    }
    return (
      <Container maxWidth={'md'} fixed>
        <Typography variant="h3" component="h2">
          Setting
        </Typography>
        <SettingDivider />
        <FormControlLabel
          value="end"
          control={
            <Checkbox
              checked={setting.showSidePanel}
              color="primary"
              onChange={handleCheckBox}
            />
          }
          label="Show Slide Panel Button Name."
          labelPlacement="end"
        />
        <SettingTitle variant="body1">Imported Folders</SettingTitle>
        <FolderList />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SettingTitle variant="body1">Skipped Folders</SettingTitle>
          <IconButton
            size={'large'}
            edge="end"
            aria-label="add"
            onClick={handleOpen}
          >
            <AddIcon />
          </IconButton>
        </Stack>
        <SkipFolderList skipFolders={setting.skipFolders} />
        <SkipFolderModal
          open={openModal}
          close={handleClose}
          skipFolders={setting.skipFolders}
        />
      </Container>
    );
  }

  return (
    <Layout disableSearch>
      <Content />
    </Layout>
  );
}

export default Setting;
