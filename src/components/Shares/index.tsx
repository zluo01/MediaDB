import type { AnyFieldApi } from '@tanstack/solid-form';
import type { Accessor } from 'solid-js';
import { PlusIcon } from '@/components/Icons';
import { cn, openModal } from '@/lib/utils';

export function SkipFolderButton() {
	return (
		<button
			class="btn btn-ghost btn-circle opacity-30 focus:outline-none"
			onClick={() => openModal('skip-folder-modal')}
		>
			<PlusIcon class="size-6" />
			<span class="sr-only">Add skip folder</span>
		</button>
	);
}

interface IDirectoryButtonProps {
	classes: string;
	buttonStyle: string;
	showText?: Accessor<string>;
}

export function DirectoryButton(props: IDirectoryButtonProps) {
	return (
		<button
			class={cn('btn btn-ghost focus:outline-none', props.classes)}
			onClick={() => openModal('directory-modal')}
		>
			<PlusIcon class={props.buttonStyle} />
			<span class={cn('hidden', props.showText?.())}>Add new folder</span>
		</button>
	);
}

interface FormInputHintProps {
	field: AnyFieldApi;
}

export function FormInputHint(props: FormInputHintProps) {
	return (
		<div class="h-4 min-h-4">
			{props.field.state.meta.isTouched &&
			props.field.state.meta.errors.length ? (
				<em class="text-red-500">{props.field.state.meta.errors.join(',')}</em>
			) : null}
			{props.field.state.meta.isValidating ? 'Validating...' : null}
		</div>
	);
}
