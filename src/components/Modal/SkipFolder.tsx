import { notify } from '@/lib/os';
import { updateSkipFolder } from '@/lib/queries';
import { closeModal } from '@/lib/utils';
import { Accessor, createSignal } from 'solid-js';
import { DOMElement } from 'solid-js/jsx-runtime';

interface ISkipFolderModal {
  skipFolders: Accessor<string[]>;
}

function SkipFolderModal({ skipFolders }: ISkipFolderModal) {
  const [folderName, setFolderName] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  async function handleSubmit(
    e: MouseEvent & { currentTarget: HTMLButtonElement; target: DOMElement },
  ) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSkipFolder([...skipFolders(), folderName()].join(','));
      closeModal('skip-folder-modal');
    } catch (e) {
      await notify(`Edit Folder Name Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const invalidPattern = () => `^(?!${skipFolders().join('$|')}$).+$`;

  return (
    <dialog id="skip-folder-modal" class="modal">
      <fieldset class="fieldset bg-base-200 border-base-300 rounded-box modal-box border p-4">
        <legend class="fieldset-legend text-nowrap">Add Skip Folder</legend>

        <legend class="fieldset-label">Name</legend>
        <input
          type="text"
          class="input validator w-full"
          placeholder="Folder Name"
          value={folderName()}
          onInput={e => setFolderName(e.target.value)}
          disabled={loading()}
          pattern={invalidPattern()}
          required
        />
        <p class="validator-hint">Name already exists.</p>

        <button class="btn btn-neutral mt-4" onClick={handleSubmit}>
          {loading() ? 'Loading...' : 'Add'}
        </button>
      </fieldset>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default SkipFolderModal;
