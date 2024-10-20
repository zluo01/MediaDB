import ContentView from '@/components/Content';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/error';
import { useGetFolderDataQuery } from '@/lib/queries';
import { FolderStatus } from '@/type';
import { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

function Home(): ReactElement {
  const [searchParams] = useSearchParams();

  const route = parseInt(searchParams.get('id') || '0');

  const { data: folderInfo, isLoading } = useGetFolderDataQuery(route);

  function DisplayView() {
    if (isLoading) {
      return <Loading />;
    }
    if (!folderInfo) {
      return <div />;
    }
    if (folderInfo.status === FolderStatus.ERROR) {
      return <ErrorHandler folderInfo={folderInfo} />;
    }
    return <ContentView folderInfo={folderInfo} />;
  }

  return (
    <div className="size-full overflow-auto scroll-smooth bg-default">
      <div className="relative flex h-full flex-col p-8">
        <DisplayView />
      </div>
      <footer className="fixed bottom-0 flex w-full flex-row flex-nowrap items-center justify-between bg-primary px-1">
        <span className="cursor-default truncate text-secondary" id="footer" />
      </footer>
    </div>
  );
}

export default Home;
