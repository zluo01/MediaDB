import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  name: '',
};

export const skipFolderModalSlice = createSlice({
  name: 'skipFolderModal',
  initialState,
  reducers: {
    updateSkipFolderName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
  },
});

export const { updateSkipFolderName } = skipFolderModalSlice.actions;

export default skipFolderModalSlice.reducer;
