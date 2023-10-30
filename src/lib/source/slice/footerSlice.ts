import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  content: '',
};

export const footerSlice = createSlice({
  name: 'footer',
  initialState,
  reducers: {
    update: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
    },
  },
});

export const { update } = footerSlice.actions;

export default footerSlice.reducer;
