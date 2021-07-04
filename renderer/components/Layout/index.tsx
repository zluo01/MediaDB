import { AppBar, InputBase, Toolbar, Typography } from '@material-ui/core';
import {
  createStyles,
  fade,
  makeStyles,
  Theme,
} from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      backgroundColor: theme.palette.primary.main,
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
  })
);

const SidePanel = dynamic(() => import('./sidePanel'), { ssr: false });

type ILayoutProps = {
  children?: ReactNode;
  currFolderIndex?: number;
  disableSearch?: boolean;
  updateSearch?: (text: string) => void;
};

function Layout({
  children,
  currFolderIndex,
  disableSearch,
  updateSearch,
}: ILayoutProps): JSX.Element {
  const classes = useStyles();

  const router = useRouter();

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
                style={{ cursor: 'pointer' }}
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
          <SidePanel currFolderIndex={currFolderIndex} />
          <div className={classes.content}>
            <Toolbar id="back-to-top-anchor" />
            {children}
          </div>
        </div>
      </main>
    </>
  );
}

export default Layout;
