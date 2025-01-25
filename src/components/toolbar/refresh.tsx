import { Button } from '@/components/ui/button';
import { notify } from '@/lib/os';
import { createLibrary, useGetFolderDataQuery } from '@/lib/queries';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import React from 'react';

type RefreshButtonProps = {
  folderId: number;
};

export default function RefreshButton({ folderId }: RefreshButtonProps) {
  const { data, isLoading } = useGetFolderDataQuery(folderId);

  async function updateLibrary(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    if (!data) {
      return;
    }
    try {
      await createLibrary({ ...data }, true);
    } catch (e) {
      await notify(`Update Library Error: ${e}`);
    }
  }

  return (
    <Button
      variant="ghost"
      className="text-base font-medium text-selected hover:bg-selected hover:text-hover"
      onClick={updateLibrary}
      disabled={isLoading}
    >
      <ArrowPathIcon className="mr-2 size-3.5" />
      Refresh
    </Button>
  );
}
