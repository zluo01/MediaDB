import { useQuery } from '@tanstack/solid-query';
import { Link, useLocation, useSearch } from '@tanstack/solid-router';
import { For, lazy } from 'solid-js';
import { FolderIcon, SettingsIcon } from '@/components/Icons';
import { DirectoryButton } from '@/components/Shares';
import { folderListQueryOptions, settingQueryOptions } from '@/lib/queries';
import { cn } from '@/lib/utils';

const DirectoryModal = lazy(() => import('@/components/Modal/Directory'));

function SidePanel() {
	const location = useLocation();
	const search = useSearch({ from: '/' });

	const isSettingPage = () => location().pathname.includes('/setting');
	const currFolderIndex = () => search().id;

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
										<FolderIcon
											class={cn(!isCurr() && 'text-base-100', 'size-8')}
										/>
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
						<SettingsIcon
							class={cn(!isSettingPage() && 'text-base-100', 'size-8')}
						/>
						<span class={showText()}>Setting</span>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default SidePanel;
