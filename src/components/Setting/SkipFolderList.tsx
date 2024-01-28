import { notify } from '@/lib/os';
import { useUpdateSkipFoldersTrigger } from '@/lib/queries';
import { FolderIcon, TrashIcon } from '@heroicons/react/24/solid';
import { ReactElement } from 'react';

interface ISkipFolderListProps {
  skipFolders: string[];
}

function SkipFolderList({ skipFolders }: ISkipFolderListProps): ReactElement {
  const { trigger } = useUpdateSkipFoldersTrigger();

  async function handleRemove(folder: string) {
    try {
      await trigger(skipFolders.filter(o => o !== folder).join(','));
    } catch (e) {
      await notify(`Update Folder Error: ${e}`);
    }
  }

  return (
    <ul className="w-full">
      {skipFolders.map((folder, index) => (
        <li
          className="flex flex-row items-center p-2 text-secondary"
          key={index}
        >
          <FolderIcon className="mr-2 size-8" />
          <span className="flex grow items-center text-base text-primary">
            {folder}
          </span>
          <button
            onClick={() => handleRemove(folder)}
            type="button"
            className="inline-flex items-center rounded-lg bg-none p-2.5 text-center text-sm font-medium text-secondary hover:text-hover focus:outline-none focus:ring-0"
          >
            <TrashIcon className="size-6" />
            <span className="sr-only">Delete filter folder</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default SkipFolderList;
