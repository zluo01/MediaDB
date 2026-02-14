import { type Accessor, For } from 'solid-js';
import { FolderIcon, TrashIcon } from '@/components/Icons';
import { notify } from '@/lib/os';
import { updateSkipFolder } from '@/lib/queries';

interface ISkipFolderListProps {
	readonly skipFolders: Accessor<string[]>;
}

function SkipFolderList(props: ISkipFolderListProps) {
	async function handleRemove(folder: string) {
		try {
			await updateSkipFolder(
				props
					.skipFolders()
					.filter(o => o !== folder)
					.join(',')
			);
		} catch (e) {
			await notify(`Remove Skip Folder Error: ${e}`);
		}
	}

	return (
		<ul class="list bg-base-100 rounded-box shadow-md">
			<For each={props.skipFolders()}>
				{folder => (
					<li class="list-row">
						<FolderIcon class="mr-2 size-8" />
						<span class="flex grow items-center text-base">{folder}</span>
						<button
							onClick={() => handleRemove(folder)}
							class="btn btn-circle btn-ghost"
						>
							<TrashIcon class="size-6" />
						</button>
					</li>
				)}
			</For>
		</ul>
	);
}

export default SkipFolderList;
