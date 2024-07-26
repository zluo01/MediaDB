import {
  EMPTY_FILTERS,
  FILTER,
  IFilterAction,
  IFolder,
  ITags,
  ITVShowData,
  ModalType,
} from '@/type';
import cloneDeep from 'lodash/cloneDeep';
import { create } from 'zustand';

interface IMenuPayload {
  folder?: IFolder;
  data?: ITVShowData;
}

interface IMenuState extends IMenuPayload {
  menuStatus: boolean;
  openMenu: (payload: IMenuPayload) => void;
  closeMenu: VoidFunction;
}

export const useMenuStore = create<IMenuState>()(set => ({
  menuStatus: false,
  openMenu: payload =>
    set({
      menuStatus: true,
      ...payload,
    }),
  closeMenu: () => set({ menuStatus: false }),
}));

interface ISearchState {
  searchKey: string;
  search: (key: string) => void;
}

export const useSearchStore = create<ISearchState>()(set => ({
  searchKey: '',
  search: key => set({ searchKey: key }),
}));

interface IModalState {
  modalState: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: VoidFunction;
}

export const useModalStore = create<IModalState>()(set => ({
  modalState: ModalType.NONE,
  openModal: type => set({ modalState: type }),
  closeModal: () => set({ modalState: ModalType.NONE }),
}));

interface IFilterState {
  tags: ITags;
  addTag: (payload: IFilterAction) => void;
  setTags: (payload: IFilterAction[]) => void;
  clear: (key: FILTER) => void;
  reset: VoidFunction;
}

export const useFilterStore = create<IFilterState>()(set => ({
  tags: cloneDeep(EMPTY_FILTERS),
  addTag: payload =>
    set(state => {
      const { tag, value } = payload;
      const filterValue = state.tags[tag];
      if (filterValue.includes(value)) {
        return {
          tags: {
            ...state.tags,
            [tag]: filterValue.filter(o => o !== value),
          },
        };
      } else {
        return {
          tags: {
            ...state.tags,
            [tag]: [...state.tags[tag], value],
          },
        };
      }
    }),
  setTags: payload => set({ tags: filterTags(payload) }),
  clear: key =>
    set(state => ({
      tags: {
        ...state.tags,
        [key]: [],
      },
    })),
  reset: () => set({ tags: cloneDeep(EMPTY_FILTERS) }),
}));

function filterTags(payload: IFilterAction[]) {
  const tags = cloneDeep(EMPTY_FILTERS);
  payload.forEach(o => tags[o.tag].push(o.value));
  return tags;
}
