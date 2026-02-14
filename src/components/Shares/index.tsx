import type { AnyFieldApi } from '@tanstack/solid-form';
import type { Accessor } from 'solid-js';
import { cn, openModal } from '@/lib/utils';

export function SkipFolderButton() {
	return (
		<button
			class="btn btn-ghost btn-circle opacity-30 focus:outline-none"
			onClick={() => openModal('skip-folder-modal')}
		>
			<svg
				class="size-6"
				viewBox="0 0 15 15"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
					fill="currentColor"
					fill-rule="evenodd"
					clip-rule="evenodd"
				/>
			</svg>
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
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class={props.buttonStyle}
			>
				<path
					fill-rule="evenodd"
					d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
					clip-rule="evenodd"
				/>
			</svg>
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
