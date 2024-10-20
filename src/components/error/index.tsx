import { Button } from '@/components/ui/button';
import { notify } from '@/lib/os';
import { useCreateLibraryTrigger } from '@/lib/queries';
import { IFolderData } from '@/type';
import { ReloadIcon } from '@radix-ui/react-icons';
import React from 'react';

interface IErrorHandlerProps {
  folderInfo: IFolderData;
}

export default function ErrorHandler({ folderInfo }: IErrorHandlerProps) {
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
    <div className="inset-0 flex h-full flex-col items-center justify-center space-y-1.5 text-xl text-white">
      <p>Encounter Error When Building Directory.</p>
      <p>Refresh to Retry.</p>
      <Button
        variant="ghost"
        size="icon"
        className="  rounded-full p-0 text-selected hover:bg-selected hover:text-hover focus:outline-none focus:ring-0"
        onClick={updateLibrary}
      >
        <ReloadIcon className="size-6" />
      </Button>
    </div>
  );
}
