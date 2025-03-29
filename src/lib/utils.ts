import { FilterOption } from '@/type';
import { type ClassValue, clsx } from 'clsx';
import filter from 'lodash/filter';
import isEqual from 'lodash/isEqual';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasTag(tags: FilterOption[], tag: FilterOption): boolean {
  return filter(tags, o => isEqual(o, tag)).length > 0;
}

export function openModal(id: string) {
  (document.getElementById(id) as HTMLDialogElement)?.showModal();
}

export function closeModal(id: string) {
  (document.getElementById(id) as HTMLDialogElement)?.close();
}

export function isModalOpen() {
  return document.querySelector('dialog[open]') !== null;
}
