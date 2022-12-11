import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
};

export const editFolderModalSlice = createSlice({
  name: 'editFolderModal',
  initialState,
  reducers: {
    openEditFolderModal: state => {
      state.open = true;
    },
    closeEditFolderModal: () => initialState,
  },
});

export const { openEditFolderModal, closeEditFolderModal } =
  editFolderModalSlice.actions;

export default editFolderModalSlice.reducer;
