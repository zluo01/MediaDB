import { createForm } from '@tanstack/solid-form';
import type { Accessor } from 'solid-js';
import type { DOMElement } from 'solid-js/jsx-runtime';
import { FormInputHint } from '@/components/Shares';
import { notify } from '@/lib/os';
import { updateSkipFolder } from '@/lib/queries';
import { closeModal, cn } from '@/lib/utils';

interface ISkipFolderModal {
	skipFolders: Accessor<string[]>;
}

function SkipFolderModal(props: ISkipFolderModal) {
	const form = createForm(() => ({
		defaultValues: {
			folderName: '',
		},
		onSubmit: async ({ value }) => {
			try {
				await updateSkipFolder(
					[...props.skipFolders(), value.folderName].join(',')
				);
				closeModal('skip-folder-modal');
			} catch (e) {
				await notify(`Edit Folder Name Error: ${e}`);
			}
		},
	}));

	async function handleSubmit(
		e: SubmitEvent & { currentTarget: HTMLFormElement; target: DOMElement }
	) {
		e.preventDefault();
		e.stopPropagation();
		await form.handleSubmit();
	}

	return (
		<dialog id="skip-folder-modal" class="modal">
			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box modal-box border p-4">
				<legend class="fieldset-legend text-nowrap">Add Skip Folder</legend>
				<form onSubmit={handleSubmit}>
					<div>
						<form.Field
							name="folderName"
							validators={{
								onChangeAsyncDebounceMs: 500,
								onChangeAsync: async ({ value }) => {
									if (props.skipFolders().includes(value)) {
										return 'Name already exists.';
									}
								},
							}}
							children={field => {
								return (
									<>
										<legend class="fieldset-label">Name</legend>
										<input
											type="text"
											class={cn(
												'input w-full',
												field().state.meta.errors.length && 'border-red-500'
											)}
											placeholder="Folder Name"
											id={field().name}
											name={field().name}
											value={field().state.value}
											onBlur={field().handleBlur}
											onInput={e => field().handleChange(e.target.value)}
											required
										/>
										<FormInputHint field={field()} />
									</>
								);
							}}
						/>
					</div>

					<form.Subscribe
						selector={state => ({
							canSubmit: state.canSubmit,
							isSubmitting: state.isSubmitting,
						})}
						children={state => (
							<button
								class="btn btn-neutral mt-4"
								type="submit"
								disabled={!state().canSubmit}
							>
								{state().isSubmitting ? 'Loading...' : 'Add'}
							</button>
						)}
					/>
				</form>
			</fieldset>
			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	);
}

export default SkipFolderModal;
