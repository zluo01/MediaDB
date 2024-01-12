import { ModalType } from '@/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const directoryModalSlice = createSlice({
  name: 'modal',
  initialState: ModalType.NONE,
  reducers: {
    openModal: (_, action: PayloadAction<ModalType>) => action.payload,
    closeModal: () => ModalType.NONE,
  },
});

export const { openModal, closeModal } = directoryModalSlice.actions;

export default directoryModalSlice.reducer;
