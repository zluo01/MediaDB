import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import {
  AppBar,
  Box,
  IconButton,
  InputAdornment,
  InputBase,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';

// import { useAppDispatch, useAppSelector } from '../../lib/source';
// import { search } from '../../lib/source/actions';
import { IState } from '../../type';
import Drawer from './drawer';

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

const Root = styled(Box)(() => ({
  display: 'flex',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(5),
}));

// const Drawer = dynamic(() => import('./drawer'), { ssr: false });
// const Error = dynamic(() => import('../Notification'), { ssr: false });

type ILayoutProps = {
  children?: ReactNode;
  currFolderIndex?: number;
  disableSearch?: boolean;
};

function Layout({
  children,
  currFolderIndex,
  disableSearch,
}: ILayoutProps): JSX.Element {
  const router = useRouter();
  // const dispatch = useAppDispatch();
  // const searchContent = useAppSelector((state: IState) => state.search);

  function handleSearch(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    // search(dispatch, e.target.value);
  }

  function handleClearSearch() {
    // search(dispatch, '');
  }

  function handleMouseDownSearch(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  return (
    <Root>
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
              value={''}
              onChange={handleSearch}
              disabled={disableSearch}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClearSearch}
                    onMouseDown={handleMouseDownSearch}
                    disabled={!''}
                  >
                    <CancelIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </Search>
        </Toolbar>
      </StyledAppBar>
      <Drawer currFolderIndex={currFolderIndex} />
      <MainContent component="main">
        <Toolbar id="back-to-top-anchor" />
        {children}
      </MainContent>
      {/*<Error />*/}
    </Root>
  );
}

export default Layout;
