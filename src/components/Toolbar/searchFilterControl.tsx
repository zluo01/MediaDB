import { notify } from '@/lib/os';
import { switchFilterType } from '@/lib/queries';
import { FilterType } from '@/type';
import { Accessor } from 'solid-js';

interface ISearchFilterControl {
  readonly folderId: Accessor<number>;
  readonly filterType: Accessor<FilterType>;
}

function SearchFilterControl(props: ISearchFilterControl) {
  async function handleCheckBox() {
    try {
      await switchFilterType(props.folderId());
    } catch (e) {
      await notify(`Switch filter type Error: ${e}`);
    }
  }

  return (
    <input
      type="checkbox"
      checked={props.filterType() === FilterType.AND}
      onChange={handleCheckBox}
      class="toggle ml-2"
    />
  );
}

export default SearchFilterControl;
