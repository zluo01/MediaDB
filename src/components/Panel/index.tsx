import { useQuery } from '@tanstack/solid-query';
import { Link, useLocation } from '@tanstack/solid-router';
import { For, lazy } from 'solid-js';
import { DirectoryButton } from '@/components/Shares';
import { folderListQueryOptions, settingQueryOptions } from '@/lib/queries';
import { cn } from '@/lib/utils';

const DirectoryModal = lazy(() => import('@/components/Modal/Directory'));

function SidePanel() {
	const location = useLocation();

	const isSettingPage = () => location().pathname.includes('/setting');
	const currFolderIndex = () => (location().search.id as number) || 0;

	const settingQuery = useQuery(() => settingQueryOptions());
	const showPanel = () => settingQuery.data?.showSidePanel || false;

	const folderListQuery = useQuery(() => folderListQueryOptions());
	const folderList = () => folderListQuery.data || [];

	const showText = () =>
		showPanel() ? 'text-lg pl-2 max-w-[10vw] truncate inline' : 'hidden';

	const itemStyle = (isActive: boolean) =>
		cn(
			isActive ? 'pointer-events-none opacity-30' : 'pointer-events-auto',
			'btn btn-ghost btn-lg flex w-full flex-row flex-nowrap items-center justify-start'
		);

	return (
		<div
			class={cn(
				showPanel() ? 'w-full max-w-xs' : 'w-fit max-w-[5.5vw]',
				'bg-base-200 h-full'
			)}
		>
			<div class="flex size-full flex-col flex-nowrap items-center justify-between overflow-hidden">
				<div class="flex w-full grow flex-col items-start">
					<For each={folderList()}>
						{folder => {
							const isCurr = () =>
								!isSettingPage() && folder.position === currFolderIndex();
							return (
								<div
									class={cn(!showPanel() && 'tooltip tooltip-bottom')}
									data-tip={folder.name}
								>
									<Link
										to="/"
										search={{
											id: folder.position,
										}}
										class={itemStyle(isCurr())}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											class={cn(!isCurr() && 'text-base-100', 'size-8')}
										>
											<path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
										</svg>
										<span class={showText()}>{folder.name}</span>
									</Link>
								</div>
							);
						}}
					</For>
				</div>
				<div class="divider m-0" />
				<div class="flex w-full flex-col flex-nowrap items-center justify-between">
					<DirectoryButton
						buttonStyle="text-base-100 size-8"
						classes="btn-lg flex w-full flex-row flex-nowrap items-center justify-start"
						showText={showText}
					/>
					<DirectoryModal folderList={folderList} />
					<Link to="/setting" class={itemStyle(isSettingPage())}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class={cn(!isSettingPage() && 'text-base-100', 'size-8')}
						>
							<path
								fill-rule="evenodd"
								d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class={showText()}>Setting</span>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default SidePanel;
