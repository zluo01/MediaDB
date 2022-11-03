import { createWrapper } from 'next-redux-wrapper';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Store } from 'redux';

import { IState } from '../../type';
import type { AppDispatch, RootState } from './store';
import { makeStore } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const wrapper = createWrapper<Store<IState>>(makeStore);
