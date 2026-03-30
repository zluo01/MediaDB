import { Store } from '@tanstack/solid-store';

export const searchStore = new Store('');

export const footerStore = new Store('Total ---');

export function updateFooter(title: string) {
	footerStore.setState(() => title);
}
