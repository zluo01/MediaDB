import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useModalStore } from '@/lib/context';
import { getDirectory, notify } from '@/lib/os';
import { useGetFolderQuery, useUpdateFolderPathTrigger } from '@/lib/queries';
import { ModalType } from '@/type';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import React, { ReactElement, useEffect, useState } from 'react';

interface IFolderNameEdit {
  index: number;
}

function EditFolderModal({ index }: IFolderNameEdit): ReactElement {
  const { modalState, closeModal } = useModalStore();

  const { data: folder } = useGetFolderQuery(index);
  const { trigger } = useUpdateFolderPathTrigger(folder?.position || 0);

  const [path, setPath] = useState(folder?.path || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folder?.path) {
      setPath(folder?.path);
    }
  }, [folder?.path]);

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
      closeModal();
    } catch (e) {
      await notify(`Edit Folder Name Error: ${e}`);
    }
  }

  return (
    <Dialog
      open={modalState === ModalType.EDIT_FOLDER}
      onOpenChange={closeModal}
    >
      <DialogContent className="w-full max-w-xl overflow-hidden rounded-lg border-0 bg-primary text-left align-middle shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base/7 font-semibold text-white">
            Edit Directory
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm/6 font-medium text-white">Name</Label>
            <Input
              className={clsx(
                'mt-3 block w-full rounded-lg bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                'focus:outline-none disabled:pointer-events-none disabled:opacity-30',
              )}
              type="text"
              value={folder?.name || ''}
              disabled
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm/6 font-medium text-white">
              Directory
            </Label>
            <div className="flex flex-row flex-nowrap">
              <Input
                className={clsx(
                  'mt-3 block w-full rounded-l-lg rounded-r-none border-none bg-white/5 py-1.5 pl-3 text-sm/6 text-white',
                  'focus:outline-none data-[focus]:outline-none',
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
                <DotsHorizontalIcon className="size-6" />
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleSubmit}
            disabled={loading}
            className={clsx(
              'border-selected bg-default px-4 py-2 text-sm font-medium text-selected',
              'hover:bg-selected hover:text-hover',
            )}
          >
            {loading ? 'loading...' : 'Change'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditFolderModal;
