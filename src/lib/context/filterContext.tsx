import { hasTag } from '@/lib/utils';
import { FilterOption } from '@/type';
import filter from 'lodash/filter';
import isEqual from 'lodash/isEqual';
import slice from 'lodash/slice';
import {
  createContext,
  createSignal,
  ParentComponent,
  useContext,
} from 'solid-js';

function useProviderValue() {
  const [tags, setTags] = createSignal<FilterOption[]>([]);

  function changeTag(tag: FilterOption) {
    setTags(prev => {
      if (hasTag(prev, tag)) {
        return filter(prev, o => !isEqual(o, tag));
      } else {
        return [...prev, tag];
      }
    });
  }

  function removeLastTag() {
    setTags(prev => slice(prev, 0, -1));
  }

  return { tags, changeTag, removeLastTag };
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
