import Loading from '@/components/Loading';
import FolderList from '@/components/Setting/FolderList';
import SkipFolderList from '@/components/Setting/SkipFolderList';
import { useAppDispatch } from '@/lib/context';
import { openModal } from '@/lib/context/slice/modalSlice';
import { notify } from '@/lib/os';
import {
  useGetSettingQuery,
  useGetVersionQuery,
  useHidePanelTrigger,
} from '@/lib/queries';
import { ModalType } from '@/type';
import { PlusIcon } from '@heroicons/react/24/solid';
import React, { lazy, ReactElement, Suspense } from 'react';

const SkipFolderModal = lazy(() => import('@/components/Modal/SkipFolder'));

function Setting(): ReactElement {
  const dispatch = useAppDispatch();

  const { trigger } = useHidePanelTrigger();
  const { data: setting } = useGetSettingQuery();
  const { data: version } = useGetVersionQuery();

  async function handleCheckBox(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      await trigger(event.target.checked);
    } catch (e) {
      await notify(`Check Box Error: ${e}`);
    }
  }

  if (!setting) {
    return <Loading />;
  }
  return (
    <div className="mx-auto h-full w-full max-w-2xl py-5">
      <span className="text-5xl font-medium text-primary">Setting</span>
      <hr className="mt-3 w-full border-[#505962]" />
      <div className="flex items-center p-2">
        <input
          onChange={handleCheckBox}
          id="default-checkbox"
          type="checkbox"
          checked={setting.showSidePanel}
          className="h-4 w-4 rounded focus:outline-none focus:ring-0"
        />
        <label
          htmlFor="default-checkbox"
          className="ml-2 text-base font-medium text-primary"
        >
          Show Slide Panel Button Name.
        </label>
      </div>
      <div className="flex w-full flex-row items-center justify-between px-2">
        <span className="py-2 text-lg text-secondary">Imported Folders</span>
        <button
          onClick={() => dispatch(openModal(ModalType.DIRECTORY))}
          type="button"
          className="inline-flex items-center rounded-lg bg-none p-2.5 text-center text-sm font-medium text-secondary hover:text-hover focus:outline-none focus:ring-0"
        >
          <PlusIcon className="h-6 w-6" />
          <span className="sr-only">Add new folder</span>
        </button>
      </div>
      <FolderList />
      <div className="flex w-full flex-row items-center justify-between px-2">
        <span className="py-3 text-lg text-secondary">Skipped Folders</span>
        <button
          onClick={() => dispatch(openModal(ModalType.SKIP_FOLDER))}
          type="button"
          className="inline-flex items-center rounded-lg bg-none p-2.5 text-center text-sm font-medium text-secondary hover:text-hover focus:outline-none focus:ring-0"
        >
          <PlusIcon className="h-6 w-6" />
          <span className="sr-only">Add skip folder</span>
        </button>
      </div>
      <SkipFolderList skipFolders={setting.skipFolders} />
      <Suspense>
        <SkipFolderModal skipFolders={setting.skipFolders} />
      </Suspense>
      <hr className="my-2 w-full border-[#505962]" />
      <span className="flex items-center justify-end px-2 text-sm text-primary">
        {`v${version}`}
      </span>
    </div>
  );
}

export default Setting;
