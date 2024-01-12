import filterReducer from '@/lib/context/slice/filterSlice';
import menuReducer from '@/lib/context/slice/menuSlice';
import modalReducer from '@/lib/context/slice/modalSlice';
import searchReducer from '@/lib/context/slice/searchSlice';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    search: searchReducer,
    modal: modalReducer,
    filter: filterReducer,
    menu: menuReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the source itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
