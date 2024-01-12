import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const searchSlice = createSlice({
  name: 'search',
  initialState: '',
  reducers: {
    search: (_, action: PayloadAction<string>) => action.payload,
  },
});

export const { search } = searchSlice.actions;

export default searchSlice.reducer;
