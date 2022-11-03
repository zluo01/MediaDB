import { openFile } from '@/lib/os';
import { ICardSize, IFolder, IMediaData, MOVIE, TV_SERIES } from '@/type';
import { Drawer, Typography } from '@mui/material';
import { lighten, useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import path from 'path';
import React, { useState } from 'react';

import { CardGrid, CardInfo, MediaCard } from './styles';

const Image = dynamic(() => import('@/components/ImageLoader'), {
  ssr: false,
});

const Menu = dynamic(() => import('./menu'), {
  ssr: false,
});

interface ContentSize {
  columnNumber: number;
  cHeight: number;
  cWidth: number;
  space: number;
  width: number;
  cardSize: ICardSize;
}

interface ICardProps {
  folder: IFolder;
  size: ContentSize;
  data: IMediaData[];
  select: (index: number) => void;
  currIndex: number;
}

function MediaGrid({
  folder,
  data,
  size,
  select,
  currIndex,
}: ICardProps): JSX.Element {
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  async function handleOpen(media: IMediaData) {
    switch (media.type) {
      // case 'comic':
      case 'movie':
        await openFile(path.join(folder.path, media.relativePath, media.file));
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
            key={index}
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
              folder={folder}
              src={path.join(media.relativePath, media.posters['main'])}
              alt={media.title}
              width={size.cardSize.width}
              height={size.cardSize.height}
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
                <Menu folder={folder} data={media} />
              </Drawer>
            )}
          </MediaCard>
        );
      })}
    </CardGrid>
  );
}

export default MediaGrid;
