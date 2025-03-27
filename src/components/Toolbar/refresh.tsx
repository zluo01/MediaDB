import { notify } from '@/lib/os';
import { createLibrary, folderDataQueryOptions } from '@/lib/queries';
import { createQuery } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { DOMElement } from 'solid-js/jsx-runtime';

type RefreshButtonProps = {
  folderId: Accessor<number>;
};

export default function RefreshButton({ folderId }: RefreshButtonProps) {
  const folderDataQuery = createQuery(() => folderDataQueryOptions(folderId()));

  async function updateLibrary(
    e: MouseEvent & { currentTarget: HTMLButtonElement; target: DOMElement },
  ) {
    e.preventDefault();
    if (!folderDataQuery.data) {
      return;
    }
    try {
      const { name, path, position } = folderDataQuery.data;
      await createLibrary(name, path, position, true);
    } catch (e) {
      await notify(`Update Library Error: ${e}`);
    }
  }

  return (
    <button
      class="btn btn-ghost"
      onClick={updateLibrary}
      disabled={folderDataQuery.isLoading}
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
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
      Refresh
    </button>
  );
}
