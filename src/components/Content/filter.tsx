import { useAppDispatch, useAppSelector } from '@/lib/source';
import { reset, updateFilter } from '@/lib/source/slice/filderReducer';
import { RootState } from '@/lib/source/store';
import { ACTOR, FILTER, GENRE, IFolderInfo, STUDIO, TAG } from '@/type';
import { Button, Chip, Drawer, Stack, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React from 'react';

const FilterPanel = styled(Drawer)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,

  '& .MuiDrawer-paper': {
    width: '19vw',
    borderRadius: 20,
    background: theme.palette.background.default,
  },
}));

const ChipContainer = styled('div')(() => ({
  display: 'flex',
  flexFlow: 'row wrap',
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  color: theme.palette.action.selected,
  borderColor: theme.palette.action.selected,
  margin: theme.spacing(0.5),
}));

interface IFilerSection {
  folderData: IFolderInfo;
  open: boolean;
  close: VoidFunction;
}

const FILTER_TAGS = [GENRE, ACTOR, STUDIO, TAG];

function Filters({ folderData, open, close }: IFilerSection): JSX.Element {
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const filters = useAppSelector((state: RootState) => state.filter);

  function update(tag: FILTER, name: string) {
    dispatch(
      updateFilter({
        tag,
        name,
      })
    );
  }

  function clear(tag: FILTER) {
    dispatch(reset(tag));
  }

  return (
    <FilterPanel anchor={'right'} open={open} onClose={close} elevation={0}>
      <Stack
        direction="column"
        justifyContent="space-between"
        alignItems="flex-start"
        p={2}
      >
        {FILTER_TAGS.map(v => {
          const data = folderData[v.toLowerCase()] as string[];
          const filter = filters[v.toLowerCase()] as string[];
          return (
            <div key={v}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                py={0.5}
              >
                <Typography
                  variant="h5"
                  component="h3"
                  color={theme.palette.text.secondary}
                >
                  {v}
                </Typography>
                <Button
                  variant="text"
                  disabled={filter.length === 0}
                  style={{ color: theme.palette.text.secondary }}
                  onClick={() => clear(v as FILTER)}
                >
                  Clear
                </Button>
              </Stack>
              <ChipContainer>
                {data.sort().map((value, index) => (
                  <FilterChip
                    key={index}
                    label={value}
                    clickable
                    onClick={() => update(v as FILTER, value)}
                    variant={filter.includes(value) ? 'filled' : 'outlined'}
                  />
                ))}
              </ChipContainer>
            </div>
          );
        })}
      </Stack>
    </FilterPanel>
  );
}

export default Filters;
