import controlReducer from '@/lib/source/slice/controlSlice';
import directoryModalReducer from '@/lib/source/slice/directoryModalSlice';
import editFolderModalReducer from '@/lib/source/slice/editFolderModalSlice';
import filterReducer from '@/lib/source/slice/filterReducer';
import footerReducer from '@/lib/source/slice/footerSlice';
import skipFolderModalReducer from '@/lib/source/slice/skipFolderModalSlice';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    footer: footerReducer,
    control: controlReducer,
    directoryModal: directoryModalReducer,
    editFolderModal: editFolderModalReducer,
    skipFolderModal: skipFolderModalReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the source itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
