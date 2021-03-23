import React, { CSSProperties } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { openFile } from '../../utils/electron';
import { ICardSize, IMediaData } from '../../type';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((_theme: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      flexFlow: 'column nowrap',
      backgroundColor: 'inherit',
      justifyContent: 'center',
      alignItems: 'center',
      width: 'inherit',
      height: 'inherit',
    },
  })
);

interface IMovieCardProps {
  style: CSSProperties;
  media: IMediaData;
  size: ICardSize;
  select: () => void;
  selected: boolean;
}

function MovieCard({
  style,
  media,
  size,
  select,
  selected,
}: IMovieCardProps): JSX.Element {
  const classes = useStyles();
  return (
    <div
      style={style}
      onClick={select}
      onDoubleClick={() => openFile(media.file)}
    >
      <Paper className={classes.paper} elevation={selected ? 5 : 0}>
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

export default MovieCard;
