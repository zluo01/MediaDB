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
import { getDirectory, notify } from '@/lib/os';
import { useCreateLibraryTrigger } from '@/lib/queries';
import { IFolder, ModalType } from '@/type';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import React, { ReactElement, useState } from 'react';

interface IDirectoryModal {
  folderList?: IFolder[];
}

function DirectoryModal({ folderList }: IDirectoryModal): ReactElement {
  const { modalState, closeModal } = useModalStore();

  const [folderName, setFolderName] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [loading, setLoading] = useState(false);

  const open = modalState === ModalType.DIRECTORY;
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
    closeModal();
  }

  async function onClose() {
    if (!loading) {
      close();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-xl overflow-hidden rounded-lg border-0 bg-primary text-left align-middle shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base/7 font-semibold text-white">
            Add Directory
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm/6 font-medium text-white">Name</Label>
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
            <DialogDescription
              className={clsx(
                error ? 'inline-block' : 'hidden',
                'text-sm/6 text-red-500',
              )}
            >
              Name already exists.
            </DialogDescription>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm/6 font-medium text-white">
              Directory
            </Label>
            <div className="flex flex-row flex-nowrap">
              <Input
                className={clsx(
                  'mt-3 block w-full rounded-l-lg rounded-r-none border-none bg-white/5 py-1.5 pl-3 text-sm/6 text-white',
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
                <DotsHorizontalIcon className="size-6" />
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={!folderPath || error || loading}
            onClick={handleSubmit}
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

export default DirectoryModal;
