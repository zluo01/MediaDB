import { IControlState } from '@/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: IControlState = {
  search: '',
};

export const controlSlice = createSlice({
  name: 'control',
  initialState,
  reducers: {
    search: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const { search } = controlSlice.actions;

export default controlSlice.reducer;
