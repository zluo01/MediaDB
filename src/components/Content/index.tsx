import Footer from '@/components/Footer';
import { buildDirectory, notify, openFile } from '@/lib/os';
import { useAppSelector } from '@/lib/source';
import { RootState } from '@/lib/source/store';
import { updateFolderInfo } from '@/lib/storage';
import {
  DEFAULT,
  IFolderData,
  IMediaData,
  IMovieData,
  ISetting,
  MOVIE,
  SORT,
  TITLE_ASC,
  TITLE_DSC,
  YEAR_ASC,
  YEAR_DSC,
} from '@/type';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import {
  Backdrop,
  CircularProgress,
  ClickAwayListener,
  Container,
  Fab,
  Grow,
  MenuItem,
  MenuList,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import path from 'path';
import React, { useEffect, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';

import MediaGrid from './content';
import {
  ActionButton,
  Divider,
  RefreshButton,
  StyledPaper,
  StyledPopper,
} from './styles';

const FilterSection = dynamic(() => import('./filter'), {
  ssr: false,
});

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.action.hover,
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  backgroundColor: theme.palette.action.selected,
  color: theme.palette.action.hover,
}));

const StyledScroll = styled('div')(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(2),
}));

const SORT_TYPES = [DEFAULT, TITLE_ASC, TITLE_DSC, YEAR_ASC, YEAR_DSC];

interface IContentProps {
  setting: ISetting;
  folderData: IFolderData;
}

interface IScrollProps {
  children: React.ReactElement;
}

function ScrollTop(props: IScrollProps) {
  const { children } = props;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Zoom in={trigger}>
      <StyledScroll onClick={handleClick} role="presentation">
        {children}
      </StyledScroll>
    </Zoom>
  );
}

function Content({ setting, folderData }: IContentProps): JSX.Element {
  const anchorRef = useRef<HTMLButtonElement>(null);

  const { mutate } = useSWRConfig();

  const { tags, genres, actors, studios } = useAppSelector(
    (state: RootState) => state.filter
  );
  const search = useAppSelector((state: RootState) => state.control.search);

  const [current, setCurrent] = useState(-1);
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const data = filterData();

  useEffect(() => {
    const anchor = document.getElementById(`c${current}`);
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [current]);

  useEffect(() => {
    async function handleKeyPress(ev: KeyboardEvent) {
      switch (ev.key) {
        case 'ArrowLeft':
          setCurrent(prevState =>
            prevState - 1 < 0 ? data.length - 1 : prevState - 1
          );
          break;
        case 'ArrowRight':
          setCurrent(prevState => (prevState + 1) % data.length);
          break;
        case 'Enter':
          if (
            data[current].type === MOVIE
            // || data[currIndex].type === COMIC
          ) {
            const media = data[current] as IMovieData;
            const filePath = path.join(
              folderData.path,
              media.relativePath,
              media.file
            );
            await openFile(filePath);
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [current, data, folderData]);

  function handleToggle() {
    setOpen(prevOpen => !prevOpen);
  }

  function filterData(): IMediaData[] {
    let media = [...folderData.data];

    tags.forEach(t => {
      media = media.filter(o => o.tags.includes(t));
    });

    genres.forEach(g => {
      media = media.filter(o => o.genres.includes(g));
    });

    actors.forEach(a => {
      media = media.filter(o => o.actors.includes(a));
    });

    studios.forEach(a => {
      media = media.filter(o => o.studios.includes(a));
    });

    switch (folderData.sort) {
      case DEFAULT:
        break;
      case TITLE_ASC:
        media.sort((a: IMediaData, b: IMediaData) =>
          a.title > b.title ? 1 : -1
        );
        break;
      case TITLE_DSC:
        media.sort((a: IMediaData, b: IMediaData) =>
          a.title < b.title ? 1 : -1
        );
        break;
      case YEAR_DSC:
        if (media[0].type === MOVIE) {
          media.sort((a: IMediaData, b: IMediaData) =>
            (a as IMovieData).year < (b as IMovieData).year ? 1 : -1
          );
        }
        break;
      case YEAR_ASC:
        if (media[0].type === MOVIE) {
          media.sort((a: IMediaData, b: IMediaData) =>
            (a as IMovieData).year > (b as IMovieData).year ? 1 : -1
          );
        }
        break;
    }
    return media;
  }

  function handleClose(event: MouseEvent | TouchEvent) {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  }

  async function updateSortType(type: string) {
    await updateFolderInfo(
      folderData.name,
      {
        ...folderData,
        sort: type as SORT,
      },
      mutate
    );
    setOpen(false);
  }

  async function updateLibrary(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setRefresh(true);
    try {
      const info = await buildDirectory({ ...folderData });
      await updateFolderInfo(folderData.name, info, mutate);
    } catch (e) {
      await notify(`Update Library Error: ${e}`);
    } finally {
      setRefresh(false);
    }
  }

  if (refresh) {
    return (
      <Backdrop
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
        open={refresh}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  const disabled = search !== '';

  return (
    <Container maxWidth={false} disableGutters>
      <div
        style={{
          height: 60,
          display: 'flex',
          flexFlow: 'row nowrap',
          flex: 1,
          alignItems: 'center',
        }}
      >
        <Divider />
        <ActionButton
          size={'small'}
          startIcon={<FilterListIcon />}
          disabled={disabled}
          onClick={() => setOpenFilter(prevState => !prevState)}
        >
          Filter
        </ActionButton>
        <ActionButton
          size={'small'}
          startIcon={<SortIcon />}
          ref={anchorRef}
          disabled={disabled}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          {folderData.sort}
        </ActionButton>
        <StyledPopper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <StyledPaper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow">
                    {SORT_TYPES.filter(o => o !== folderData.sort).map(type => (
                      <StyledMenuItem
                        key={type}
                        onClick={() => updateSortType(type)}
                      >
                        {type}
                      </StyledMenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </StyledPaper>
            </Grow>
          )}
        </StyledPopper>
        <RefreshButton
          size={'small'}
          startIcon={<RefreshIcon />}
          onClick={updateLibrary}
          disabled={disabled}
        >
          Refresh
        </RefreshButton>
      </div>
      <MediaGrid
        size={setting.cardSize}
        folder={{ ...folderData }}
        data={data}
        current={current}
        select={setCurrent}
      />
      <Footer
        setting={setting}
        selected={data[current]?.title || `Total ${data.length}`}
      />
      <ScrollTop>
        <StyledFab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </StyledFab>
      </ScrollTop>
      <FilterSection
        folderData={folderData}
        open={openFilter}
        close={() => setOpenFilter(false)}
      />
    </Container>
  );
}

export default Content;
