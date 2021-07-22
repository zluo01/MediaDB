import { ClickAwayListener, Popper, Typography } from '@material-ui/core';
import { lighten, useTheme } from '@material-ui/core/styles';
import React, { useState } from 'react';

import {
  ICardSize,
  IMediaData,
  IMovieData,
  MOVIE,
  TV_SERIES,
} from '../../type';
import { openFile } from '../../utils/electron';
import Image from '../ImageLoader';
import Menu from './showMenu';
import { CardGrid, CardInfo, MediaCard } from './styles';

interface ContentSize {
  columnNumber: number;
  cHeight: number;
  cWidth: number;
  space: number;
  width: number;
  cardSize: ICardSize;
}

interface ICardProps {
  size: ContentSize;
  data: IMediaData[];
  select: (index: number) => void;
  currIndex: number;
}

function MediaGrid({ data, size, select, currIndex }: ICardProps): JSX.Element {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'transitions-popper' : undefined;

  return (
    <CardGrid
      cols={size.columnNumber}
      rowHeight={size.cHeight}
      sx={{ width: size.width }}
      gap={0}
    >
      {data.map((media, index) => {
        const elevation = currIndex === index ? 5 : 0;
        return (
          <MediaCard
            key={media.poster}
            id={`c${index}`}
            onClick={() => select(index)}
            onDoubleClick={e =>
              media.type === MOVIE
                ? openFile((media as IMovieData).file)
                : handleClick(e)
            }
            sx={{
              width: size.cWidth + size.space * 2,
              height: size.cHeight,
              boxShadow: theme.shadows[elevation],
              backgroundColor: lighten(
                theme.palette.background.default,
                elevation * 0.025
              ),
            }}
          >
            <Image
              dir={media.poster}
              title={media.title}
              size={size.cardSize}
            />
            <CardInfo
              title={
                <Typography variant="body2" title={media.title} noWrap={true}>
                  {media.title}
                </Typography>
              }
              subtitle={
                media.type === MOVIE && (
                  <Typography variant={'caption'} color={'textSecondary'}>
                    {media.year}
                  </Typography>
                )
              }
              position="below"
              sx={{ width: size.cardSize.width }}
            />
            {media.type === TV_SERIES && (
              <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                <Popper
                  id={id}
                  placement="bottom"
                  disablePortal={false}
                  open={open && currIndex === index}
                  anchorEl={anchorEl}
                  modifiers={[
                    {
                      name: 'flip',
                      enabled: true,
                      options: {
                        altBoundary: true,
                        rootBoundary: 'document',
                        padding: 8,
                      },
                    },
                    {
                      name: 'preventOverflow',
                      enabled: true,
                      options: {
                        altAxis: true,
                        altBoundary: true,
                        tether: true,
                        rootBoundary: 'document',
                        padding: 8,
                      },
                    },
                  ]}
                >
                  <Menu data={media} />
                </Popper>
              </ClickAwayListener>
            )}
          </MediaCard>
        );
      })}
    </CardGrid>
  );
}

export default MediaGrid;
