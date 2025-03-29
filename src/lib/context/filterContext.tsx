import {
  modifyTagInFolder,
  removeFolderFromStore,
  removeLastTagInFolder,
} from '@/lib/context/helper';
import { FilterOption } from '@/type';
import { Map, OrderedSet } from 'immutable';
import {
  createContext,
  createSignal,
  ParentComponent,
  useContext,
} from 'solid-js';

function useProviderValue() {
  const [tags, setTags] =
    createSignal<Map<number, OrderedSet<FilterOption>>>(Map());

  const getTags = (folderId: number) => tags().get(folderId) || OrderedSet();

  function modifyTag(folderId: number, tag: FilterOption) {
    setTags(prev => modifyTagInFolder(prev, folderId, tag));
  }

  function removeLastTag(folderId: number) {
    setTags(prev => removeLastTagInFolder(prev, folderId));
  }

  function removeTagFolder(folderId: number) {
    setTags(prev => removeFolderFromStore(prev, folderId));
  }

  return { getTags, modifyTag, removeLastTag, removeTagFolder };
}

type ContextType = ReturnType<typeof useProviderValue>;

const FilterContext = createContext<ContextType | undefined>(undefined);

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}

export const FilterProvider: ParentComponent = props => {
  const value = useProviderValue();
  return (
    <FilterContext.Provider value={value}>
      {props.children}
    </FilterContext.Provider>
  );
};
