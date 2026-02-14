import { debounce } from '@solid-primitives/scheduled';
import { Link, useLocation } from '@tanstack/solid-router';
import { useStore } from '@tanstack/solid-store';
import { SearchIcon } from '@/components/Icons';
import { searchStore } from '@/lib/context';
import { cn } from '@/lib/utils';

function Header() {
	const searchKey = useStore(searchStore);

	const location = useLocation();

	const trigger = debounce(
		(message: string) => searchStore.setState(() => message),
		250
	);

	return (
		<div class="navbar bg-base-100 fixed px-[1vw] shadow-sm">
			<div class="flex-1">
				<Link class="cursor-pointer text-4xl font-semibold" to="/">
					MediaDB
				</Link>
			</div>
			<div class="relative mx-2 block w-auto">
				<div class="pointer-events-none absolute flex h-full items-center justify-center px-4">
					<SearchIcon class="z-1 size-4" />
				</div>
				<input
					type="text"
					class={cn(
						'input inline-flex w-40 rounded-lg py-2 pr-2 pl-10 transition-all duration-300',
						'focus:w-64 focus:ring-0 focus:outline-none disabled:pointer-events-none disabled:opacity-30'
					)}
					placeholder="Search..."
					value={searchKey()}
					onInput={e => trigger(e.target.value)}
					disabled={location().pathname.includes('setting')}
				/>
			</div>
		</div>
	);
}

export default Header;
