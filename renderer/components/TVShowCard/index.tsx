import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { ICardSize, ICardStyle, ITVShowData } from '../../type';
import {
  Theme,
  createStyles,
  makeStyles,
  lighten,
} from '@material-ui/core/styles';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import Menu from '../TVShowMenu';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
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
    popper: {
      border: '1px solid',
      padding: theme.spacing(1),
      backgroundColor: theme.palette.background.paper,
    },
  })
);

const Image = dynamic(() => import('../ImageLoader'), { ssr: false });

interface ITVShowCardProps {
  style: ICardStyle;
  media: ITVShowData;
  size: ICardSize;
  select: () => void;
  selected: boolean;
  index: number;
}

function TVShowCard({
  style,
  media,
  size,
  select,
  selected,
  index,
}: ITVShowCardProps): JSX.Element {
  const classes = useStyles(style);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'transitions-popper' : undefined;

  return (
    <div
      id={`c${index}`}
      style={style}
      onClick={select}
      onDoubleClick={handleClick}
    >
      <Paper className={classes.paper}>
        <Image dir={media.poster} title={media.title} size={size} />
        <div style={{ width: size.width }}>
          <Typography variant="body2" title={media.title} noWrap={true}>
            {media.title}
          </Typography>
        </div>
      </Paper>
      <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
        <Popper
          id={id}
          placement="bottom"
          disablePortal={false}
          open={open && selected}
          anchorEl={anchorEl}
          modifiers={{
            flip: {
              enabled: true,
            },
            preventOverflow: {
              enabled: true,
              boundariesElement: 'scrollParent',
            },
          }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Menu data={media} />
            </Fade>
          )}
        </Popper>
      </ClickAwayListener>
    </div>
  );
}

export default TVShowCard;
