import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { useMenuStore } from '@/lib/context';
import { openFile } from '@/lib/os';
import { CoverType, IEpisode } from '@/type';
import {
  Dialog,
  DialogPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import clsx from 'clsx';
import join from 'lodash/join';
import { ReactElement } from 'react';

export default function TVShowCardMenu(): ReactElement {
  const { menuStatus, folder, data, closeMenu } = useMenuStore();

  async function openEpisodeFile(media: IEpisode) {
    const filePath = join([folder?.path, media.path, media.file], '/');
    await openFile(filePath);
  }

  const season_keys = Object.keys(data?.seasons || []).sort();
  return (
    <Transition appear show={menuStatus}>
      <Dialog as="div" className="relative z-10" onClose={closeMenu}>
        <TransitionChild
          enter="transform transition ease-in-out duration-500"
          enterFrom="translate-y-full"
          enterTo="translate-y-0"
          leave="transform transition ease-in-out duration-500"
          leaveFrom="translate-y-0"
          leaveTo="translate-y-full"
        >
          <div className="fixed inset-0 bg-secondary/75 transition-opacity" />
        </TransitionChild>

        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-x-0 bottom-0 flex max-h-full pt-10">
            <TransitionChild
              enter="transform transition ease-in-out duration-500"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="transform transition ease-in-out duration-500"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <DialogPanel className="pointer-events-auto relative h-screen max-h-[38.2vh] w-full">
                <div className="flex size-full flex-col items-start justify-between bg-default shadow-xl">
                  <TabGroup>
                    <TabList className="flex h-[10%] w-full flex-row space-x-1 overflow-y-scroll bg-primary px-2">
                      {season_keys.map((key, index) => (
                        <Tab
                          key={index}
                          className={({ selected }) =>
                            clsx(
                              selected
                                ? 'bg-selected text-hover'
                                : 'bg-primary text-selected',
                              'whitespace-nowrap px-2 focus:outline-none focus:ring-0',
                            )
                          }
                        >
                          {`Season ${key === '00' ? 'SP' : key}`}
                        </Tab>
                      ))}
                    </TabList>
                    <TabPanels className="h-[90%] w-full bg-default">
                      {season_keys.map((key, index) => {
                        const cover = getCacheImagePath(
                          folder!,
                          join(
                            [
                              data!.path,
                              data!.posters[key] || data!.posters.main,
                            ],
                            '/',
                          ),
                        );
                        return (
                          <TabPanel
                            key={index}
                            className="flex size-full flex-row flex-nowrap justify-around"
                          >
                            <div className="flex h-full w-[38.2vw] items-center justify-center p-6">
                              <Poster
                                cover={cover}
                                alt={data!.title}
                                width={220}
                                height={320}
                                t={CoverType.COVER}
                              />
                            </div>
                            <div className="grid h-full w-[61.8vw] auto-cols-min auto-rows-min grid-cols-10 p-6">
                              {data?.seasons[key].map((o, i) => (
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
                          </TabPanel>
                        );
                      })}
                    </TabPanels>
                  </TabGroup>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
