import { getCacheImagePath } from '@/components/ImageLoader/common';
import Poster from '@/components/ImageLoader/poster';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMenuStore } from '@/lib/context';
import { openFile } from '@/lib/os';
import { IEpisode } from '@/type';
import join from 'lodash/join';

export default function TVShowCardMenu() {
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
        className="size-full max-h-[38.2vh] border-0 bg-default p-0"
      >
        <Tabs defaultValue={seasonKeys[0]} className="size-full">
          <TabsList className="no-scrollbar w-full space-x-1 overflow-y-scroll bg-primary">
            {seasonKeys.map(key => (
              <TabsTrigger
                key={key}
                value={key}
                className="h-full rounded-md bg-primary px-2 text-selected focus:outline-none focus:ring-0 data-[state=active]:bg-selected data-[state=active]:text-hover"
              >
                {`Season ${key === '00' ? 'SP' : key}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {seasonKeys.map(key => {
            const cover = getCacheImagePath(
              folder!.appDir!,
              folder!.name,
              join([data!.path, data!.posters[key] || data!.posters.main], '/'),
            );
            return (
              <TabsContent
                key={key}
                value={key}
                className="flex flex-row flex-nowrap justify-around"
              >
                <Poster
                  src={cover}
                  alt={data!.title}
                  width={240}
                  height={320}
                />
                <div className="grid h-full w-[61.8vw] auto-cols-min auto-rows-min grid-cols-10">
                  {data?.seasons[key].map((o, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      title={o.title}
                      onClick={() => openEpisodeFile(o)}
                      className="mb-2 mr-2 rounded-lg border border-selected bg-transparent px-5 py-2.5 text-center text-sm font-medium text-selected hover:bg-selected hover:text-hover focus:outline-none focus:ring-0"
                    >
                      {o.episode}
                    </Button>
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
