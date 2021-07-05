import { ImageListItem, Typography } from '@material-ui/core';
import { lighten, useTheme } from '@material-ui/core/styles';
import React from 'react';

import { ICardSize, IMediaData, IMovieData, MOVIE } from '../../type';
import { openFile } from '../../utils/electron';
import Image from '../ImageLoader';
import { CardPaper, CardGrid, CardInfo } from './styles';

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
          // <LazyLoad
          //   key={index}
          //   height={cHeight}
          //   offset={cHeight * 2}
          //   resize
          //   once
          // >
          <ImageListItem
            key={media.poster}
            id={`c${index}`}
            onClick={() => select(index)}
            onDoubleClick={() => openFile((media as IMovieData).file)} // Todo fix
            sx={{
              width: size.cWidth + size.space * 2,
              height: size.cHeight,
            }}
          >
            <CardPaper
              sx={{
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
            </CardPaper>
          </ImageListItem>
          // </LazyLoad>
        );
      })}
    </CardGrid>
  );
}

export default MediaGrid;
