import { useAppDispatch, useAppSelector } from '@/lib/context';
import { clear, filter } from '@/lib/context/slice/filterSlice';
import { RootState } from '@/lib/context/store';
import classNames from '@/lib/utils';
import { ACTOR, FILTER, GENRE, IFolderInfo, STUDIO, TAG } from '@/type';
import { Dialog, Transition } from '@headlessui/react';
import sortBy from 'lodash/sortBy';
import { Fragment, ReactElement } from 'react';

interface IFilerSection {
  folderData?: IFolderInfo;
  open: boolean;
  close: VoidFunction;
}

const FILTER_TAGS: FILTER[] = [GENRE, ACTOR, STUDIO, TAG];

function Filters({ folderData, open, close }: IFilerSection): ReactElement {
  const dispatch = useAppDispatch();
  const tags = useAppSelector((state: RootState) => state.filter);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-secondary/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <div className="flex h-full flex-col items-start justify-between overflow-y-scroll rounded-lg bg-default py-6 shadow-xl">
                    {folderData &&
                      FILTER_TAGS.map(tag => {
                        const data = folderData[tag];
                        const filteredTags = tags[tag];
                        return (
                          <div key={tag} className="w-full px-4">
                            <div className="flex flex-row items-center justify-between">
                              <span className="text-2xl capitalize text-secondary">
                                {tag}
                              </span>
                              <button
                                className="text-xl text-secondary focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-30"
                                disabled={filteredTags.length === 0}
                                onClick={() => dispatch(clear(tag))}
                              >
                                Clear
                              </button>
                            </div>
                            <div className="flex flex-row flex-wrap gap-y-2 py-2">
                              {sortBy(data).map((name, index) => (
                                <span
                                  key={index}
                                  className={classNames(
                                    filteredTags.includes(name)
                                      ? 'bg-selected text-hover'
                                      : 'bg-default border-selected border-[1px] text-selected',
                                    'mr-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium cursor-pointer hover:bg-hover hover:text-selected',
                                  )}
                                  onClick={() =>
                                    dispatch(filter({ tag, name }))
                                  }
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default Filters;
