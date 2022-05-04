import { AnyAction, Dispatch } from 'redux';

import {
  IFolder,
  ISetting,
  SEARCH,
  UPDATE_FOLDER,
  UPDATE_SETTING,
} from '../../../type';

export const search = (dispatch: Dispatch, payload: string): AnyAction => {
  return dispatch({
    type: SEARCH,
    payload,
  });
};

export const updateSetting = (
  dispatch: Dispatch,
  payload: ISetting
): AnyAction => {
  return dispatch({
    type: UPDATE_SETTING,
    payload,
  });
};

export const updateFolder = (
  dispatch: Dispatch,
  payload: IFolder[]
): AnyAction => {
  return dispatch({
    type: UPDATE_FOLDER,
    payload,
  });
};

export const notify = (
  dispatch: Dispatch,
  open: boolean,
  msg: string
): AnyAction => {
  return dispatch({
    type: UPDATE_FOLDER,
    payload: {
      open,
      msg,
    },
  });
};
