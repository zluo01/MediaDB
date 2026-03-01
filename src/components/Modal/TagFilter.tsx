import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import { type Accessor, For } from 'solid-js';
import SearchFilterControl from '@/components/Toolbar/searchFilterControl';
import { TagFilterSelect } from '@/components/Toolbar/tag-filter-select';
import { useFilter } from '@/lib/context/filterContext';
import { hasTag } from '@/lib/context/helper';
import { cn } from '@/lib/utils';
import type { FilterType, GroupedOption } from '@/type';

type ITagFilterProps = {
	readonly folderId: Accessor<number>;
	readonly filterType: Accessor<FilterType>;
	readonly groupOptions: Accessor<GroupedOption[]>;
};

function TagFilter(props: ITagFilterProps) {
	const { getTags, modifyTag } = useFilter();
	const tags = () => getTags(props.folderId());

	const options = () => filter(props.groupOptions(), group => !isEmpty(group));

	return (
		<dialog id="filter-modal" class="modal">
			<div class="modal-box h-[61.8vh] w-[61.8vw] max-w-[61.8vw]">
				<div class="relative flex flex-col gap-6">
					<div class="flex flex-row items-center">
						<TagFilterSelect folderId={props.folderId} groupOptions={options} />
						<SearchFilterControl
							folderId={props.folderId}
							filterType={props.filterType}
						/>
					</div>
					<For each={options()}>
						{groupOption => {
							return (
								<div class="bg-base-100 border-base-300 collapse border">
									<input type="radio" name="tag-options" />
									<div class="collapse-title capitalize">
										{groupOption.label}
									</div>
									<div class="collapse-content flex flex-row flex-wrap space-x-1 gap-y-2 text-sm">
										<For each={groupOption.options}>
											{option => (
												<div
													onClick={() => modifyTag(props.folderId(), option)}
													class={cn(
														'badge badge-outline hover:badge-ghost cursor-pointer px-2.5 py-0.5 text-sm font-medium',
														hasTag(tags(), option) && 'badge-soft'
													)}
												>
													{option.label}
												</div>
											)}
										</For>
									</div>
								</div>
							);
						}}
					</For>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	);
}

export default TagFilter;
