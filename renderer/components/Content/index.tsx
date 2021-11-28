import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import {
  ClickAwayListener,
  Fab,
  Grow,
  MenuItem,
  MenuList,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';

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
  IReduxState,
  MOVIE,
  SORT,
  STUDIO,
  TAG,
  TITLE_ASC,
  TITLE_DSC,
  YEAR_ASC,
  YEAR_DSC,
} from '../../type';
import { openFile } from '../../utils/electron';
import { buildDirectory } from '../../utils/parser';
import { updateFolderInfo } from '../../utils/store';
import Footer from '../Footer';
import MediaGrid from './content';
import {
  ActionButton,
  Divider,
  Loading,
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
  searchState: boolean;
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

const FilterSection = dynamic(() => import('../Filter'), { ssr: false });

const initFilterState = {
  actors: [],
  genres: [],
  studios: [],
  tags: [],
};

function Content({
  folderInfo,
  folderData,
  searchState,
  updateData,
}: IContentProps): JSX.Element {
  const anchorRef = useRef<HTMLButtonElement>(null);

  const cardSize = useSelector((state: IReduxState) => state.setting.cardSize);

  const [currIndex, setCurrIndex] = useState(-1);
  const [data, setData] = useState(folderData.data);
  const [sortType, setSortType] = useState<string>(folderData.sort);

  const [filter, setFilter] = useState<IFilterPros>(initFilterState);

  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const contentState = useRef({
    currIndex: currIndex,
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
      media = media.filter(o => o.tag.includes(t));
    });

    filter.genres.forEach(g => {
      media = media.filter(o => o.genre.includes(g));
    });

    filter.actors.forEach(a => {
      media = media.filter(o => o.actor.includes(a));
    });

    filter.studios.forEach(a => {
      media = media.filter(o => o.studio.includes(a));
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
    })
      .then(() => setSortType(type))
      .finally(() => setOpen(false))
      .catch(err => console.error(err));
  }

  function handleKeyPress(ev: KeyboardEvent) {
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
          openFile((data[currIndex] as IMovieData | IComicData).file);
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

  function updateFilter(type: FILTER, name: string) {
    switch (type) {
      case TAG:
        if (!filter.tags.includes(name)) {
          setFilter({ ...filter, tags: [...filter.tags, name] });
          return;
        }
        setFilter({ ...filter, tags: filter.tags.filter(o => o !== name) });
        break;
      case GENRE:
        if (!filter.genres.includes(name)) {
          setFilter({ ...filter, genres: [...filter.genres, name] });
          return;
        }
        setFilter({ ...filter, genres: filter.genres.filter(o => o !== name) });
        break;
      case ACTOR:
        if (!filter.actors.includes(name)) {
          setFilter({ ...filter, actors: [...filter.actors, name] });
          return;
        }
        setFilter({ ...filter, actors: filter.actors.filter(o => o !== name) });
        break;
      case STUDIO:
        if (!filter.studios.includes(name)) {
          setFilter({ ...filter, studios: [...filter.studios, name] });
          return;
        }
        setFilter({
          ...filter,
          studios: filter.studios.filter(o => o !== name),
        });
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
    return <Loading />;
  }

  const cInfo = 60;
  const cWidth = cardSize.width + 15;
  const cHeight = cardSize.height + cInfo;

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
                disabled={searchState}
                onClick={() => setOpenFilter(prevState => !prevState)}
              >
                Filter
              </ActionButton>
              <ActionButton
                size={'small'}
                startIcon={<SortIcon />}
                ref={anchorRef}
                disabled={searchState}
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
                disabled={searchState}
              >
                Refresh
              </RefreshButton>
            </div>
            {openFilter && (
              <FilterSection
                folderData={folderData}
                width={width}
                space={space}
                filter={filter}
                updateFilter={updateFilter}
              />
            )}
            <MediaGrid
              size={{
                columnNumber: columnNumber,
                cHeight: cHeight,
                cWidth: cWidth,
                space: space,
                width: width,
                cardSize: cardSize,
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
