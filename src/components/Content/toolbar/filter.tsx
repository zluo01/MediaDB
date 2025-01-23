import { TagFilterSelect } from '@/components/Content/toolbar/tag-filter-select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useFilterStore } from '@/lib/context';
import { useGetFolderMediaTags } from '@/lib/queries';
import { hasTag } from '@/lib/utils';
import { FunnelIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface IFilerSection {
  folderIndex: number;
}

function Filters({ folderIndex }: IFilerSection) {
  const { tags, addTag } = useFilterStore();

  const { data: options } = useGetFolderMediaTags(folderIndex);

  return (
    <Dialog>
      <DialogTrigger className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-base font-medium text-selected shadow-sm transition-colors hover:bg-secondary/80 hover:bg-selected hover:text-hover focus:outline-none focus:ring-0 focus-visible:outline-none">
        <FunnelIcon className="mr-2 size-3.5" />
        Filter
      </DialogTrigger>
      <DialogContent
        className="pointer-events-auto h-[61.8vh] w-[61.8vw] max-w-full rounded-md border-0 bg-default p-0"
        aria-describedby="Filter"
      >
        <div className="relative flex size-full flex-col items-start overflow-y-scroll pb-6">
          <div className="sticky top-0 z-10 w-full bg-default px-4 pb-2 pt-4">
            <TagFilterSelect options={options} />
          </div>
          <Accordion
            type="multiple"
            className="w-full px-4"
            defaultValue={[options?.[0].label || '']}
          >
            {options?.map(option => {
              const filteredTags = tags.filter(o => o.tag === option.label);
              return (
                <AccordionItem key={option.label} value={option.label}>
                  <AccordionTrigger className="appearance-none text-2xl capitalize text-secondary">
                    {option.label}
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-row flex-wrap gap-y-2 space-x-1 pt-0.5">
                    {option.options.map((value, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        onClick={() => addTag(value)}
                        className={clsx(
                          'cursor-pointer rounded-full border-selected bg-default px-2.5 py-0.5 text-sm font-medium text-selected hover:bg-hover hover:text-selected',
                          hasTag(filteredTags, value) &&
                            'bg-selected text-hover',
                        )}
                      >
                        {value.label}
                      </Badge>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Filters;
