import React, { CSSProperties, memo } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { openFile } from '../../utils/electron';
import { ICardSize, IMovieData } from '../../type';
import {
  Theme,
  createStyles,
  makeStyles,
  lighten,
} from '@material-ui/core/styles';
import { areEqual } from "react-window";

const useStyles = makeStyles<Theme, { elevation: number }>((theme: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      flexFlow: 'column nowrap',
      justifyContent: 'center',
      alignItems: 'center',
      width: 'inherit',
      height: 'inherit',
      boxShadow: props => theme.shadows[props.elevation],
      backgroundColor: props =>
        lighten(theme.palette.background.default, props.elevation * 0.025),
    },
  })
);

interface IMovieCardProps {
  style: CSSProperties;
  media: IMovieData;
  size: ICardSize;
  select: () => void;
  selected: boolean;
  index: number;
}

function MovieCard({
  style,
  media,
  size,
  select,
  selected,
  index,
}: IMovieCardProps): JSX.Element {
  const classes = useStyles({ elevation: selected ? 5 : 0 });
  return (
    <div
      id={`c${index}`}
      style={style}
      onClick={select}
      onDoubleClick={() => openFile(media.file)}
    >
      <Paper className={classes.paper}>
        <img
          style={{ width: size.width, height: size.height }}
          alt={media.title}
          src={`${media.poster}`}
        />
        <div style={{ width: size.width }}>
          <Typography variant="body2" title={media.title} noWrap={true}>
            {media.title}
          </Typography>
          <Typography variant={'caption'} color={'textSecondary'}>
            {media.year}
          </Typography>
        </div>
      </Paper>
    </div>
  );
}

export default memo(MovieCard, areEqual);
