import { Signal } from '@preact/signals-react';
import { ReactElement } from 'react';

interface IFooterProps {
  footer: Signal<string>;
}

function Footer({ footer }: IFooterProps): ReactElement {
  return (
    <footer className="fixed bottom-0 flex w-full flex-row flex-nowrap items-center justify-between bg-primary px-1">
      <span className="cursor-default truncate text-secondary">{footer}</span>
    </footer>
  );
}

export default Footer;
