import { createForm } from '@tanstack/solid-form';
import { exists } from '@tauri-apps/plugin-fs';
import type { Accessor } from 'solid-js';
import type { DOMElement } from 'solid-js/jsx-runtime';
import { FormInputHint } from '@/components/Shares';
import { getDirectory, notify } from '@/lib/os';
import { createLibrary } from '@/lib/queries';
import { closeModal, cn } from '@/lib/utils';
import type { IFolder } from '@/type';

interface IDirectoryModal {
	readonly folderList: Accessor<IFolder[]>;
}

function DirectoryModal(props: IDirectoryModal) {
	const form = createForm(() => ({
		defaultValues: {
			folderName: '',
			folderPath: '',
		},
		onSubmit: async ({ value }) => {
			try {
				await createLibrary(value.folderName, value.folderPath, 0);
				closeModal('directory-modal');
			} catch (e) {
				await notify(`Import Folders Error: ${e}`);
			}
		},
	}));

	async function handleDirectory() {
		const path = await getDirectory();
		const name = path.split('\\')!.pop()!.split('/').pop() as string;
		form.setFieldValue('folderName', name);
		form.setFieldValue('folderPath', path);
		form.validateField('folderName', 'change');
		form.validateField('folderPath', 'change');
	}

	async function handleSubmit(
		e: SubmitEvent & { currentTarget: HTMLFormElement; target: DOMElement }
	) {
		e.preventDefault();
		e.stopPropagation();
		await form.handleSubmit();
	}

	const folderNameList = () => props.folderList().map(o => o.name);

	return (
		<dialog id="directory-modal" class="modal">
			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box modal-box border p-4">
				<legend class="fieldset-legend text-nowrap">Add New Folder</legend>
				<form onSubmit={handleSubmit}>
					<div>
						<form.Field
							name="folderName"
							validators={{
								onChangeAsyncDebounceMs: 500,
								onChangeAsync: async ({ value }) => {
									if (folderNameList().includes(value)) {
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
													/>
												</svg>
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

export default DirectoryModal;
