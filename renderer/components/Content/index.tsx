import {
  DEFAULT,
  ICardSize,
  IFolder,
  IFolderInfo,
  IMediaData,
  IMovieData,
  IReduxState,
  MOVIE,
  SORT,
  TITLE_ASC,
  TITLE_DSC,
  YEAR_ASC,
  YEAR_DSC,
} from '../../type';
import { FixedSizeGrid as Grid } from 'react-window';
import MovieCard from '../MovieCard';
import AutoSizer from 'react-virtualized-auto-sizer';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { openFile } from '../../utils/electron';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import RefreshIcon from '@material-ui/icons/Refresh';
import FilterListIcon from '@material-ui/icons/FilterList';
import SortIcon from '@material-ui/icons/Sort';
import { updateFolderInfo } from '../../store';
import { buildDirectory } from '../../utils/parser';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Fab from '@material-ui/core/Fab';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Zoom from '@material-ui/core/Zoom';
import CircularProgress from '@material-ui/core/CircularProgress';
import dynamic from 'next/dynamic';

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
      bottom: theme.spacing(2),
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
      top: '36%',
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

const FilterSection = dynamic(
  () => import('../Filter'),
  { ssr: false }
)

function Content({
  folderInfo,
  folderData,
  cardSize,
  updateData,
}: IContentProps): JSX.Element {
  const classes = useStyles();
  const gridRef = React.createRef<Grid>();
  const anchorRef = useRef<HTMLButtonElement>(null);

  const [currIndex, setCurrIndex] = useState(-1);
  const [data, setData] = useState(folderData.data);
  const [sortType, setSortType] = useState<string>(folderData.sort);

  const [tags, setTags] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [actors, setActors] = useState<string[]>([]);

  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const cWidth = cardSize.width + 15;
  const cHeight = cardSize.height + 60;

  const contentState = useRef(currIndex);

  function setIndex(index: number) {
    contentState.current = index;
    setCurrIndex(index);
  }

  function handleToggle() {
    setOpen(prevOpen => !prevOpen);
  }

  useEffect(() => {
    const anchor = document.querySelector(`#c${currIndex}`);
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currIndex]);

  useEffect(() => {
    if (refresh) {
      buildDirectory(folderInfo.dir)
        .then(data => updateFolderInfo(folderInfo.name, data))
        .then(data => updateData(data))
        .then(() => setRefresh(false))
        .catch(err => console.error(err));
    }
  }, [refresh]);

  useEffect(() => {
    setData(folderData.data);
  }, [folderData]);

  useEffect(() => {
    let media = [...folderData.data];

    tags.forEach(t => {
      media = media.filter(o => o.tag.includes(t));
    });

    genres.forEach(g => {
      media = media.filter(o => o.genre.includes(g));
    });

    actors.forEach(a => {
      media = media.filter(o => o.actors.includes(a));
    });

    switch (sortType) {
      case DEFAULT:
        setData(media);
        break;
      case TITLE_ASC:
        media.sort((a: IMediaData, b: IMediaData) =>
          a.title > b.title ? 1 : -1
        );
        setData(media);
        break;
      case TITLE_DSC:
        media.sort((a: IMediaData, b: IMediaData) =>
          a.title < b.title ? 1 : -1
        );
        setData(media);
        break;
      case YEAR_DSC:
        if (media[0].type === MOVIE) {
          media.sort((a: IMediaData, b: IMediaData) =>
            (a as IMovieData).year < (b as IMovieData).year ? 1 : -1
          );
          setData(media);
        }
        break;
      case YEAR_ASC:
        if (media[0].type === MOVIE) {
          media.sort((a: IMediaData, b: IMediaData) =>
            (a as IMovieData).year > (b as IMovieData).year ? 1 : -1
          );
        }
        setData(media);
        break;
    }
  }, [sortType, tags, genres, actors]);

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
    const c = contentState.current % columnNumber;
    const r = Math.floor(contentState.current / columnNumber);
    switch (ev.key) {
      case 'ArrowLeft':
        setIndex(
          contentState.current - 1 < 0
            ? data.length - 1
            : contentState.current - 1
        );
        break;
      case 'ArrowRight':
        setIndex((contentState.current + 1) % data.length);
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
        if (data[contentState.current].type === MOVIE) {
          openFile((data[contentState.current] as IMovieData).file);
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

  function modifiedTags(name: string): void {
    if (!tags.includes(name)) {
      setTags(prevState => [...prevState, name]);
      return;
    }
    setTags(tags.filter(o => o !== name));
  }

  function modifiedGenres(name: string): void {
    if (!genres.includes(name)) {
      setGenres(prevState => [...prevState, name]);
      return;
    }
    setGenres(genres.filter(o => o !== name));
  }

  function modifiedActors(name: string): void {
    if (!actors.includes(name)) {
      setActors(prevState => [...prevState, name]);
      return;
    }
    setActors(actors.filter(o => o !== name));
  }

  let columnNumber: number;
  return (
    <AutoSizer>
      {({ width }) => {
        columnNumber = Math.floor(width / cWidth);
        const rowNumber = Math.ceil(data.length / columnNumber);
        const w = (width - columnNumber * cWidth - 1) / (columnNumber * 2);
        if (refresh) {
          return <CircularProgress className={classes.progress} />;
        }
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
                onClick={() => setOpenFilter(prevState => !prevState)}
              >
                Filter
              </Button>
              <Button
                className={classes.action}
                size={'small'}
                startIcon={<SortIcon />}
                ref={anchorRef}
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
                onClick={() => setRefresh(true)}
              >
                Refresh
              </Button>
            </div>
            {openFilter && (
              <FilterSection
                folderData={folderData}
                width={width}
                space={w}
                tags={tags}
                genres={genres}
                actors={actors}
                modifiedTags={modifiedTags}
                modifiedGenres={modifiedGenres}
                modifiedActors={modifiedActors}
              />
            )}
            <Grid
              ref={gridRef}
              columnCount={columnNumber}
              columnWidth={cWidth + w * 2}
              rowCount={rowNumber}
              rowHeight={cHeight}
              height={cHeight * rowNumber + 10}
              width={width}
              itemData={{
                media: data,
                size: cardSize,
              }}
            >
              {({ style, columnIndex, rowIndex, data }) => {
                const index = rowIndex * columnNumber + columnIndex;
                if (index >= data.media.length) return null;
                return (
                  <MovieCard
                    style={style}
                    media={data.media[index]}
                    size={data.size}
                    select={() => setIndex(index)}
                    selected={currIndex === index}
                    index={index}
                  />
                );
              }}
            </Grid>
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
