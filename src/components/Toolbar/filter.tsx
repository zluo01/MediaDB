import { mediaTagsQueryOptions } from '@/lib/queries';
import { openModal } from '@/lib/utils';
import { createQuery } from '@tanstack/solid-query';
import { Accessor, lazy } from 'solid-js';

const TagFilter = lazy(() => import('@/components/Modal/TagFilter'));

interface IFilerSection {
  folderId: Accessor<number>;
  disabled: Accessor<boolean>;
  filterType: Accessor<number>;
}

function Filters({ folderId, disabled, filterType }: IFilerSection) {
  const groupOptionsQuery = createQuery(() =>
    mediaTagsQueryOptions(folderId()),
  );

  const groupOptions = () => groupOptionsQuery.data || [];

  return (
    <>
      <button
        class="btn btn-ghost focus:outline-none"
        disabled={disabled()}
        onClick={() => openModal('filter-modal')}
      >
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
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
          />
        </svg>
        Filter
      </button>
      <TagFilter
        folderId={folderId}
        groupOptions={groupOptions}
        filterType={filterType}
      />
    </>
  );
}

export default Filters;
