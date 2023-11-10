import { ModalType } from '@/type';
import { signal } from '@preact/signals-react';

export const modalStatus = signal(ModalType.NONE);

export const searchContext = signal('');

export const refresh = signal(false);
