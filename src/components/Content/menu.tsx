import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { useAppDispatch, useAppSelector } from '@/lib/context';
import { closeMenu } from '@/lib/context/slice/menuSlice';
import { RootState } from '@/lib/context/store';
import { openFile } from '@/lib/os';
import classNames from '@/lib/utils';
import { CoverType, IEpisode } from '@/type';
import { Dialog, Tab, Transition } from '@headlessui/react';
import join from 'lodash/join';
import { Fragment, ReactElement } from 'react';

export default function TVShowCardMenu(): ReactElement {
  const dispatch = useAppDispatch();
  const { open, folder, data } = useAppSelector(
    (state: RootState) => state.menu,
  );

  async function openEpisodeFile(media: IEpisode) {
    const filePath = join([folder?.path, media.relativePath, media.file], '/');
    await openFile(filePath);
  }

  const season_keys = Object.keys(data?.seasons || []).sort();
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => dispatch(closeMenu())}
      >
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
                  <div className="flex size-full flex-col items-start justify-between bg-default shadow-xl">
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
                        {season_keys.map((key, index) => {
                          const { thumbnail, cover } = getCacheImagePath(
                            folder!,
                            join(
                              [
                                data!.relativePath,
                                data!.posters[key] || data!.posters.main,
                              ],
                              '/',
                            ),
                          );
                          return (
                            <Tab.Panel
                              key={index}
                              className="flex size-full flex-row flex-nowrap justify-around"
                            >
                              <div className="flex h-full w-[38.2vw] items-center justify-center p-6">
                                <Poster
                                  thumbnail={thumbnail}
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
                            </Tab.Panel>
                          );
                        })}
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
