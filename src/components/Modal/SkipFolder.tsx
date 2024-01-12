import { useAppDispatch, useAppSelector } from '@/lib/context';
import { closeModal } from '@/lib/context/slice/modalSlice';
import { RootState } from '@/lib/context/store';
import { notify } from '@/lib/os';
import { useUpdateSkipFoldersTrigger } from '@/lib/queries';
import classNames from '@/lib/utils';
import { ModalType } from '@/type';
import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, ReactElement, useState } from 'react';

interface ISkipFolderModal {
  skipFolders: string[];
}

function SkipFolderModal({ skipFolders }: ISkipFolderModal): ReactElement {
  const dispatch = useAppDispatch();
  const modalStatus = useAppSelector((state: RootState) => state.modal);

  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const error = folderName && skipFolders.includes(folderName);

  const { trigger } = useUpdateSkipFoldersTrigger();

  function close() {
    setFolderName('');
    dispatch(closeModal());
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      await trigger([...skipFolders, folderName].join(','));
      close();
    } catch (e) {
      await notify(`Edit Folder Name Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Transition
      appear
      show={modalStatus === ModalType.SKIP_FOLDER}
      as={Fragment}
    >
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
                  Add Skip Folder
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
                      autoFocus
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
                </div>
                <div className="flex w-full justify-end bg-default p-4">
                  <button
                    type="button"
                    className="inline-flex w-20 cursor-pointer justify-center rounded-md border border-selected bg-default px-4 py-2 text-sm font-medium text-selected hover:bg-selected hover:text-hover focus:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:text-hover disabled:opacity-30"
                    onClick={handleSubmit}
                    disabled={error || loading}
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

export default SkipFolderModal;
