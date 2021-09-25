import {
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Layout from '../components/Layout';
import { updateSetting } from '../lib/store';
import { IFolder, IReduxState } from '../type';
import { setSetting } from '../utils/store';

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

const FolderList = dynamic(() => import('../components/SettingFolderList'), {
  ssr: false,
});

function Setting(): JSX.Element {
  const dispatch = useDispatch();
  const { setting, folders } = useSelector((state: IReduxState) => state);

  const [folderData, setFolderData] = useState<IFolder[]>(folders);

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

  return (
    <Layout disableSearch>
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
                checked={setting.showSidePanelName}
                color="primary"
                onChange={handleCheckBox}
              />
            }
            label="Show Slide Panel Button Name."
            labelPlacement="end"
          />
          <SettingTitle variant="body1">Imported Folders</SettingTitle>
          <FolderList folderData={folderData} dispatch={dispatch} />
        </SettingForm>
      </Container>
    </Layout>
  );
}

export default Setting;
