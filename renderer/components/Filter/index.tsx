import { Chip, Typography } from '@material-ui/core';
import { styled, useTheme } from '@material-ui/core/styles';
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
  updateFilter: (type: FILTER, name: string) => void;
}

function FilterSection({
  name,
  data,
  type,
  filter,
  updateFilter,
}: IFilterSection): JSX.Element {
  const theme = useTheme();

  // Todo possible use of styled on Typography in the future
  return (
    <React.Fragment>
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
  updateFilter: (type: FILTER, name: string) => void;
}

function Filters({
  folderData,
  width,
  space,
  filter,
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
        updateFilter={updateFilter}
      />
      <FilterSection
        name={'Actors'}
        data={folderData.actors}
        filter={filter.actors}
        type={ACTOR}
        updateFilter={updateFilter}
      />
      <FilterSection
        name={'Studios'}
        data={folderData.studios}
        filter={filter.studios}
        type={STUDIO}
        updateFilter={updateFilter}
      />
      <FilterSection
        name={'Tags'}
        data={folderData.tags}
        filter={filter.tags}
        type={TAG}
        updateFilter={updateFilter}
      />
    </div>
  );
}

export default Filters;
