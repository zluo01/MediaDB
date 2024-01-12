import { EMPTY_FILTERS, FILTER, IFilterAction } from '@/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const filterSlice = createSlice({
  name: 'filter',
  initialState: EMPTY_FILTERS,
  reducers: {
    filter: (state, action: PayloadAction<IFilterAction>) => {
      const { tag, name } = action.payload;
      const filterValue = state[tag];
      if (filterValue.includes(name)) {
        return {
          ...state,
          [tag]: filterValue.filter(o => o !== name),
        };
      } else {
        return {
          ...state,
          [tag]: [...state[tag], name],
        };
      }
    },
    clear: (state, action: PayloadAction<FILTER>) => ({
      ...state,
      [action.payload]: [],
    }),
    reset: () => EMPTY_FILTERS,
  },
});

export const { filter, clear, reset } = filterSlice.actions;

export default filterSlice.reducer;
