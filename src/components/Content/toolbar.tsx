import { notify } from '@/lib/os';
import {
  useCreateLibraryTrigger,
  useUpdateSortTypeTrigger,
} from '@/lib/queries';
import { IFolderData, SORT } from '@/type';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import {
  ArrowPathIcon,
  Bars3BottomLeftIcon,
  FunnelIcon,
} from '@heroicons/react/24/solid';
import React, { Fragment, lazy, Suspense, useState } from 'react';

const FilterSection = lazy(() => import('./filter'));

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
  folderData?: IFolderData;
  disabled: boolean;
}

function SortingMenu({ folderData, disabled }: ISortingMenuProps) {
  const { trigger: sortTypeTrigger } = useUpdateSortTypeTrigger(
    folderData?.position || 0,
  );

  async function update(type: SORT) {
    await sortTypeTrigger(type);
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        disabled={disabled}
        className="inline-flex items-center rounded-md bg-transparent px-3.5 py-1 text-center text-base font-medium text-selected hover:bg-selected hover:text-hover focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-30"
      >
        <Bars3BottomLeftIcon className="mr-2 size-3.5" />
        {folderData && sortTypeLabel(folderData.sort)}
      </MenuButton>
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 z-30 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-secondary text-selected shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="p-1 ">
            {folderData &&
              Object.keys(SORT)
                .filter(key => !isNaN(Number(key)))
                .map(key => Number(key))
                .filter(o => o !== folderData.sort)
                .map(type => (
                  <MenuItem key={type}>
                    <button
                      className="group flex w-full items-center rounded-md p-2 text-sm hover:bg-selected hover:text-hover"
                      onClick={() => update(type)}
                    >
                      {sortTypeLabel(type)}
                    </button>
                  </MenuItem>
                ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

interface IToolbarProps {
  folderInfo?: IFolderData;
  disabled: boolean;
}

function Toolbar({ folderInfo, disabled }: IToolbarProps) {
  const [open, setOpen] = useState(false);

  const { trigger: createLibraryTrigger } = useCreateLibraryTrigger(
    folderInfo?.position || 0,
  );

  async function updateLibrary(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    if (!folderInfo) {
      return;
    }
    e.preventDefault();
    try {
      await createLibraryTrigger({
        folder: { ...folderInfo },
        update: true,
      });
    } catch (e) {
      await notify(`Update Library Error: ${e}`);
    }
  }

  return (
    <Fragment>
      <div className="flex flex-row flex-nowrap items-center gap-2">
        <hr className="ml-1 grow border-[#3b4956]" />
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-transparent px-3.5 py-1 text-center text-base font-medium text-selected hover:bg-selected hover:text-hover focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-30"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          <FunnelIcon className="mr-2 size-3.5" />
          Filter
        </button>
        <SortingMenu folderData={folderInfo} disabled={disabled} />
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-transparent px-3.5 py-1 text-center text-base font-medium text-selected hover:bg-selected hover:text-hover focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-30"
          disabled={disabled}
          onClick={updateLibrary}
        >
          <ArrowPathIcon className="mr-2 size-3.5" />
          Refresh
        </button>
      </div>
      <Suspense>
        <FilterSection
          folderIndex={folderInfo?.position || 0}
          open={open}
          close={() => setOpen(false)}
        />
      </Suspense>
    </Fragment>
  );
}

export default Toolbar;
