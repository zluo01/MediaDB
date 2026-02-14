import { For } from 'solid-js';
import { cn } from '@/lib/utils';

export function Loading() {
	return <span class="loading loading-spinner loading-xl fixed inset-1/2" />;
}

export function LoadingContent() {
	return (
		<div
			class={cn(
				'm-0 border-0 pb-6',
				'grid grid-flow-dense auto-rows-fr',
				'sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12'
			)}
		>
			<For each={Array.from({ length: 18 })}>
				{() => (
					<div class="flex w-full cursor-pointer flex-col items-center justify-center p-2">
						<div class="flex size-full overflow-hidden rounded-md">
							<div class="skeleton bg-base-200 aspect-[2/3] h-auto w-full object-cover align-middle italic" />
						</div>
						<div class="flex w-full flex-col space-y-0.5 pt-1">
							<div class="skeleton bg-base-200 h-6 w-full rounded" />
							<div class="skeleton bg-base-200 h-5 w-[38.2%] rounded" />
						</div>
					</div>
				)}
			</For>
		</div>
	);
}
