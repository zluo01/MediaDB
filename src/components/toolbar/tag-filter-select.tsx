import { useFilterStore } from '@/lib/context';
import { FilterOption, GroupedOption } from '@/type';
import Select, { OnChangeValue } from 'react-select';

interface ITagFilterSelectProps {
  options?: GroupedOption[];
}

export function TagFilterSelect({ options }: ITagFilterSelectProps) {
  const { tags, setTags } = useFilterStore();

  function onChange(selectedOptions: OnChangeValue<FilterOption, true>) {
    setTags([...selectedOptions]);
  }

  return (
    <Select
      isMulti
      name="filters"
      options={options}
      className="_select"
      classNamePrefix="_select"
      autoFocus
      hideSelectedOptions
      value={tags}
      onChange={onChange}
    />
  );
}
