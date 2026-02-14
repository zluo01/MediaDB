import type { DOMElement } from 'solid-js/jsx-runtime';
import { RefreshIcon } from '@/components/Icons';
import { notify } from '@/lib/os';
import { createLibrary } from '@/lib/queries';

interface IErrorHandlerProps {
	folderName: string;
	folderPath: string;
	folderPosition: number;
}

export default function ErrorHandler(props: IErrorHandlerProps) {
	async function updateLibrary(
		e: MouseEvent & { currentTarget: HTMLButtonElement; target: DOMElement }
	) {
		e.preventDefault();
		try {
			await createLibrary(
				props.folderName,
				props.folderPath,
				props.folderPosition,
				true
			);
		} catch (e) {
			await notify(`Update Library Error: ${e}`);
		}
	}

	return (
		<div class="fixed inset-0 flex h-full flex-col items-center justify-center space-y-1.5 text-xl">
			<p>Encounter Error When Building Directory.</p>
			<p>Refresh to Retry.</p>
			<button
				class="btn btn-circle btn-ghost rounded-full p-0 focus:ring-0 focus:outline-none"
				onClick={updateLibrary}
			>
				<RefreshIcon class="size-6" />
			</button>
		</div>
	);
}
