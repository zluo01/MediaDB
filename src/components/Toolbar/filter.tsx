import { useQuery } from '@tanstack/solid-query';
import { type Accessor, lazy } from 'solid-js';
import { FilterIcon } from '@/components/Icons';
import { mediaTagsQueryOptions } from '@/lib/queries';
import { openModal } from '@/lib/utils';

const TagFilter = lazy(() => import('@/components/Modal/TagFilter'));

interface IFilerSection {
	folderId: Accessor<number>;
	disabled: Accessor<boolean>;
	filterType: Accessor<number>;
}

function Filters(props: IFilerSection) {
	const groupOptionsQuery = useQuery(() =>
		mediaTagsQueryOptions(props.folderId())
	);

	const groupOptions = () => groupOptionsQuery.data || [];

	return (
		<>
			<button
				class="btn btn-ghost focus:outline-none"
				disabled={props.disabled()}
				onClick={() => openModal('filter-modal')}
			>
				<FilterIcon class="mr-2 size-3.5" />
				Filter
			</button>
			<TagFilter
				folderId={props.folderId}
				groupOptions={groupOptions}
				filterType={props.filterType}
			/>
		</>
	);
}

export default Filters;
