import { Loading } from '@/components/Loading';
import SkipFolderModal from '@/components/Modal/SkipFolder';
import FolderList from '@/components/Setting/FolderList';
import SkipFolderList from '@/components/Setting/SkipFolderList';
import { DirectoryButton, SkipFolderButton } from '@/components/Shares';
import { notify } from '@/lib/os';
import { changePanelDisplay, settingQueryOptions } from '@/lib/queries';
import { useQuery } from '@tanstack/solid-query';
import { createFileRoute } from '@tanstack/solid-router';
import { getVersion } from '@tauri-apps/api/app';
import { Show } from 'solid-js';

export const Route: any = createFileRoute('/setting')({
  loader: async () => await getVersion(),
  component: () => {
    const version = Route.useLoaderData();

    const settingQuery = useQuery(() => settingQueryOptions());
    const skipFolders = () => settingQuery.data?.skipFolders || [];

    async function handleCheckBox(
      e: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement },
    ) {
      try {
        await changePanelDisplay(e.target.checked);
      } catch (e) {
        await notify(`Check Box Error: ${e}`);
      }
    }

    return (
      <Show when={settingQuery.isSuccess} fallback={<Loading />}>
        <div class="mx-auto size-full max-w-4xl cursor-default py-5">
          <span class="text-5xl font-medium">Setting</span>
          <div class="divider" />
          <div class="flex items-center p-2">
            <label class="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                class="checkbox rounded-md"
                checked={settingQuery.data?.showSidePanel}
                onChange={handleCheckBox}
              />
              <span class="text-base font-medium">
                Show Slide Panel Button Name.
              </span>
            </label>
          </div>
          <div class="flex w-full flex-row items-center justify-between px-4">
            <span class="py-3 text-lg opacity-30">Imported Folders</span>
            <DirectoryButton
              buttonStyle="size-6"
              className="btn-circle opacity-30"
            />
          </div>
          <FolderList />
          <div class="flex w-full flex-row items-center justify-between px-4">
            <span class="py-3 text-lg opacity-30">Skipped Folders</span>
            <SkipFolderButton />
            <SkipFolderModal skipFolders={skipFolders} />
          </div>
          <SkipFolderList skipFolders={skipFolders} />
          <div class="divider" />
          <span class="flex items-center justify-end px-2 opacity-30">
            {`v${version()}`}
          </span>
        </div>
      </Show>
    );
  },
});
