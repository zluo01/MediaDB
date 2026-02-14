import { type ComponentProps, splitProps } from 'solid-js';
import { cn } from '@/lib/utils';

interface PosterProps extends ComponentProps<'img'> {
	styles?: string;
}

function Poster(_props: PosterProps) {
	const [classes, props] = splitProps(_props, ['styles']);
	return (
		<img
			class={cn(
				'h-full w-auto max-w-full bg-cover bg-no-repeat object-cover align-middle italic',
				classes.styles
			)}
			{...props}
			alt={props.alt}
			loading="lazy"
		/>
	);
}

export default Poster;
