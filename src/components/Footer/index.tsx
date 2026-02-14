import { useStore } from '@tanstack/solid-store';
import { footerStore } from '@/lib/context';

export default function Footer() {
	const footer = useStore(footerStore);

	return (
		<footer class="bg-base-100 fixed bottom-0 flex w-full flex-row flex-nowrap items-center justify-between px-1">
			<span class="cursor-default truncate">{footer()}</span>
		</footer>
	);
}
