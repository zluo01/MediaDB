import {
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Layout from '../components/Layout';
import { updateSetting } from '../lib/store';
import {
  IFolder,
  IFolderAction,
  IReduxState,
  ISetting,
  ISettingAction,
} from '../type';
import { setSetting } from '../utils/store';

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

const FolderList = dynamic(() => import('../components/SettingFolderList'), {
  ssr: false,
});

function Setting({ dispatch, folders, setting }: ISettingProps) {
  const classes = useStyles();

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
          <FolderList folderData={folderData} dispatch={dispatch} />
        </FormControl>
      </Container>
    </Layout>
  );
}

const mapStateToProps = (state: IReduxState) => ({
  setting: state.setting,
  folders: state.folders,
});

export default connect(mapStateToProps)(Setting);
