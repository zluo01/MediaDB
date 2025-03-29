import { updateSortType } from '@/lib/queries';
import { SORT } from '@/type';
import { Accessor, For } from 'solid-js';

function sortTypeLabel(sortType: SORT): string {
  switch (sortType) {
    case SORT.DEFAULT:
      return 'Directory';
    case SORT.TITLE_ASC:
      return 'Name(A-Z)';
    case SORT.TITLE_DSC:
      return 'Name(Z-A)';
    case SORT.YEAR_ASC:
      return 'Oldest';
    case SORT.YEAR_DSC:
      return 'Newest';
  }
}

interface ISortingMenuProps {
  folderId: Accessor<number>;
  sortType: Accessor<SORT>;
}

function SortMenu({ folderId, sortType }: ISortingMenuProps) {
  return (
    <div class="dropdown">
      <div tabIndex="0" role="button" class="btn btn-ghost m-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="mr-2 size-3.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
          />
        </svg>
        {sortTypeLabel(sortType())}
      </div>
      <ul
        tabIndex="0"
        class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
      >
        <For
          each={Object.keys(SORT)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key))
            .filter(o => o !== sortType())}
        >
          {type => (
            <li onClick={() => updateSortType(folderId(), type)}>
              <a>{sortTypeLabel(type)}</a>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

export default SortMenu;
