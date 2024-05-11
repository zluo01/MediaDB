import { useAppDispatch, useAppSelector } from '@/lib/context';
import { closeModal } from '@/lib/context/slice/modalSlice';
import { RootState } from '@/lib/context/store';
import { getDirectory, notify } from '@/lib/os';
import { useGetFolderQuery, useUpdateFolderPathTrigger } from '@/lib/queries';
import { ModalType } from '@/type';
import {
  Button,
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
import React, { ReactElement, useEffect, useState } from 'react';

interface IFolderNameEdit {
  index: number;
}

function EditFolderModal({ index }: IFolderNameEdit): ReactElement {
  const dispatch = useAppDispatch();
  const modalStatus = useAppSelector((state: RootState) => state.modal);

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
    dispatch(closeModal());
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
    <Transition appear show={modalStatus === ModalType.EDIT_FOLDER}>
      <Dialog as="div" className="relative z-10" onClose={close}>
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
                    Edit Directory
                  </Legend>
                  <Field>
                    <Label className="text-sm/6 font-medium text-white">
                      Name
                    </Label>
                    <Input
                      className={clsx(
                        'mt-3 block w-full rounded-lg bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                        'focus:outline-none disabled:pointer-events-none disabled:opacity-30',
                      )}
                      type="text"
                      value={folder?.name || ''}
                      disabled
                    />
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
                        disabled={loading}
                        onChange={e => setPath(e.target.value)}
                        value={path}
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
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? 'loading...' : 'Change'}
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

export default EditFolderModal;
