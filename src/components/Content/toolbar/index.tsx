import Filter from '@/components/Content/toolbar/filter';
import SortMenu from '@/components/Content/toolbar/sort-menu';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/os';
import { useCreateLibraryTrigger } from '@/lib/queries';
import { IFolderData } from '@/type';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import React from 'react';

interface IToolbarProps {
  folderInfo: IFolderData;
}

function Toolbar({ folderInfo }: IToolbarProps) {
  const { trigger: createLibraryTrigger } = useCreateLibraryTrigger(
    folderInfo.position,
  );

  async function updateLibrary(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
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
    <div className="sticky top-0 z-10 flex flex-row flex-nowrap items-center gap-2 bg-default py-2">
      <hr className="ml-1 grow border-[#3b4956]" />
      <Filter folderIndex={folderInfo.position} />
      <SortMenu folderData={folderInfo} />
      <Button
        variant="ghost"
        className="text-base font-medium text-selected hover:bg-selected hover:text-hover"
        onClick={updateLibrary}
      >
        <ArrowPathIcon className="mr-2 size-3.5" />
        Refresh
      </Button>
    </div>
  );
}

export default Toolbar;
