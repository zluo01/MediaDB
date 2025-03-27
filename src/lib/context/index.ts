import { FilterOption } from '@/type';
import { Store } from '@tanstack/solid-store';

export const searchStore = new Store('');

export const filterStore = new Store<FilterOption[]>([]);

export const footerStore = new Store('Total ---');
