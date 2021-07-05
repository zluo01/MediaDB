import { AppBar, Box, InputBase, Toolbar, Typography } from '@material-ui/core';
import { alpha, styled } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { IFolder, IFolderAction, IReduxState } from '../../type';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#21e18c',
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.primary.main,
}));

const Drawer = dynamic(() => import('./drawer'), { ssr: false });

type ILayoutProps = {
  children?: ReactNode;
  currFolderIndex?: number;
  disableSearch?: boolean;
  updateSearch?: (text: string) => void;
  showPanelName: boolean;
  folders: IFolder[];
  dispatch: Dispatch<IFolderAction>;
};

function Layout({
  children,
  currFolderIndex,
  disableSearch,
  updateSearch,
  showPanelName,
  folders,
  dispatch,
}: ILayoutProps): JSX.Element {
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
      <Box sx={{ display: 'flex' }}>
        <StyledAppBar position="fixed">
          <Toolbar>
            <Typography
              variant="h6"
              noWrap
              onClick={() => router.push('/home')}
              sx={{
                cursor: 'pointer',
                flexGrow: 1,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              MediaDB
            </Typography>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <SearchInput
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                onChange={e => handleSearch(e)}
                disabled={disableSearch}
              />
            </Search>
          </Toolbar>
        </StyledAppBar>
        <Drawer
          dispatch={dispatch}
          showPanelName={showPanelName}
          folders={folders}
          currFolderIndex={currFolderIndex}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 5,
          }}
        >
          <Toolbar id="back-to-top-anchor" />
          {children}
        </Box>
      </Box>
    </>
  );
}

const mapStateToProps = (state: IReduxState) => ({
  showPanelName: state.setting.showSidePanelName,
  folders: state.folders,
});

export default connect(mapStateToProps)(Layout);
