import Cover from '@/components/ImageLoader/cover';
import { openFile } from '@/lib/os';
import classNames from '@/lib/utils';
import { IEpisode, IFolder, ITVShowData } from '@/type';
import { Dialog, Transition } from '@headlessui/react';
import { Tab } from '@headlessui/react';
import path from 'path';
import React, { Fragment, ReactElement } from 'react';

interface ITVShowCardMenuProps {
  folder: IFolder;
  data: ITVShowData;
  open: boolean;
  close: VoidFunction;
}

export default function TVShowCardMenu({
  folder,
  data,
  open,
  close,
}: ITVShowCardMenuProps): ReactElement {
  async function openEpisodeFile(media: IEpisode) {
    const filePath = path.join(folder.path, media.relativePath, media.file);
    await openFile(filePath);
  }

  const season_keys = Object.keys(data.seasons).sort();
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
            <div className="pointer-events-none fixed inset-x-0 bottom-0 flex max-h-full pt-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="pointer-events-auto relative h-screen max-h-[38.2vh] w-full">
                  <div className="flex h-full w-full flex-col items-start justify-between bg-default shadow-xl">
                    <Tab.Group>
                      <Tab.List className="flex h-[10%] w-full flex-row space-x-1 overflow-y-scroll bg-primary px-2">
                        {season_keys.map((key, index) => (
                          <Tab
                            key={index}
                            className={({ selected }) =>
                              classNames(
                                selected
                                  ? 'text-hover bg-selected'
                                  : 'text-selected bg-primary',
                                'whitespace-nowrap px-2 focus:outline-none focus:ring-0',
                              )
                            }
                          >
                            {`Season ${key === '00' ? 'SP' : key}`}
                          </Tab>
                        ))}
                      </Tab.List>
                      <Tab.Panels className="h-[90%] w-full bg-default">
                        {season_keys.map((key, index) => (
                          <Tab.Panel
                            key={index}
                            className="flex h-full w-full flex-row flex-nowrap justify-around"
                          >
                            <div className="flex h-full w-[38.2vw] items-center justify-center p-6">
                              <Cover
                                folder={folder}
                                src={path.join(
                                  data.relativePath,
                                  data.posters[key] || data.posters['main'],
                                )}
                                alt={data.title}
                                width={220}
                                height={320}
                              />
                            </div>
                            <div className="grid h-full w-[61.8vw] auto-cols-min auto-rows-min grid-cols-10 p-6">
                              {data.seasons[key].map((o, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  title={o.title}
                                  onClick={() => openEpisodeFile(o)}
                                  className="mb-2 mr-2 rounded-lg border border-selected px-5 py-2.5 text-center text-sm font-medium text-selected hover:bg-selected hover:text-hover focus:outline-none focus:ring-0"
                                >
                                  {o.episode}
                                </button>
                              ))}
                            </div>
                          </Tab.Panel>
                        ))}
                      </Tab.Panels>
                    </Tab.Group>
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
