import Content from '@/components/Content/content';
import Toolbar from '@/components/Content/toolbar';
import Loading from '@/components/Loading';
import { useFilterStore, useSearchStore } from '@/lib/context';
import { errorLog } from '@/lib/log';
import { useGetFolderDataQuery } from '@/lib/queries';
import { getFolderMedia } from '@/lib/storage';
import { FilterOption, FolderStatus, IMediaData, SORT } from '@/type';
import { ReactElement, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function useGetFolderMediaData(
  folderIndex: number,
  searchKey: string,
  tags: FilterOption[],
  status: FolderStatus,
  sortType: SORT,
) {
  const [media, setMedia] = useState<IMediaData[]>([]);

  useEffect(() => {
    getFolderMedia(folderIndex, searchKey, tags)
      .then(o => setMedia(o))
      .catch(e => errorLog(e));
  }, [folderIndex, searchKey, tags, sortType, status]);

  return media;
}

function Home(): ReactElement {
  const { searchKey } = useSearchStore();
  const { tags } = useFilterStore();

  const [searchParams] = useSearchParams();

  const route = parseInt(searchParams.get('id') || '0');

  const { data: folderInfo, isLoading } = useGetFolderDataQuery(route);

  const mediaData = useGetFolderMediaData(
    route,
    searchKey,
    tags,
    folderInfo?.status || FolderStatus.NONE,
    folderInfo?.sort || SORT.DEFAULT,
  );

  const disabled = searchKey !== '' || !mediaData || isLoading;

  function ContentView() {
    if (isLoading) {
      return <Loading />;
    }
    if (!mediaData || !folderInfo) {
      return <div />;
    }
    if (folderInfo.status === FolderStatus.ERROR) {
      return (
        <div className="inset-0 flex h-full flex-col items-center justify-center space-y-1.5 text-xl text-white">
          <p>Encounter Error When Building Directory.</p>
          <p>Refresh to Retry.</p>
        </div>
      );
    }
    return <Content folderIndo={folderInfo} mediaData={mediaData} />;
  }

  return (
    <div className="size-full overflow-auto scroll-smooth bg-default">
      <div className="flex h-full flex-col p-8">
        <Toolbar folderInfo={folderInfo} disabled={disabled} />
        <ContentView />
      </div>
      <footer className="fixed bottom-0 flex w-full flex-row flex-nowrap items-center justify-between bg-primary px-1">
        <span className="cursor-default truncate text-secondary" id="footer">
          {mediaData && `Total ${mediaData?.length}`}
        </span>
      </footer>
    </div>
  );
}

export default Home;
