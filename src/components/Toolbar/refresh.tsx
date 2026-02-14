import type { Accessor } from 'solid-js';
import type { DOMElement } from 'solid-js/jsx-runtime';
import { RefreshIcon } from '@/components/Icons';
import { notify } from '@/lib/os';
import { createLibrary } from '@/lib/queries';

type RefreshButtonProps = {
	folderId: Accessor<number>;
	folderName: Accessor<string>;
	folderPath: Accessor<string>;
	disabled: Accessor<boolean>;
};

export default function RefreshButton(props: RefreshButtonProps) {
	async function updateLibrary(
		e: MouseEvent & { currentTarget: HTMLButtonElement; target: DOMElement }
	) {
		e.preventDefault();
		try {
			await createLibrary(
				props.folderName(),
				props.folderPath(),
				props.folderId(),
				true
			);
		} catch (e) {
			await notify(`Update Library Error: ${e}`);
		}
	}

	return (
		<button
			class="btn btn-ghost"
			onClick={updateLibrary}
			disabled={props.disabled()}
		>
			<RefreshIcon class="mr-2 size-3.5" />
			Refresh
		</button>
	);
}
