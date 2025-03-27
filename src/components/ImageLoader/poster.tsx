import { cn } from '@/lib/utils';
import { ComponentProps } from 'solid-js';

interface PosterProps extends ComponentProps<'img'> {
  styles?: string;
}

function Poster({ styles, ...props }: PosterProps) {
  return (
    <img
      class={cn(
        'h-full w-auto max-w-full bg-cover bg-no-repeat object-cover align-middle italic',
        styles,
      )}
      {...props}
      alt={props.alt}
      loading="lazy"
    />
  );
}

export default Poster;
