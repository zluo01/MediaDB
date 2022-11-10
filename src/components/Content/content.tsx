import { openFile } from '@/lib/os';
import { ICardSize, IFolder, IMediaData, MOVIE, TV_SERIES } from '@/type';
import { Box, Drawer, Stack, Typography } from '@mui/material';
import { lighten, useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import path from 'path';
import React, { useState } from 'react';

import { CardInfo } from './styles';

const Image = dynamic(() => import('@/components/ImageLoader'), {
  ssr: false,
});

const Menu = dynamic(() => import('./menu'), {
  ssr: false,
});

interface ICardProps {
  folder: IFolder;
  size: ICardSize;
  data: IMediaData[];
  current: number;
  select: (index: number) => void;
}

function MediaGrid({
  folder,
  data,
  size,
  current,
  select,
}: ICardProps): JSX.Element {
  const cInfo = 60;

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

  const width = size.width + 10;
  return (
    <Box
      display={'grid'}
      sx={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${width}px, 1fr))`,
      }}
    >
      {data.map((media, index) => {
        const elevation = current === index ? 5 : 0;
        return (
          <Stack
            key={index}
            id={`c${index}`}
            onClick={() => select(index)}
            onDoubleClick={() => handleOpen(media)}
            width={'100%'}
            height={size.height + cInfo}
            direction={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            spacing={0}
            boxShadow={theme.shadows[elevation]}
            bgcolor={lighten(
              theme.palette.background.default,
              elevation * 0.025
            )}
          >
            <Image
              folder={folder}
              src={path.join(media.relativePath, media.posters['main'])}
              alt={media.title}
              width={size.width}
              height={size.height}
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
              sx={{ width: size.width }}
            />
            {media.type === TV_SERIES && (
              <Drawer
                anchor={'bottom'}
                open={open && current === index}
                onClose={() => setOpen(false)}
              >
                <Menu folder={folder} data={media} />
              </Drawer>
            )}
          </Stack>
        );
      })}
    </Box>
  );
}

export default MediaGrid;
