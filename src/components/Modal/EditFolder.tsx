import { getDirectory, notify } from '@/lib/os';
import { invalidateForFolderPathChange } from '@/lib/queries';
import { updateFolderPathFromStorage } from '@/lib/storage';
import { closeModal } from '@/lib/utils';
import { IFolder } from '@/type';
import { Accessor, createSignal } from 'solid-js';
import { DOMElement } from 'solid-js/jsx-runtime';

interface IFolderNameEdit {
  folder: Accessor<IFolder | undefined>;
}

function EditFolderModal({ folder }: IFolderNameEdit) {
  const folderPath = () => folder()?.path || '';

  const [path, setPath] = createSignal(folderPath());
  const [loading, setLoading] = createSignal(false);

  async function handleDirectory() {
    setPath(await getDirectory());
  }

  async function handleSubmit(
    e: MouseEvent & { currentTarget: HTMLButtonElement; target: DOMElement },
  ) {
    if (!folder()) {
      return;
    }
    e.preventDefault();
    setLoading(true);
    try {
      await updateFolderPathFromStorage({ ...folder()!, path: path() });
      await invalidateForFolderPathChange(folder()!.position);
      closeModal('edit-folder-modal');
    } catch (e) {
      await notify(`Edit Folder Name Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <dialog id="edit-folder-modal" class="modal">
      <fieldset class="fieldset bg-base-200 border-base-300 rounded-box modal-box border p-4">
        <legend class="fieldset-legend text-nowrap">Edit Folder</legend>

        <legend class="fieldset-legend">Name</legend>
        <input
          type="text"
          class="input validator w-full"
          value={folder()?.name || ''}
          disabled
        />

        <legend class="fieldset-legend">Directory</legend>
        <div class="join w-full">
          <input
            class="input join-item grow"
            type="text"
            placeholder="Folder Path"
            value={folderPath()}
            onInput={e => setPath(e.target.value)}
            disabled={loading()}
            autofocus
            required
          />
          <button type="button" class="btn join-item" onClick={handleDirectory}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="size-6"
            >
              <path
                d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        <button class="btn btn-neutral mt-4" onClick={handleSubmit}>
          {loading() ? 'Loading...' : 'Change'}
        </button>
      </fieldset>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default EditFolderModal;
