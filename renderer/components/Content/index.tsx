import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Fab from '@material-ui/core/Fab';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Grow from '@material-ui/core/Grow';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Zoom from '@material-ui/core/Zoom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import FilterListIcon from '@material-ui/icons/FilterList';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import RefreshIcon from '@material-ui/icons/Refresh';
import SortIcon from '@material-ui/icons/Sort';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';

import { updateFolderInfo } from '../../store';
import {
  ACTOR,
  DEFAULT,
  FILTER,
  GENRE,
  ICardSize,
  ICardStyle,
  IFilterPros,
  IFolder,
  IFolderInfo,
  IMediaData,
  IMovieData,
  IReduxState,
  ITVShowData,
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
import BottomInfoBar from '../BottomInfoBar';
import MovieCard from '../MovieCard';
import TVShowCard from '../TVShowCard';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    divider: {
      backgroundColor: theme.palette.secondary.main,
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
      flexGrow: 1,
      margin: theme.spacing(1),
    },
    button: {
      color: theme.palette.action.selected,

      '&:hover': {
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.action.hover,
      },
    },
    action: {
      color: theme.palette.action.selected,

      '&:hover': {
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.action.hover,
      },

      '& > *': {
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
      },
    },
    popper: {
      zIndex: theme.zIndex.drawer + 1,
    },
    paper: {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.action.selected,
    },
    paperItem: {
      '&:hover': {
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.action.hover,
      },
    },
    scroll: {
      position: 'fixed',
      bottom: theme.spacing(4),
      right: theme.spacing(2),
    },
    fab: {
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.action.hover,
    },
    progress: {
      color: theme.palette.action.selected,
      position: 'fixed',
      right: '50%',
      top: '38.2%',
    },
  })
);

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
  cardSize: ICardSize;
  searchState: boolean;
  updateData: (data: IFolderInfo) => void;
}

interface IScrollProps {
  children: React.ReactElement;
}

function ScrollTop(props: IScrollProps) {
  const { children } = props;
  const classes = useStyles();

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
      <div onClick={handleClick} role="presentation" className={classes.scroll}>
        {children}
      </div>
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
  cardSize,
  searchState,
  updateData,
}: IContentProps): JSX.Element {
  const classes = useStyles();
  const anchorRef = useRef<HTMLButtonElement>(null);

  const [currIndex, setCurrIndex] = useState(-1);
  const [data, setData] = useState(folderData.data);
  const [sortType, setSortType] = useState<string>(folderData.sort);

  const [filter, setFilter] = useState<IFilterPros>(initFilterState);

  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // const contentState = useRef(currIndex);
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
      anchor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  function handleClose(event: React.MouseEvent<EventTarget>) {
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
    switch (ev.key) {
      case 'ArrowLeft':
        setIndex(currIndex - 1 < 0 ? data.length - 1 : currIndex - 1);
        break;
      case 'ArrowRight':
        setIndex((currIndex + 1) % data.length);
        break;
      case 'ArrowUp':
        ev.preventDefault();
        setIndex(Math.max((r - 1) * columnNumber + c, 0));
        break;
      case 'ArrowDown':
        ev.preventDefault();
        setIndex(Math.min((r + 1) * columnNumber + c, data.length - 1));
        break;
      case 'Enter':
        if (data[currIndex].type === MOVIE) {
          openFile((data[currIndex] as IMovieData).file);
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
    buildDirectory(folderInfo.dir)
      .then(data => updateFolderInfo(folderInfo.name, data))
      .then(data => updateData(data))
      .then(() => setRefresh(false))
      .catch(err => console.error(err));
  }

  if (refresh) {
    return <CircularProgress className={classes.progress} />;
  }

  const cWidth = cardSize.width + 15;
  const cHeight = cardSize.height + 60;

  return (
    <AutoSizer>
      {({ width }) => {
        const columnNumber = Math.floor(width / cWidth);
        if (columnNumber !== contentState.current.columnNumber) {
          setColumnNum(columnNumber);
        }
        const w = (width - columnNumber * cWidth - 1) / (columnNumber * 2);
        return (
          <>
            <div
              style={{
                height: 60,
                display: 'flex',
                flexFlow: 'row nowrap',
                flex: 1,
                width: width - 2 * w,
                marginLeft: w,
                alignItems: 'center',
              }}
            >
              <hr className={classes.divider} />
              <Button
                className={classes.action}
                size={'small'}
                startIcon={<FilterListIcon />}
                disabled={searchState}
                onClick={() => setOpenFilter(prevState => !prevState)}
              >
                Filter
              </Button>
              <Button
                className={classes.action}
                size={'small'}
                startIcon={<SortIcon />}
                ref={anchorRef}
                disabled={searchState}
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
              >
                {sortType}
              </Button>
              <Popper
                className={classes.popper}
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
                    <Paper className={classes.paper}>
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList autoFocusItem={open} id="menu-list-grow">
                          {SORT_TYPES.filter(o => o !== sortType).map(type => (
                            <MenuItem
                              key={type}
                              className={classes.paperItem}
                              onClick={() => updateSortType(type)}
                            >
                              {type}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
              <Button
                className={classes.button}
                size={'small'}
                startIcon={<RefreshIcon />}
                onClick={updateLibrary}
                disabled={searchState}
              >
                Refresh
              </Button>
            </div>
            {openFilter && (
              <FilterSection
                folderData={folderData}
                width={width}
                space={w}
                filter={filter}
                updateFilter={updateFilter}
              />
            )}
            <GridList
              cellHeight={cHeight} // height for bottom bar
              style={{ width: width, paddingBottom: 28 }}
              cols={columnNumber}
            >
              {data.map((media, index) => {
                const style: ICardStyle = {
                  width: cWidth + w * 2,
                  height: cHeight,
                  elevation: currIndex === index ? 5 : 0,
                };
                return (
                  <GridListTile key={index}>
                    {media.type === MOVIE ? (
                      <MovieCard
                        style={style}
                        media={media as IMovieData}
                        size={cardSize}
                        select={() => setIndex(index)}
                        index={index}
                      />
                    ) : (
                      <TVShowCard
                        style={style}
                        media={media as ITVShowData}
                        size={cardSize}
                        select={() => setIndex(index)}
                        selected={currIndex === index}
                        index={index}
                      />
                    )}
                  </GridListTile>
                );
              })}
            </GridList>
            <BottomInfoBar selected={data[currIndex]?.title || ''} />
            <ScrollTop>
              <Fab
                className={classes.fab}
                size="small"
                aria-label="scroll back to top"
              >
                <KeyboardArrowUpIcon />
              </Fab>
            </ScrollTop>
          </>
        );
      }}
    </AutoSizer>
  );
}

const mapStateToProps = (state: IReduxState) => ({
  cardSize: state.setting.cardSize,
});

export default connect(mapStateToProps)(Content);
