import { EMPTY_FILTERS, FILTER, IFilterProps, ITags } from '@/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ITags = EMPTY_FILTERS;

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    reset: (state, action: PayloadAction<FILTER>) => {
      return { ...state, [action.payload]: [] };
    },
    updateFilter: (state, action: PayloadAction<IFilterProps>) => {
      const { tag, name } = action.payload;
      const filterValue = state[action.payload.tag];
      if (filterValue.includes(name)) {
        return {
          ...state,
          [tag]: filterValue.filter(o => o !== name),
        };
      }
      return {
        ...state,
        [tag]: [...state[tag], name],
      };
    },
  },
});

export const { reset, updateFilter } = filterSlice.actions;

export default filterSlice.reducer;
