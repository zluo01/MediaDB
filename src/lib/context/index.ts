import { FilterOption, IFolder, ITVShowData, ModalType } from '@/type';
import isEqual from 'lodash/isEqual';
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
  tags: FilterOption[];
  addTag: (payload: FilterOption) => void;
  setTags: (payload: FilterOption[]) => void;
  clear: (key: string) => void;
  reset: VoidFunction;
}

export const useFilterStore = create<IFilterState>()(set => ({
  tags: [],
  addTag: payload =>
    set(state => {
      if (state.tags.includes(payload)) {
        return {
          tags: state.tags.filter(o => !isEqual(o, payload)),
        };
      } else {
        return {
          tags: [...state.tags, payload],
        };
      }
    }),
  setTags: payload => set({ tags: payload }),
  clear: key =>
    set(state => ({
      tags: state.tags.filter(o => o.tag !== key),
    })),
  reset: () => set({ tags: [] }),
}));
