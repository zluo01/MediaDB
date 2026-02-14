import { Store } from '@tanstack/solid-store';

export const searchStore = new Store('');

// export const filterStore = new Store<FilterOption[]>([]);
//
// export function changeTag(tag: FilterOption) {
//   filterStore.setState(prev => {
//     if (hasTag(prev, tag)) {
//       console.log(1);
//       console.log(prev);
//       const filtered = filter(prev, o => !isEqual(o, tag));
//       console.log(filtered);
//       return filtered;
//     } else {
//       console.log(2);
//       return [...prev, tag];
//     }
//   });
// }
//
// export function removeLastTag() {
//   filterStore.setState(prev => slice(prev, 0, -1));
// }

export const footerStore = new Store('Total ---');

export function updateFooter(title: string) {
	footerStore.setState(() => title);
}
