import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useModalStore } from '@/lib/context';
import { notify } from '@/lib/os';
import { useUpdateSkipFoldersTrigger } from '@/lib/queries';
import { ModalType } from '@/type';
import clsx from 'clsx';
import React, { ReactElement, useState } from 'react';

interface ISkipFolderModal {
  skipFolders: string[];
}

function SkipFolderModal({ skipFolders }: ISkipFolderModal): ReactElement {
  const { modalState, closeModal } = useModalStore();

  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const error = folderName && skipFolders.includes(folderName);

  const { trigger } = useUpdateSkipFoldersTrigger();

  function close() {
    setFolderName('');
    closeModal();
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
    <Dialog open={modalState === ModalType.SKIP_FOLDER} onOpenChange={close}>
      <DialogContent className="w-full max-w-xl overflow-hidden rounded-lg border-0 bg-primary text-left align-middle shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base/7 font-semibold text-white">
            Add Skip Folder
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm/6 font-medium text-white">Name</Label>
            <Input
              className={clsx(
                error && 'border border-red-500',
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
            <DialogDescription
              className={clsx(
                error ? 'inline-block' : 'hidden',
                'text-sm/6 text-red-500',
              )}
            >
              Name already exists.
            </DialogDescription>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleSubmit}
            disabled={error || loading}
            className={clsx(
              'border-selected bg-default px-4 py-2 text-sm font-medium text-selected',
              'hover:bg-selected hover:text-hover',
            )}
          >
            {loading ? 'loading...' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SkipFolderModal;
