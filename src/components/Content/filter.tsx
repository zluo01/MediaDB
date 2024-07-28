import { useFilterStore } from '@/lib/context';
import { useGetFolderMediaTags } from '@/lib/queries';
import { FilterOption } from '@/type';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import clsx from 'clsx';
import { ReactElement } from 'react';
import Select, { OnChangeValue } from 'react-select';

function hasTag(tags: FilterOption[], tag: FilterOption): boolean {
  return (
    tags.filter(o => o.tag === tag.tag && o.label === tag.label).length > 0
  );
}

interface IFilerSection {
  folderIndex: number;
  open: boolean;
  close: VoidFunction;
}

function Filters({ folderIndex, open, close }: IFilerSection): ReactElement {
  const { tags, addTag, setTags, clear } = useFilterStore();

  const { data: options } = useGetFolderMediaTags(folderIndex);

  function onChange(selectedOptions: OnChangeValue<FilterOption, true>) {
    setTags([...selectedOptions]);
  }

  return (
    <Transition appear show={open}>
      <Dialog as="div" className="relative z-10" onClose={close}>
        <TransitionChild
          enter="ease-out duration-500"
          enterFrom="opacity-0 transform-[scale(95%)]"
          enterTo="opacity-100 transform-[scale(100%)]"
          leave="ease-in duration-500"
          leaveFrom="opacity-100 transform-[scale(100%)]"
          leaveTo="opacity-0 transform-[scale(95%)]"
        >
          <div className="fixed inset-0 bg-secondary/75 transition-opacity" />
        </TransitionChild>

        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-0 flex w-screen items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-500"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-500"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="pointer-events-auto relative h-[61.8vh] w-[61.8vw]">
                <div className="flex size-full flex-col items-start overflow-y-scroll rounded bg-default py-6">
                  <div className="flex w-full flex-row px-4 py-2">
                    <Select
                      isMulti
                      name="filters"
                      options={options}
                      className="_select"
                      classNamePrefix="_select"
                      autoFocus
                      hideSelectedOptions
                      value={tags}
                      onChange={onChange}
                    />
                  </div>

                  {options?.map(option => {
                    const filteredTags = tags.filter(
                      o => o.tag === option.label,
                    );
                    return (
                      <div key={option.label} className="w-full px-4">
                        <div className="flex flex-row items-center justify-between">
                          <span className="text-2xl capitalize text-secondary">
                            {option.label}
                          </span>
                          <button
                            className="text-xl text-secondary focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-30"
                            disabled={filteredTags.length === 0}
                            onClick={() => clear(option.label)}
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-row flex-wrap gap-y-2 py-2">
                          {option.options.map((value, index) => (
                            <span
                              key={index}
                              className={clsx(
                                hasTag(filteredTags, value)
                                  ? 'bg-selected text-hover'
                                  : 'border border-selected bg-default text-selected',
                                'mr-2 cursor-pointer rounded-full px-2.5 py-0.5 text-sm font-medium hover:bg-hover hover:text-selected',
                              )}
                              onClick={() => addTag(value)}
                            >
                              {value.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Filters;
