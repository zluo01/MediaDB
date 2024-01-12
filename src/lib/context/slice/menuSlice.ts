import { IFolder, ITVShowData } from '@/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IMenuPayload {
  folder?: IFolder;
  data?: ITVShowData;
}
interface IMenuState extends IMenuPayload {
  open: boolean;
}

const initialState: IMenuState = {
  open: false,
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    openMenu: (_, action: PayloadAction<IMenuPayload>) => ({
      open: true,
      ...action.payload,
    }),
    closeMenu: () => initialState,
  },
});

export const { openMenu, closeMenu } = menuSlice.actions;

export default menuSlice.reducer;
