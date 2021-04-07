import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { openFile } from '../../utils/electron';
import { ICardSize, ICardStyle, IMovieData } from '../../type';
import {
  Theme,
  createStyles,
  makeStyles,
  lighten,
} from '@material-ui/core/styles';
import dynamic from 'next/dynamic';

const useStyles = makeStyles<Theme, ICardStyle>((theme: Theme) =>
  createStyles({
    root: {
      width: props => props.width,
      height: props => props.height,
    },
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

const Image = dynamic(() => import('../ImageLoader'), { ssr: false });

interface IMovieCardProps {
  style: ICardStyle;
  media: IMovieData;
  size: ICardSize;
  select: () => void;
  index: number;
}

function MovieCard({
  style,
  media,
  size,
  select,
  index,
}: IMovieCardProps): JSX.Element {
  const classes = useStyles(style);
  return (
    <div
      id={`c${index}`}
      style={style}
      onClick={select}
      onDoubleClick={() => openFile(media.file)}
    >
      <Paper className={classes.paper}>
        <Image dir={media.poster} title={media.title} size={size} />
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
