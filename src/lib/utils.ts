import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
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
