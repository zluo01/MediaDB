import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  ACTOR,
  FILTER,
  GENRE,
  IFilterPros,
  IFolderInfo,
  TAG,
} from '../../type';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    filter: {
      marginLeft: 8,
      display: 'flex',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
    chip: {
      color: theme.palette.action.selected,
      borderColor: theme.palette.action.selected,
    },
    filterTitle: {
      marginLeft: 8,
      color: theme.palette.text.secondary,
      marginTop: 10,
      marginBottom: 5,
    },
  })
);

interface IFilerSection {
  folderData: IFolderInfo;
  width: number;
  space: number;
  filter: IFilterPros;
  updateFilter: (type: FILTER, name: string) => void;
}

function FilterSection({
  folderData,
  width,
  space,
  filter,
  updateFilter,
}: IFilerSection): JSX.Element {
  const classes = useStyles();
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        width: width - 2 * space,
        marginLeft: space,
        marginBottom: 20,
      }}
    >
      <Typography className={classes.filterTitle} variant="h5" component="h2">
        Genres
      </Typography>
      <div className={classes.filter}>
        {folderData.genres.map((value, index) => {
          return (
            <Chip
              key={index}
              className={classes.chip}
              label={value}
              clickable
              onClick={() => updateFilter(GENRE, value)}
              variant={filter.genres.includes(value) ? 'default' : 'outlined'}
            />
          );
        })}
      </div>
      <Typography className={classes.filterTitle} variant="h5" component="h2">
        Actors
      </Typography>
      <div className={classes.filter}>
        {folderData.actors.map((value, index) => {
          return (
            <Chip
              key={index}
              className={classes.chip}
              label={value}
              clickable
              onClick={() => updateFilter(ACTOR, value)}
              variant={filter.actors.includes(value) ? 'default' : 'outlined'}
            />
          );
        })}
      </div>
      <Typography className={classes.filterTitle} variant="h5" component="h2">
        Tags
      </Typography>
      <div className={classes.filter}>
        {folderData.tags.map((value, index) => {
          return (
            <Chip
              key={index}
              className={classes.chip}
              label={value}
              clickable
              onClick={() => updateFilter(TAG, value)}
              variant={filter.tags.includes(value) ? 'default' : 'outlined'}
            />
          );
        })}
      </div>
    </div>
  );
}

export default FilterSection;
