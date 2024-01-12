import { useAppDispatch, useAppSelector } from '@/lib/context';
import { closeModal } from '@/lib/context/slice/modalSlice';
import { RootState } from '@/lib/context/store';
import { getDirectory, notify } from '@/lib/os';
import { useCreateLibraryTrigger } from '@/lib/queries';
import classNames from '@/lib/utils';
import { IFolder, ModalType } from '@/type';
import { Dialog, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import React, { Fragment, ReactElement, useState } from 'react';

interface IDirectoryModal {
  folderList?: IFolder[];
}

function DirectoryModal({ folderList }: IDirectoryModal): ReactElement {
  const dispatch = useAppDispatch();
  const modalStatus = useAppSelector((state: RootState) => state.modal);

  const [folderName, setFolderName] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [loading, setLoading] = useState(false);

  const open = modalStatus === ModalType.DIRECTORY;
  const error = folderName && folderList?.map(o => o.name).includes(folderName);

  const { trigger: createLibraryTrigger } = useCreateLibraryTrigger(
    folderList?.length || 0,
  );

  async function handleDirectory() {
    const path = await getDirectory();
    const name = path.split('\\')!.pop()!.split('/').pop() as string;
    setFolderName(name);
    setFolderPath(path);
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      await createLibraryTrigger({
        folder: { position: 0, name: folderName, path: folderPath },
      });
      close();
    } catch (e) {
      await notify(`Import Folders Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setFolderName('');
    setFolderPath('');
    dispatch(closeModal());
  }

  async function onClose() {
    if (!loading) {
      close();
    }
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
                  Add Directory
                </Dialog.Title>
                <div className="flex flex-col items-center justify-around bg-default p-4">
                  <div className="mb-3 w-full ">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-secondary"
                      htmlFor="grid-folder-name"
                    >
                      Name
                    </label>
                    <input
                      className={classNames(
                        error ? 'border-red-500' : '',
                        'block w-full appearance-none text-primary border-b-2 border-[#1a2634] bg-default px-2 py-3 leading-tight focus:outline-none',
                      )}
                      id="grid-folder-name"
                      type="text"
                      value={folderName}
                      onChange={e => setFolderName(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <p
                      className={classNames(
                        error ? 'inline-block' : 'hidden',
                        'text-xs italic text-red-500',
                      )}
                    >
                      Name already exists.
                    </p>
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
                        value={folderPath}
                        onChange={e => setFolderPath(e.target.value)}
                        disabled={loading}
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
                    disabled={!folderPath || error || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? 'loading...' : 'Add'}
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

export default DirectoryModal;
