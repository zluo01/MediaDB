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
import { Checkbox } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/16/solid';
import { PlusIcon } from '@heroicons/react/24/solid';
import { lazy, ReactElement, Suspense } from 'react';

const SkipFolderModal = lazy(() => import('@/components/Modal/SkipFolder'));

function Setting(): ReactElement {
  const dispatch = useAppDispatch();

  const { trigger } = useHidePanelTrigger();
  const { data: setting } = useGetSettingQuery();
  const { data: version } = useGetVersionQuery();

  async function handleCheckBox(checked: boolean) {
    try {
      await trigger(checked);
    } catch (e) {
      await notify(`Check Box Error: ${e}`);
    }
  }

  if (!setting) {
    return <Loading />;
  }
  return (
    <div className="mx-auto size-full max-w-2xl py-5">
      <span className="text-5xl font-medium text-primary">Setting</span>
      <hr className="mt-3 w-full border-[#505962]" />
      <div className="flex items-center p-2">
        <Checkbox
          checked={setting.showSidePanel}
          onChange={handleCheckBox}
          className="group size-6 cursor-pointer rounded bg-white/10 p-1 ring-1 ring-inset ring-white/15 data-[checked]:bg-white"
        >
          <CheckIcon className="hidden size-4 fill-black group-data-[checked]:block" />
        </Checkbox>
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
          <PlusIcon className="size-6" />
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
          <PlusIcon className="size-6" />
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
