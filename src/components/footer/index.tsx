import { useFooterStore } from '@/lib/context';

export default function Footer() {
  const { footer } = useFooterStore();

  return (
    <footer className="fixed bottom-0 flex w-full flex-row flex-nowrap items-center justify-between bg-primary px-1">
      <span className="cursor-default truncate text-secondary">{footer}</span>
    </footer>
  );
}
