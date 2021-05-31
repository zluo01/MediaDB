import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import InputBase from '@material-ui/core/InputBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import {
  createStyles,
  fade,
  makeStyles,
  Theme,
} from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import FolderIcon from '@material-ui/icons/Folder';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactNode, useState } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { updateFolder } from '../../lib/store';
import { IFolder, IFolderAction, IReduxState } from '../../type';

type TProps = {
  show: boolean;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      backgroundColor: theme.palette.primary.main,
    },
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
    content: {
      flexGrow: 1,
      padding: theme.spacing(5),
    },
    grow: {
      flexGrow: 1,
      zIndex: theme.zIndex.drawer + 1,
    },
    title: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
    },
    search: {
      right: 20,
      position: 'absolute',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(2),
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#21e18c',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      color: theme.palette.text.primary,
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '20ch',
      },
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

type ILayoutProps = {
  children?: ReactNode;
  currFolderIndex?: number;
  folders: IFolder[];
  showPanelName: boolean;
  disableSearch?: boolean;
  updateSearch?: (text: string) => void;
  dispatch: Dispatch<IFolderAction>;
};

const DirectoryModal = dynamic(() => import('../Directory'), { ssr: false });

function Layout({
  children,
  currFolderIndex,
  folders,
  showPanelName,
  disableSearch,
  updateSearch,
  dispatch,
}: ILayoutProps): JSX.Element {
  const classes = useStyles({ show: showPanelName });

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

  function handleSearch(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (updateSearch) {
      updateSearch(e.target.value);
    }
  }

  return (
    <>
      <Head>
        <meta
          charSet="utf-8"
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="referrer" content="never" />
        <meta name="referrer" content="no-referrer" />
        <title>Media DB</title>
      </Head>
      <main>
        <div className={classes.root}>
          <AppBar position="fixed" className={classes.appBar}>
            <Toolbar>
              <Typography
                variant="h6"
                noWrap
                onClick={() => router.push('/home')}
              >
                MediaDB
              </Typography>
              <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <InputBase
                  placeholder="Search…"
                  classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                  }}
                  inputProps={{ 'aria-label': 'search' }}
                  onChange={e => handleSearch(e)}
                  disabled={disableSearch}
                />
              </div>
              <div className={classes.grow} />
            </Toolbar>
          </AppBar>
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
                        {showPanelName && (
                          <ListItemText primary={folder.name} />
                        )}
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
          <div className={classes.content}>
            <Toolbar id="back-to-top-anchor" />
            {children}
          </div>
        </div>
        <DirectoryModal
          open={openModal}
          close={handleClose}
          folders={folders}
          updateFolder={handleUpdateFolder}
        />
      </main>
    </>
  );
}

const mapStateToProps = (state: IReduxState) => ({
  showPanelName: state.setting.showSidePanelName,
  folders: state.folders,
});

export default connect(mapStateToProps)(Layout);
