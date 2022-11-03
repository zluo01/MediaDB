import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import {
  Backdrop,
  CircularProgress,
  ClickAwayListener,
  Fab,
  Grow,
  MenuItem,
  MenuList,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useEffect, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import { openFile } from '../../lib/os';
import { buildDirectory } from '../../lib/parser';
import { useAppSelector } from '../../lib/source';
import { updateFolderInfo } from '../../lib/store';
import {
  ACTOR,
  COMIC,
  DEFAULT,
  FILTER,
  GENRE,
  IComicData,
  IFilterPros,
  IFolder,
  IFolderInfo,
  IMediaData,
  IMovieData,
  IState,
  MOVIE,
  SORT,
  STUDIO,
  TAG,
  TITLE_ASC,
  TITLE_DSC,
  YEAR_ASC,
  YEAR_DSC,
} from '../../type';
import Filters from '../Filter';
import Footer from '../Footer';
import MediaGrid from './content';
import {
  ActionButton,
  Divider,
  RefreshButton,
  StyledPaper,
  StyledPopper,
} from './styles';

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

function getSortType(type: string): SORT {
  switch (type) {
    case DEFAULT:
      return DEFAULT;
    case TITLE_ASC:
      return TITLE_ASC;
    case TITLE_DSC:
      return TITLE_DSC;
    case YEAR_ASC:
      return YEAR_ASC;
    case YEAR_DSC:
      return YEAR_DSC;
    default:
      throw new Error('Invalid Type Found: ' + type);
  }
}

interface IContentProps {
  folderInfo: IFolder;
  folderData: IFolderInfo;
  updateData: (data: IFolderInfo) => void;
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

const initFilterState = {
  actors: [],
  genres: [],
  studios: [],
  tags: [],
};

function Content({
  folderInfo,
  folderData,
  updateData,
}: IContentProps): JSX.Element {
  const anchorRef = useRef<HTMLButtonElement>(null);

  const { search, setting } = useAppSelector((state: IState) => state);

  const [currIndex, setCurrIndex] = useState(-1);
  const [data, setData] = useState(folderData.data);
  const [sortType, setSortType] = useState<string>(folderData.sort);

  const [filter, setFilter] = useState<IFilterPros>(initFilterState);

  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const contentState = useRef({
    currIndex,
    columnNumber: 0,
  });

  function setIndex(index: number) {
    contentState.current = { ...contentState.current, currIndex: index };
    setCurrIndex(index);
  }

  function setColumnNum(num: number) {
    contentState.current = { ...contentState.current, columnNumber: num };
  }

  function handleToggle() {
    setOpen(prevOpen => !prevOpen);
  }

  useEffect(() => {
    const anchor = document.getElementById(`c${currIndex}`);
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currIndex]);

  useEffect(() => {
    setData(filterData());
  }, [sortType, filter, folderData]);

  function filterData(): IMediaData[] {
    let media = [...folderData.data];

    filter.tags.forEach(t => {
      media = media.filter(o => o.tags.includes(t));
    });

    filter.genres.forEach(g => {
      media = media.filter(o => o.genres.includes(g));
    });

    filter.actors.forEach(a => {
      media = media.filter(o => o.actors.includes(a));
    });

    filter.studios.forEach(a => {
      media = media.filter(o => o.studios.includes(a));
    });

    switch (sortType) {
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

  function updateSortType(type: string) {
    updateFolderInfo(folderInfo.name, {
      ...folderData,
      sort: getSortType(type),
    });
    setSortType(type);
    setOpen(false);
  }

  async function handleKeyPress(ev: KeyboardEvent) {
    const { currIndex, columnNumber } = contentState.current;
    const c = currIndex % columnNumber;
    const r = Math.floor(currIndex / columnNumber);
    let index;
    switch (ev.key) {
      case 'ArrowLeft':
        setIndex(currIndex - 1 < 0 ? data.length - 1 : currIndex - 1);
        break;
      case 'ArrowRight':
        setIndex((currIndex + 1) % data.length);
        break;
      case 'ArrowUp':
        ev.preventDefault();
        index = (r - 1) * columnNumber + c;
        if (index < 0) {
          return;
        }
        setIndex(index);
        break;
      case 'ArrowDown':
        ev.preventDefault();
        index = (r + 1) * columnNumber + c;
        if (index > data.length - 1) {
          return;
        }
        setIndex(index);
        break;
      case 'Enter':
        if (data[currIndex].type === MOVIE || data[currIndex].type === COMIC) {
          await openFile((data[currIndex] as IMovieData | IComicData).file);
        }
        break;
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [data]);

  function getFilterSets(value: string[], name: string): string[] {
    if (value.includes(name)) {
      return value.filter(o => o !== name);
    }
    return [...value, name];
  }

  function updateFilter(type: FILTER, name: string) {
    switch (type) {
      case TAG:
        setFilter(prevState => ({
          ...prevState,
          tags: getFilterSets(prevState.tags, name),
        }));
        break;
      case GENRE:
        setFilter(prevState => ({
          ...prevState,
          genres: getFilterSets(prevState.genres, name),
        }));
        break;
      case ACTOR:
        setFilter(prevState => ({
          ...prevState,
          actors: getFilterSets(prevState.actors, name),
        }));
        break;
      case STUDIO:
        setFilter(prevState => ({
          ...prevState,
          studios: getFilterSets(prevState.studios, name),
        }));
        break;
    }
  }

  function clearFilter(type: FILTER) {
    switch (type) {
      case TAG:
        setFilter(prevState => ({ ...prevState, tags: [] }));
        break;
      case GENRE:
        setFilter(prevState => ({ ...prevState, genres: [] }));
        break;
      case ACTOR:
        setFilter(prevState => ({ ...prevState, actors: [] }));
        break;
      case STUDIO:
        setFilter(prevState => ({ ...prevState, studios: [] }));
        break;
    }
  }

  async function updateLibrary(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setRefresh(true);
    try {
      const data = await buildDirectory(folderInfo.dir);
      await updateFolderInfo(folderInfo.name, data);
      updateData(data);
      setRefresh(false);
    } catch (e) {
      console.error(e);
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

  const cInfo = 60;
  const cWidth = setting.cardSize.width + 15;
  const cHeight = setting.cardSize.height + cInfo;

  return (
    <AutoSizer>
      {({ width }) => {
        const columnNumber = Math.floor(width / cWidth);
        if (columnNumber !== contentState.current.columnNumber) {
          setColumnNum(columnNumber);
        }
        const space = (width - columnNumber * cWidth - 1) / (columnNumber * 2);
        return (
          <>
            <div
              style={{
                height: 60,
                display: 'flex',
                flexFlow: 'row nowrap',
                flex: 1,
                width: width - 2 * space,
                marginLeft: space,
                alignItems: 'center',
              }}
            >
              <Divider />
              <ActionButton
                size={'small'}
                startIcon={<FilterListIcon />}
                disabled={search !== ''}
                onClick={() => setOpenFilter(prevState => !prevState)}
              >
                Filter
              </ActionButton>
              <ActionButton
                size={'small'}
                startIcon={<SortIcon />}
                ref={anchorRef}
                disabled={search !== ''}
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
              >
                {sortType}
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
                          {SORT_TYPES.filter(o => o !== sortType).map(type => (
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
                disabled={search !== ''}
              >
                Refresh
              </RefreshButton>
            </div>
            {openFilter && (
              <Filters
                folderData={folderData}
                width={width}
                space={space}
                filter={filter}
                clearFilter={clearFilter}
                updateFilter={updateFilter}
              />
            )}
            <MediaGrid
              size={{
                columnNumber,
                cHeight,
                cWidth,
                space,
                width,
                cardSize: setting.cardSize,
              }}
              data={data}
              select={setIndex}
              currIndex={currIndex}
            />
            <Footer
              selected={data[currIndex]?.title || `Total ${data.length}`}
            />
            <ScrollTop>
              <StyledFab size="small" aria-label="scroll back to top">
                <KeyboardArrowUpIcon />
              </StyledFab>
            </ScrollTop>
          </>
        );
      }}
    </AutoSizer>
  );
}

export default Content;
