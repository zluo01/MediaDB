import { Loading } from '@/components/Content/styles';
import Layout from '@/components/Layout';
import FolderList from '@/components/Setting/FolderList';
import SkipFolderList from '@/components/Setting/SkipFolderList';
import { notify } from '@/lib/os';
import {
  useGetSettingQuery,
  useGetVersionQuery,
  useHidePanelTrigger,
} from '@/lib/queries';
import { useAppDispatch } from '@/lib/source';
import { openDirectoryModal } from '@/lib/source/slice/directoryModalSlice';
import { openSkipFolderModal } from '@/lib/source/slice/skipFolderModalSlice';
import { Add } from '@mui/icons-material';
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
import React, { ReactElement } from 'react';

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

const Version = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const SkipFolderModal = dynamic(() => import('@/components/Modal/SkipFolder'), {
  ssr: false,
});

function Setting(): ReactElement {
  const dispatch = useAppDispatch();

  const { trigger } = useHidePanelTrigger();
  const { data: setting } = useGetSettingQuery();
  const { data: version } = useGetVersionQuery();

  function handleOpen() {
    dispatch(openSkipFolderModal());
  }

  function handleOpenDirectoryModal() {
    dispatch(openDirectoryModal());
  }

  async function handleCheckBox(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      await trigger(event.target.checked);
    } catch (e) {
      await notify(`Check Box Error: ${e}`);
    }
  }

  function Content(): ReactElement {
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ pr: 2 }}
        >
          <SettingTitle variant="body1">Imported Folders</SettingTitle>
          <IconButton
            size={'large'}
            edge="end"
            aria-label="add"
            onClick={handleOpenDirectoryModal}
          >
            <Add />
          </IconButton>
        </Stack>
        <FolderList />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ pr: 2 }}
        >
          <SettingTitle variant="body1">Skipped Folders</SettingTitle>
          <IconButton
            size={'large'}
            edge="end"
            aria-label="add"
            onClick={handleOpen}
          >
            <Add />
          </IconButton>
        </Stack>
        <SkipFolderList skipFolders={setting.skipFolders} />
        <SkipFolderModal skipFolders={setting.skipFolders} />
        <SettingDivider />
        <Version
          variant={'body2'}
          display={'block'}
          align={'right'}
          gutterBottom
        >
          {`v${version}`}
        </Version>
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
