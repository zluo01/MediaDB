import { Context, createWrapper, HYDRATE, MakeStore } from 'next-redux-wrapper';
import { AnyAction, createStore, Dispatch, Store } from 'redux';

import {
  IFolder,
  IFolderAction,
  IReduxState,
  ISetting,
  ISettingAction,
  UPDATE_FOLDER,
  UPDATE_SETTING,
} from '../type';
import { getFolders, getSetting } from '../utils/store';

const initState: IReduxState = {
  setting: getSetting(),
  folders: getFolders(),
};

// create your reducer
const reducer = (state: IReduxState = initState, action: AnyAction) => {
  switch (action.type) {
    case HYDRATE:
      // Attention! This will overwrite client state! Real apps should use proper reconciliation.
      return { ...state, ...action.payload };
    case UPDATE_FOLDER:
      return {
        ...state,
        folders: action.payload,
      };
    case UPDATE_SETTING:
      return { ...state, setting: action.payload };
    default:
      return state;
  }
};

export const updateSetting = (
  dispatch: Dispatch<ISettingAction>,
  payload: ISetting
): AnyAction => {
  return dispatch({
    type: UPDATE_SETTING,
    payload: payload,
  });
};

export const updateFolder = (
  dispatch: Dispatch<IFolderAction>,
  payload: IFolder[]
): AnyAction => {
  return dispatch({
    type: UPDATE_FOLDER,
    payload: payload,
  });
};

// create a makeStore function
const makeStore: MakeStore<Store<IReduxState>> = (_context: Context) =>
  createStore(reducer);

// export an assembled wrapper
export const wrapper = createWrapper<Store<IReduxState>>(makeStore);
