import { useAppSelector } from '@/lib/source';
import { RootState } from '@/lib/source/store';
import { ReactElement } from 'react';

function Footer(): ReactElement {
  const content = useAppSelector((state: RootState) => state.footer.content);
  return (
    <footer className="fixed bottom-0 flex w-[inherit] flex-row flex-nowrap items-center justify-between bg-primary px-1">
      <span className="cursor-default truncate text-secondary" title={content}>
        {content}
      </span>
    </footer>
  );
}

export default Footer;
