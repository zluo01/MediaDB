import { cn } from '@/lib/utils';
import React from 'react';

function Poster({ className, ...props }: React.ComponentProps<'img'>) {
  return (
    <img
      className={cn(
        'h-full w-auto max-w-full bg-cover bg-no-repeat object-cover align-middle italic',
        className,
      )}
      {...props}
      alt={props.alt}
      loading="lazy"
    />
  );
}

export default Poster;
