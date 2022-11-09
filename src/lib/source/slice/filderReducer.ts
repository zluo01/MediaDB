import {
  ACTOR,
  FILTER,
  GENRE,
  IFilterProps,
  IFilterState,
  STUDIO,
  TAG,
} from '@/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: IFilterState = {
  tags: [],
  genres: [],
  actors: [],
  studios: [],
};

function getFilterSets(value: string[], name: string): string[] {
  if (value.includes(name)) {
    return value.filter(o => o !== name);
  }
  return [...value, name];
}

export const filterSlice = createSlice({
  name: 'control',
  initialState,
  reducers: {
    reset: (state, action: PayloadAction<FILTER>) => {
      switch (action.payload) {
        case TAG:
          state.tags = [];
          break;
        case GENRE:
          state.genres = [];
          break;
        case ACTOR:
          state.actors = [];
          break;
        case STUDIO:
          state.studios = [];
          break;
      }
    },
    updateFilter: (state, action: PayloadAction<IFilterProps>) => {
      switch (action.payload.tag) {
        case TAG:
          state.tags = getFilterSets(state.tags, action.payload.name);
          break;
        case GENRE:
          state.genres = getFilterSets(state.genres, action.payload.name);
          break;
        case ACTOR:
          state.actors = getFilterSets(state.actors, action.payload.name);
          break;
        case STUDIO:
          state.studios = getFilterSets(state.studios, action.payload.name);
          break;
      }
    },
  },
});

export const { reset, updateFilter } = filterSlice.actions;

export default filterSlice.reducer;
