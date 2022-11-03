import { useAppDispatch, useAppSelector } from '@/lib/source';
import { updateFilter } from '@/lib/source/slice/filderReducer';
import { RootState } from '@/lib/source/store';
import { ACTOR, FILTER, GENRE, IFolderInfo, STUDIO, TAG } from '@/type';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React from 'react';

const FilterChip = styled(Chip)(({ theme }) => ({
  color: theme.palette.action.selected,
  borderColor: theme.palette.action.selected,
  margin: theme.spacing(0.5),
}));

const FilterAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'inherit',
  boxShadow: 'none',
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
}));

interface IFilterSection {
  name: string;
  data: string[];
  filter: string[];
  type: FILTER;
  // clearFilter: (type: FILTER) => void;
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

  return (
    <FilterAccordion>
      <AccordionSummary>
        <Typography
          variant="h5"
          component="h3"
          color={theme.palette.text.secondary}
        >
          {name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {Array.from(data)
          .sort()
          .map((value, index) => (
            <FilterChip
              key={index}
              label={value}
              clickable
              onClick={() => updateFilter(type, value)}
              variant={filter.includes(value) ? 'filled' : 'outlined'}
            />
          ))}
      </AccordionDetails>
    </FilterAccordion>
  );
}

interface IFilerSection {
  folderData: IFolderInfo;
  width: number;
  space: number;
}

function Filters({ folderData, width, space }: IFilerSection): JSX.Element {
  const dispatch = useAppDispatch();
  const { tags, genres, actors, studios } = useAppSelector(
    (state: RootState) => state.filter
  );

  function update(tag: FILTER, name: string) {
    dispatch(
      updateFilter({
        tag,
        name,
      })
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        width: width - 2 * space,
        marginBottom: 20,
      }}
    >
      <FilterSection
        name={'Genres'}
        data={folderData.genres}
        filter={genres}
        type={GENRE}
        updateFilter={update}
      />
      <FilterSection
        name={'Actors'}
        data={folderData.actors}
        filter={actors}
        type={ACTOR}
        updateFilter={update}
      />
      <FilterSection
        name={'Studios'}
        data={folderData.studios}
        filter={studios}
        type={STUDIO}
        updateFilter={update}
      />
      <FilterSection
        name={'Tags'}
        data={folderData.tags}
        filter={tags}
        type={TAG}
        updateFilter={update}
      />
    </div>
  );
}

export default Filters;
