import { Button, Chip, Stack, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React from 'react';

import {
  ACTOR,
  FILTER,
  GENRE,
  IFilterPros,
  IFolderInfo,
  STUDIO,
  TAG,
} from '../../type';

const ChipContainer = styled('div')(() => ({
  marginLeft: 8,
  display: 'flex',
  flexWrap: 'wrap',
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  color: theme.palette.action.selected,
  borderColor: theme.palette.action.selected,
  margin: theme.spacing(0.5),
}));

interface IFilterSection {
  name: string;
  data: string[];
  filter: string[];
  type: FILTER;
  clearFilter: (type: FILTER) => void;
  updateFilter: (type: FILTER, name: string) => void;
}

function FilterSection({
  name,
  data,
  type,
  filter,
  clearFilter,
  updateFilter,
}: IFilterSection): JSX.Element {
  const theme = useTheme();
  return (
    <React.Fragment>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Typography
          variant="h5"
          component="h2"
          style={{
            marginLeft: 8,
            color: theme.palette.text.secondary,
            marginTop: 10,
            marginBottom: 5,
          }}
        >
          {name}
        </Typography>
        <Button
          variant="text"
          disabled={filter.length === 0}
          style={{ color: theme.palette.text.secondary }}
          onClick={() => clearFilter(type)}
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
            onClick={() => updateFilter(type, value)}
            variant={filter.includes(value) ? 'filled' : 'outlined'}
          />
        ))}
      </ChipContainer>
    </React.Fragment>
  );
}

interface IFilerSection {
  folderData: IFolderInfo;
  width: number;
  space: number;
  filter: IFilterPros;
  clearFilter: (type: FILTER) => void;
  updateFilter: (type: FILTER, name: string) => void;
}

function Filters({
  folderData,
  width,
  space,
  filter,
  clearFilter,
  updateFilter,
}: IFilerSection): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        width: width - 2 * space,
        marginLeft: space,
        marginBottom: 20,
      }}
    >
      <FilterSection
        name={'Genres'}
        data={folderData.genres}
        filter={filter.genres}
        type={GENRE}
        clearFilter={clearFilter}
        updateFilter={updateFilter}
      />
      <FilterSection
        name={'Actors'}
        data={folderData.actors}
        filter={filter.actors}
        type={ACTOR}
        clearFilter={clearFilter}
        updateFilter={updateFilter}
      />
      <FilterSection
        name={'Studios'}
        data={folderData.studios}
        filter={filter.studios}
        type={STUDIO}
        clearFilter={clearFilter}
        updateFilter={updateFilter}
      />
      <FilterSection
        name={'Tags'}
        data={folderData.tags}
        filter={filter.tags}
        type={TAG}
        clearFilter={clearFilter}
        updateFilter={updateFilter}
      />
    </div>
  );
}

export default Filters;
