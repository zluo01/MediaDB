import { useQuery } from '@tanstack/solid-query';
import { createSignal, For, lazy } from 'solid-js';
import { EditIcon, FolderIcon, TrashIcon } from '@/components/Icons';
import { useFilter } from '@/lib/context/filterContext';
import { folderListQueryOptions, removeFolder } from '@/lib/queries';
import { openModal } from '@/lib/utils';
import type { IFolder } from '@/type';

const EditFolderModal = lazy(() => import('@/components/Modal/EditFolder'));

function FolderList() {
	const { removeTagFolder } = useFilter();

	const folderListQuery = useQuery(() => folderListQueryOptions());
	const folderList = () => folderListQuery.data || [];

	const [folder, selectFolder] = createSignal<IFolder>();

	function open(folder: IFolder) {
		selectFolder(folder);
		openModal('edit-folder-modal');
	}

	async function remove(folder: IFolder) {
		await removeFolder(folder);
		removeTagFolder(folder.position);
	}

	return (
		<>
			<ul class="list bg-base-100 rounded-box shadow-md">
				<For each={folderList()}>
					{folder => (
						<li class="list-row">
							<FolderIcon class="mr-2 size-8" />
							<div>
								<div>{folder.name}</div>
								<div class="text-xs font-semibold uppercase opacity-60">
									{folder.path}
								</div>
							</div>
							<button
								onClick={() => open(folder)}
								class="btn btn-circle btn-ghost focus:outline-none"
							>
								<EditIcon class="size-6" />
							</button>
							<button
								onClick={() => remove(folder)}
								class="btn btn-circle btn-ghost focus:outline-none"
							>
								<TrashIcon class="size-6" />
							</button>
						</li>
					)}
				</For>
			</ul>
			<EditFolderModal folder={folder} />
		</>
	);
}

export default FolderList;
