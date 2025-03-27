import { FilterOption } from '@/type';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasTag(tags: FilterOption[], tag: FilterOption): boolean {
  return (
    tags.filter(o => o.tag === tag.tag && o.label === tag.label).length > 0
  );
}

export function openModal(id: string) {
  (document.getElementById(id) as HTMLDialogElement)?.showModal();
}

export function closeModal(id: string) {
  (document.getElementById(id) as HTMLDialogElement)?.close();
}
