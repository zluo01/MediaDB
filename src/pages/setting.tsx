import { Loading } from '@/components/Content/styles';
import Layout from '@/components/Layout';
import FolderList from '@/components/Setting/FolderList';
import { notify } from '@/lib/os';
import { getSetting, SETTING, updateSetting } from '@/lib/storage';
import {
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import useSWR, { useSWRConfig } from 'swr';

const SettingForm = styled(FormControl)(({ theme }) => ({
  width: 'inherit',
  margin: theme.spacing(3),
}));

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

function Setting(): JSX.Element {
  const { mutate } = useSWRConfig();
  const { data } = useSWR(SETTING, getSetting);

  async function handleCheckBox(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const setting = {
        ...data,
        showSidePanelName: event.target.checked,
      };
      await updateSetting(setting, mutate);
    } catch (e) {
      await notify(`Check Box Error: ${e}`);
    }
  }

  function Content(): JSX.Element {
    if (!data) {
      return <Loading />;
    }
    return (
      <Container maxWidth={'md'} fixed>
        <SettingForm>
          <Typography variant="h3" component="h2">
            Setting
          </Typography>
          <SettingDivider />
          <FormControlLabel
            value="end"
            control={
              <Checkbox
                checked={data.showSidePanelName}
                color="primary"
                onChange={handleCheckBox}
              />
            }
            label="Show Slide Panel Button Name."
            labelPlacement="end"
          />
          <SettingTitle variant="body1">Imported Folders</SettingTitle>
          <FolderList />
        </SettingForm>
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
