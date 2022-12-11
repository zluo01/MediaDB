import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  name: '',
};

export const skipFolderModalSlice = createSlice({
  name: 'skipFolderModal',
  initialState,
  reducers: {
    updateSkipFolderName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    openSkipFolderModal: state => {
      state.open = true;
    },
    closeSkipFolderModal: () => initialState,
  },
});

export const {
  updateSkipFolderName,
  openSkipFolderModal,
  closeSkipFolderModal,
} = skipFolderModalSlice.actions;

export default skipFolderModalSlice.reducer;
