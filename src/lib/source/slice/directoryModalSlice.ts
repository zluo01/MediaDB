import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
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
      action: PayloadAction<{ name: string; path: string }>,
    ) => {
      state.name = action.payload.name;
      state.path = action.payload.path;
    },
  },
});

export const { updateName, updatePath, updateDirectoryData } =
  directoryModalSlice.actions;

export default directoryModalSlice.reducer;
