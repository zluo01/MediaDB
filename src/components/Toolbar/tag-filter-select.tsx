import { type Accessor, createSignal, For, Show } from 'solid-js';
import { useFilter } from '@/lib/context/filterContext';
import { hasTag } from '@/lib/context/helper';
import { cn } from '@/lib/utils';
import type { GroupedOption } from '@/type';

type ITagFilterSelectProps = {
	readonly folderId: Accessor<number>;
	readonly groupOptions: Accessor<GroupedOption[]>;
};

export function TagFilterSelect(props: ITagFilterSelectProps) {
	const { getTags, modifyTag, removeLastTag } = useFilter();
	const tags = () => getTags(props.folderId());

	const [search, setSearch] = createSignal('');
	const normalizedSearch = () => search().trim().toLowerCase();

	const [isOpen, setIsOpen] = createSignal(false);

	const matchesSearch = (label: string) =>
		normalizedSearch().length === 0 ||
		label.toLowerCase().includes(normalizedSearch());

	const onKeyDown = (event: KeyboardEvent) => {
		switch (event.key) {
			case 'ArrowDown':
				// focusNextOption();
				break;
			case 'ArrowUp':
				// focusPreviousOption();
				break;
			case 'Enter':
				// if (isOpen() && focusedOption()) {
				//   pickOption(focusedOption());
				//   break;
				// }
				return;
			case 'Escape':
				if (isOpen()) {
					setIsOpen(false);
					break;
				}
				return;
			case 'Delete':
			case 'Backspace':
				if (search()) {
					return;
				}
				removeLastTag(props.folderId());
				break;
			case ' ':
				if (search()) {
					return;
				}
				if (!isOpen()) {
					setIsOpen(true);
				} else {
					// if (focusedOption()) {
					//   pickOption(focusedOption());
					// }
				}
				break;
			case 'Tab':
				//   pickOption(focusedOption());
				//   break;
				// }
				return;
			default:
				return;
		}
		event.preventDefault();
		event.stopPropagation();
	};

	return (
		<div
			class="sticky top-0 z-10 w-full bg-inherit py-2"
			onFocusOut={() => setIsOpen(false)}
			onMouseDown={event => {
				event.preventDefault();
				event.currentTarget.getElementsByTagName('input')[0].focus();
			}}
		>
			<div class="input w-full">
				<Show when={tags()}>
					<For each={tags().toArray()}>
						{option => (
							<div
								onClick={() => modifyTag(props.folderId(), option)}
								class={cn(
									'badge badge-soft hover:badge-ghost cursor-pointer px-2.5 py-0.5 text-sm font-medium'
								)}
							>
								{option.label}
							</div>
						)}
					</For>
				</Show>
				<input
					type="text"
					tabIndex={0}
					autocomplete="off"
					autoCapitalize="none"
					autocorrect="off"
					autofocus
					onClick={() => setIsOpen(prev => !prev)}
					value={search()}
					onInput={e => setSearch(e.target.value)}
					onKeyDown={(event: KeyboardEvent) => {
						onKeyDown(event);
						if (!event.defaultPrevented) {
							if (event.key === 'Escape') {
								event.preventDefault();
								event.stopPropagation();
								(event.target as HTMLElement).blur();
							}
						}
					}}
					onMouseDown={event => {
						event.stopPropagation();
					}}
				/>
			</div>
			<Show when={isOpen()}>
				<ul class="list bg-base-100 absolute z-2 mt-2 max-h-[36vh] w-full overflow-y-auto rounded-lg border">
					<For each={props.groupOptions()}>
						{groupOption => {
							return (
								<>
									<li class="bg-base-200 sticky top-0 z-1 p-4 pb-2 text-lg font-bold tracking-wide capitalize">
										{groupOption.label}
									</li>
									<For each={groupOption.options}>
										{option => (
											<li
												class={cn(
													'list-row cursor-pointer',
													hasTag(tags(), option) &&
														'pointer-events-none opacity-30',
													!matchesSearch(option.label) && 'hidden'
												)}
												onClick={() => modifyTag(props.folderId(), option)}
											>
												{option.label}
											</li>
										)}
									</For>
								</>
							);
						}}
					</For>
				</ul>
			</Show>
		</div>
	);
}
