import { Drawer, Typography } from '@mui/material';
import { lighten, useTheme } from '@mui/material/styles';
import React, { useState } from 'react';

import { ICardSize, IMediaData, MOVIE, TV_SERIES } from '../../type';
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

  const [open, setOpen] = useState(false);

  async function handleOpen(media: IMediaData) {
    switch (media.type) {
      case 'comic':
      case 'movie':
        openFile(media.file);
        break;
      case 'tvshow':
        setOpen(prevState => !prevState);
        break;
    }
  }

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
            onDoubleClick={() => handleOpen(media)}
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
              style={{
                width: size.cardSize.width,
                height: size.cardSize.height,
              }}
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
              <Drawer
                anchor={'bottom'}
                open={open && currIndex === index}
                onClose={() => setOpen(false)}
              >
                <Menu data={media} />
              </Drawer>
            )}
          </MediaCard>
        );
      })}
    </CardGrid>
  );
}

export default MediaGrid;
