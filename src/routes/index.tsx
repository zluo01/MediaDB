import { useQuery } from '@tanstack/solid-query';
import { createFileRoute, useLocation } from '@tanstack/solid-router';
import { ErrorBoundary, Match, Suspense, Switch } from 'solid-js';
import Content from '@/components/Content';
import ErrorHandler from '@/components/Error';
import Footer from '@/components/Footer';
import { Loading } from '@/components/Loading';
import Filter from '@/components/Toolbar/filter';
import RefreshButton from '@/components/Toolbar/refresh';
import SortMenu from '@/components/Toolbar/sort-menu';
import { folderDataQueryOptions } from '@/lib/queries';
import { FilterType, FolderStatus, SORT } from '@/type';

export const Route = createFileRoute('/')({
	component: () => {
		const location = useLocation();
		const folderId = () => (location().search.id as number) || 0;
		const basedInformationQuery = useQuery(() =>
			folderDataQueryOptions(folderId())
		);

		const folderName = () => basedInformationQuery.data?.name || '';
		const folderPath = () => basedInformationQuery.data?.path || '';
		const sortType = () => basedInformationQuery.data?.sort || SORT.DEFAULT;
		const filterType = () =>
			basedInformationQuery.data?.filterType || FilterType.OR;
		const shouldDisabled = () =>
			basedInformationQuery.data?.status !== FolderStatus.NONE;

		return (
			<div class="bg-base-300 size-full overflow-y-auto scroll-smooth">
				<ErrorBoundary fallback={<div />}>
					<Suspense fallback={<Loading />}>
						<Switch>
							<Match
								when={
									basedInformationQuery.data?.status === FolderStatus.LOADING
								}
							>
								<Loading />
							</Match>
							<Match
								when={basedInformationQuery.data?.status === FolderStatus.ERROR}
							>
								<ErrorHandler
									folderName={folderName()}
									folderPath={folderPath()}
									folderPosition={folderId()}
								/>
							</Match>
							<Match
								when={basedInformationQuery.data?.status === FolderStatus.NONE}
							>
								<div class="relative flex flex-col p-8">
									<div class="bg-base-300 sticky top-0 z-10 flex flex-row flex-nowrap items-center gap-2 py-2">
										<hr class="ml-1 grow opacity-30" />
										<Filter
											folderId={folderId}
											filterType={filterType}
											disabled={shouldDisabled}
										/>
										<SortMenu folderId={folderId} sortType={sortType} />
										<RefreshButton
											folderId={folderId}
											folderName={folderName}
											folderPath={folderPath}
											disabled={shouldDisabled}
										/>
									</div>
									<Content
										folderId={folderId}
										folderPath={folderPath}
										filterType={filterType}
									/>
								</div>
								<Footer />
							</Match>
						</Switch>
					</Suspense>
				</ErrorBoundary>
			</div>
		);
	},
});
