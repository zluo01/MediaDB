import { useAppDispatch, useAppSelector } from '@/lib/context';
import { closeModal } from '@/lib/context/slice/modalSlice';
import { RootState } from '@/lib/context/store';
import { notify } from '@/lib/os';
import { useUpdateSkipFoldersTrigger } from '@/lib/queries';
import { ModalType } from '@/type';
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
import clsx from 'clsx';
import React, { ReactElement, useState } from 'react';

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
    <Transition appear show={modalStatus === ModalType.SKIP_FOLDER}>
      <Dialog as="div" className="relative z-10" onClose={close}>
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
                    Add Skip Folder
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
                      autoFocus
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
                  <div className="flex w-full justify-end bg-default">
                    <Button
                      className={clsx(
                        'inline-flex w-20 cursor-pointer justify-center rounded-md border border-selected bg-default px-4 py-2 text-sm font-medium text-selected',
                        'hover:bg-selected hover:text-hover focus:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:text-hover disabled:opacity-30',
                      )}
                      onClick={handleSubmit}
                      disabled={error || loading}
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

export default SkipFolderModal;
