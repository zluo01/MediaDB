import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  name: '',
  path: '',
};

export const directoryModalSlice = createSlice({
  name: 'directoryModal',
  initialState,
  reducers: {
    updateName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    updatePath: (state, action: PayloadAction<string>) => {
      state.path = action.payload;
    },
    updateDirectoryData: (
      state,
      action: PayloadAction<{ name: string; path: string }>
    ) => {
      state.name = action.payload.name;
      state.path = action.payload.path;
    },
    openDirectoryModal: state => {
      state.open = true;
    },
    closeDirectoryModal: () => initialState,
  },
});

export const {
  updateName,
  updatePath,
  updateDirectoryData,
  openDirectoryModal,
  closeDirectoryModal,
} = directoryModalSlice.actions;

export default directoryModalSlice.reducer;
