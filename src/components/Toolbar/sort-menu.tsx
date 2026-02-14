import { type Accessor, For } from 'solid-js';
import { SortIcon } from '@/components/Icons';
import { updateSortType } from '@/lib/queries';
import { SORT } from '@/type';

function sortTypeLabel(sortType: SORT): string {
	switch (sortType) {
		case SORT.DEFAULT:
			return 'Directory';
		case SORT.TITLE_ASC:
			return 'Name(A-Z)';
		case SORT.TITLE_DSC:
			return 'Name(Z-A)';
		case SORT.YEAR_ASC:
			return 'Oldest';
		case SORT.YEAR_DSC:
			return 'Newest';
	}
}

interface ISortingMenuProps {
	readonly folderId: Accessor<number>;
	readonly sortType: Accessor<SORT>;
}

function SortMenu(props: ISortingMenuProps) {
	return (
		<div class="dropdown">
			<div tabIndex="0" role="button" class="btn btn-ghost m-1">
				<SortIcon class="mr-2 size-3.5" />
				{sortTypeLabel(props.sortType())}
			</div>
			<ul
				tabIndex="0"
				class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
			>
				<For
					each={Object.keys(SORT)
						.filter(key => !Number.isNaN(Number(key)))
						.map(key => Number(key))
						.filter(o => o !== props.sortType())}
				>
					{type => (
						<li onClick={() => updateSortType(props.folderId(), type)}>
							<a>{sortTypeLabel(type)}</a>
						</li>
					)}
				</For>
			</ul>
		</div>
	);
}

export default SortMenu;
