import Content from '@/components/Content/content';
import Toolbar from '@/components/Content/toolbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import { useGetFolderDataQuery } from '@/lib/queries';
import { useAppSelector } from '@/lib/source';
import { RootState } from '@/lib/source/store';
import { IFolderData } from '@/type';
import { ReactElement, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Home(): ReactElement {
  const search = useAppSelector((state: RootState) => state.control.search);
  const [searchParams] = useSearchParams();

  const route = parseInt(searchParams.get('id') || '0');

  const [refresh, setRefresh] = useState(false);

  const { data: folderData, isLoading: isGetFolderDataLoading } =
    useGetFolderDataQuery(route);

  function getDisplayData(): IFolderData | undefined {
    if (search && folderData) {
      return {
        ...folderData,
        data: folderData.data.filter(o =>
          o.title.toLowerCase().includes(search.toLowerCase()),
        ),
      };
    }
    return folderData;
  }

  const displayData = getDisplayData();

  function Contents(): ReactElement {
    if (isGetFolderDataLoading || refresh) {
      return <Loading />;
    }
    if (!displayData) {
      return <div />;
    }
    return <Content folderData={displayData} />;
  }

  return (
    <div className="h-full w-full overflow-auto bg-default">
      <div className="flex flex-col p-8">
        <Toolbar
          folderData={displayData}
          updateRefresh={setRefresh}
          disabled={search !== '' || !displayData || refresh}
        />
        <Contents />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
