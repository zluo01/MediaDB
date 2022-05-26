import { AnyAction, createReducer } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

import {
  IState,
  NOTIFICATION,
  SEARCH,
  UPDATE_FOLDER,
  UPDATE_SETTING,
} from '../../../type';
import { getFolders, getSetting } from '../../store';

const initialState: IState = {
  search: '',
  setting: getSetting(),
  folders: getFolders(),
  error: {
    open: false,
    msg: '',
  },
};

const reducer = createReducer(initialState, builder => {
  builder
    .addCase(HYDRATE, (state, action: AnyAction) => ({
      ...state,
      ...action.payload,
    }))
    .addCase(SEARCH, (state, action: AnyAction) => {
      state.search = action.payload;
    })
    .addCase(UPDATE_FOLDER, (state, action: AnyAction) => {
      state.folders = action.payload;
    })
    .addCase(UPDATE_SETTING, (state, action: AnyAction) => {
      state.setting = action.payload;
    })
    .addCase(NOTIFICATION, (state, action: AnyAction) => {
      state.error = action.payload;
    })
    .addDefaultCase((state, _action: AnyAction) => state);
});

export default reducer;
