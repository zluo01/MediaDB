import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMenuStore } from '@/lib/context';
import { openFile } from '@/lib/os';
import { CoverType, IEpisode } from '@/type';
import join from 'lodash/join';
import { ReactElement } from 'react';

export default function TVShowCardMenu(): ReactElement {
  const { menuStatus, folder, data, closeMenu } = useMenuStore();

  async function openEpisodeFile(media: IEpisode) {
    const filePath = join([folder?.path, media.path, media.file], '/');
    await openFile(filePath);
  }

  const seasonKeys = Object.keys(data?.seasons || []).sort();
  return (
    <Sheet open={menuStatus} onOpenChange={closeMenu}>
      <SheetContent
        side="bottom"
        className="h-screen max-h-[38.2vh] w-full border-0 bg-default p-0"
      >
        <Tabs defaultValue={seasonKeys[0]} className="size-full">
          <TabsList className="w-full space-x-1 bg-primary py-6">
            {seasonKeys.map(key => (
              <TabsTrigger
                key={key}
                value={key}
                className="bg-primary p-2 text-selected focus:outline-none focus:ring-0 data-[state=active]:bg-selected data-[state=active]:text-hover"
              >
                {`Season ${key === '00' ? 'SP' : key}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {seasonKeys.map(key => {
            const cover = getCacheImagePath(
              folder!,
              join([data!.path, data!.posters[key] || data!.posters.main], '/'),
            );
            return (
              <TabsContent
                key={key}
                value={key}
                className="flex flex-row flex-nowrap justify-around"
              >
                <Poster
                  cover={cover}
                  alt={data!.title}
                  width={220}
                  height={320}
                  t={CoverType.COVER}
                />
                <div className="grid h-full w-[61.8vw] auto-cols-min auto-rows-min grid-cols-10">
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
              </TabsContent>
            );
          })}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
