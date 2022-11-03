import { configureStore } from '@reduxjs/toolkit';
import { MakeStore, Context } from 'next-redux-wrapper';
import { Store } from 'redux';

import { IState } from '../../../type';
import reducer from '../reducer';

const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== 'production',
});

export const makeStore: MakeStore<Store<IState>> = (_context: Context) => store;

// Infer the `RootState` and `AppDispatch` types from the source itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
