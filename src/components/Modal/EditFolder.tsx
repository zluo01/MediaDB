import { createForm } from '@tanstack/solid-form';
import { exists } from '@tauri-apps/plugin-fs';
import type { Accessor } from 'solid-js';
import type { DOMElement } from 'solid-js/jsx-runtime';
import { EllipsisIcon } from '@/components/Icons';
import { FormInputHint } from '@/components/Shares';
import { getDirectory, notify } from '@/lib/os';
import { invalidateForFolderPathChange } from '@/lib/queries';
import { updateFolderPathFromStorage } from '@/lib/storage';
import { closeModal } from '@/lib/utils';
import type { IFolder } from '@/type';

interface IFolderNameEdit {
	folder: Accessor<IFolder | undefined>;
}

function EditFolderModal(props: IFolderNameEdit) {
	const form = createForm(() => ({
		defaultValues: {
			folderPath: props.folder()?.path || '',
		},
		onSubmit: async ({ value }) => {
			if (!props.folder()) {
				return;
			}
			try {
				await updateFolderPathFromStorage({
					...props.folder()!,
					path: value.folderPath,
				});
				await invalidateForFolderPathChange(props.folder()!.position);
				closeModal('edit-folder-modal');
			} catch (e) {
				await notify(`Edit Folder Error: ${e}`);
			}
		},
	}));

	async function handleDirectory() {
		form.setFieldValue('folderPath', await getDirectory());
		form.validateField('folderPath', 'change');
	}

	async function handleSubmit(
		e: SubmitEvent & { currentTarget: HTMLFormElement; target: DOMElement }
	) {
		e.preventDefault();
		e.stopPropagation();
		await form.handleSubmit();
	}

	return (
		<dialog id="edit-folder-modal" class="modal">
			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box modal-box border p-4">
				<legend class="fieldset-legend text-nowrap">Edit Folder</legend>

				<legend class="fieldset-label">Name</legend>
				<input
					type="text"
					class="input validator w-full"
					value={props.folder()?.name || ''}
					disabled
				/>

				<form onSubmit={handleSubmit}>
					<div>
						<form.Field
							name="folderPath"
							validators={{
								onChangeAsyncDebounceMs: 500,
								onChangeAsync: async ({ value }) => {
									const pathExists = await exists(value);
									if (!pathExists) {
										return 'Path does not exist.';
									}
								},
							}}
							children={field => {
								return (
									<>
										<legend class="fieldset-label">Directory</legend>
										<div class="join w-full">
											<input
												class="input join-item grow"
												type="text"
												placeholder="Folder Path"
												id={field().name}
												name={field().name}
												value={field().state.value}
												onBlur={field().handleBlur}
												onInput={e => field().handleChange(e.target.value)}
												autofocus
												required
											/>
											<button
												type="button"
												class="btn join-item"
												onClick={handleDirectory}
											>
												<EllipsisIcon class="size-6" />
											</button>
										</div>
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
								{state().isSubmitting ? 'Loading...' : 'Save'}
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

export default EditFolderModal;
