import { useAppDispatch, useAppSelector } from '@/lib/context';
import { closeModal } from '@/lib/context/slice/modalSlice';
import { RootState } from '@/lib/context/store';
import { getDirectory, notify } from '@/lib/os';
import { useCreateLibraryTrigger } from '@/lib/queries';
import { IFolder, ModalType } from '@/type';
import {
  Button,
  Description,
  Dialog,
  DialogPanel,
  Field,
  Fieldset,
  Input,
  Label,
  Legend,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import React, { ReactElement, useState } from 'react';

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
    <Transition appear show={open}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0 transform-[scale(95%)]"
          enterTo="opacity-100 transform-[scale(100%)]"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 transform-[scale(100%)]"
          leaveTo="opacity-0 transform-[scale(95%)]"
        >
          <div className="fixed inset-0 bg-secondary/75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="w-full max-w-xl overflow-hidden rounded-lg bg-primary text-left align-middle shadow-xl transition-all">
                <Fieldset className="space-y-6 rounded-xl bg-white/5 p-6 sm:p-10">
                  <Legend className="text-base/7 font-semibold text-white">
                    Add Directory
                  </Legend>
                  <Field>
                    <Label className="text-sm/6 font-medium text-white">
                      Name
                    </Label>
                    <Input
                      className={clsx(
                        error ? 'border border-red-500' : '',
                        'mt-3 block w-full rounded-lg bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                        'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
                      )}
                      type="text"
                      value={folderName}
                      onChange={e => setFolderName(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <Description
                      className={clsx(
                        error ? 'inline-block' : 'hidden',
                        'text-sm/6 text-red-500',
                      )}
                    >
                      Name already exists.
                    </Description>
                  </Field>
                  <Field>
                    <Label className="text-sm/6 font-medium text-white">
                      Directory
                    </Label>
                    <div className="flex flex-row flex-nowrap">
                      <Input
                        className={clsx(
                          'mt-3 block w-full rounded-l-lg border-none bg-white/5 py-1.5 pl-3 text-sm/6 text-white',
                          'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
                        )}
                        type="text"
                        value={folderPath}
                        onChange={e => setFolderPath(e.target.value)}
                        disabled={loading}
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        className={clsx(
                          'mt-3 items-center rounded-r-lg border-[#1a2634] bg-white/5 px-3 py-1.5',
                          'text-center text-sm text-secondary',
                          'hover:bg-gray-700 hover:text-selected focus:outline-none focus:ring-0',
                        )}
                        onClick={handleDirectory}
                      >
                        <EllipsisHorizontalIcon className="size-6" />
                      </button>
                    </div>
                  </Field>
                  <div className="flex w-full justify-end bg-default">
                    <Button
                      className={clsx(
                        'inline-flex w-20 cursor-pointer justify-center rounded-md border border-selected bg-default px-4 py-2 text-sm font-medium text-selected',
                        'hover:bg-selected hover:text-hover focus:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:text-hover',
                      )}
                      disabled={!folderPath || error || loading}
                      onClick={handleSubmit}
                    >
                      {loading ? 'loading...' : 'Add'}
                    </Button>
                  </div>
                </Fieldset>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default DirectoryModal;
