import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { openFile } from '@/lib/os';
import { cn } from '@/lib/utils';
import { IEpisode, ITVShowData } from '@/type';
import join from 'lodash/join';
import { Accessor, createSignal, For, Match, Switch } from 'solid-js';

interface ITVShowCardMenuProps {
  appDir: Accessor<string>;
  folderName: string;
  folderPath: string;
  media: ITVShowData;
}

export default function TVShowCardMenu({
  appDir,
  folderName,
  folderPath,
  media,
}: ITVShowCardMenuProps) {
  const [active, setActive] = createSignal(0);

  async function openEpisodeFile(media: IEpisode) {
    const filePath = join([folderPath, media.path, media.file], '/');
    await openFile(filePath);
  }

  const seasonKeys = () => Object.keys(media.seasons || []).sort();

  return (
    <dialog id={`menu-${media.title}`} class="modal modal-bottom">
      <div class="modal-box w-screen p-0">
        <div role="tablist" class="tabs tabs-border">
          <For each={seasonKeys()}>
            {(season, index) => (
              <a
                role="tab"
                onClick={() => setActive(index())}
                class={cn('tab', index() === active() && 'tab-active')}
              >
                {`Season ${season === '00' ? 'SP' : season}`}
              </a>
            )}
          </For>
        </div>
        <div class="h-[38.2vh] w-full p-6">
          <Switch>
            <For each={seasonKeys()}>
              {(season, index) => {
                const cover = getCacheImagePath(
                  appDir(),
                  folderName,
                  join(
                    [media.path, media.posters[season] || media.posters.main],
                    '/',
                  ),
                );
                return (
                  <Match when={index() === active()}>
                    <div class="flex flex-row flex-nowrap justify-around">
                      <Poster
                        src={cover}
                        alt={media.title}
                        width={240}
                        height={320}
                      />
                      <div class="grid h-full w-[61.8vw] auto-cols-min auto-rows-min grid-cols-10 gap-1">
                        <For each={media.seasons[season]}>
                          {episode => (
                            <div class="tooltip" data-tip={episode.title}>
                              <div
                                onClick={() => openEpisodeFile(episode)}
                                class="btn btn-outline btn-wide"
                              >
                                {episode.episode}
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Match>
                );
              }}
            </For>
          </Switch>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
