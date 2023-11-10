import { modalStatus } from '@/lib/controls';
import { getDirectory, notify } from '@/lib/os';
import { useGetFolderQuery, useUpdateFolderPathTrigger } from '@/lib/queries';
import { ModalType } from '@/type';
import { Dialog, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { computed } from '@preact/signals-react';
import React, { Fragment, ReactElement, useEffect, useState } from 'react';

interface IFolderNameEdit {
  index: number;
}

function EditFolderModal({ index }: IFolderNameEdit): ReactElement {
  const open = computed(() => modalStatus.value === ModalType.EDIT_FOLDER);

  const { data: folder } = useGetFolderQuery(index);
  const { trigger } = useUpdateFolderPathTrigger(folder?.position || 0);

  const [path, setPath] = useState(folder?.path || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folder?.path) {
      setPath(folder?.path);
    }
  }, [folder?.path]);

  function close() {
    modalStatus.value = ModalType.NONE;
  }

  async function handleDirectory() {
    setPath(await getDirectory());
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    if (!folder) {
      return;
    }
    e.preventDefault();
    setLoading(true);
    try {
      await trigger({ ...folder, path });
      setLoading(false);
      setPath('');
      close();
    } catch (e) {
      await notify(`Edit Folder Name Error: ${e}`);
    }
  }

  return (
    <Transition appear show={open.value} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-secondary/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl overflow-hidden rounded-lg bg-primary text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="px-3 py-5 text-2xl font-medium leading-6 text-primary"
                >
                  Edit Directory
                </Dialog.Title>
                <div className="flex flex-col items-center justify-around bg-default p-4">
                  <div className="mb-3 w-full">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-secondary"
                      htmlFor="grid-folder-name"
                    >
                      Name
                    </label>
                    <input
                      className="block w-full appearance-none border-b-2 border-[#1a2634] bg-default px-2 py-3 leading-tight text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-30"
                      id="grid-folder-name"
                      type="text"
                      value={folder?.name || ''}
                      disabled
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-secondary"
                      htmlFor="grid-directory-name"
                    >
                      Directory
                    </label>
                    <div className="flex flex-row flex-nowrap">
                      <input
                        className="flex grow appearance-none border-b-2 border-[#1a2634] bg-default p-2 leading-tight text-primary focus:outline-none"
                        id="grid-directory-name"
                        type="text"
                        disabled={loading}
                        onChange={e => setPath(e.target.value)}
                        value={path}
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        className="inline-flex items-center border-b-2 border-[#1a2634] bg-none p-2 text-center text-sm font-medium text-secondary hover:text-hover focus:outline-none focus:ring-0"
                        onClick={handleDirectory}
                      >
                        <EllipsisHorizontalIcon className="h-8 w-8" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex w-full justify-end bg-default p-4">
                  <button
                    type="button"
                    className="inline-flex cursor-pointer justify-center rounded-md border border-selected bg-default px-4 py-2 text-sm font-medium text-selected hover:bg-selected hover:text-hover focus:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:text-hover"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'loading...' : 'Change'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditFolderModal;
