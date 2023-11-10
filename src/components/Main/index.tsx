import Content from '@/components/Content/content';
import Toolbar from '@/components/Content/toolbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import { useGetFolderDataQuery } from '@/lib/queries';
import { useAppSelector } from '@/lib/source';
import { RootState } from '@/lib/source/store';
import { EMPTY_FILTERS, ITags } from '@/type';
import { computed, Signal, signal } from '@preact/signals-react';
import { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

function Home(): ReactElement {
  const search = useAppSelector((state: RootState) => state.control.search);
  const [searchParams] = useSearchParams();

  const route = parseInt(searchParams.get('id') || '0');

  const { data: folderData, isLoading: isGetFolderDataLoading } =
    useGetFolderDataQuery(route);

  const filters: Signal<ITags> = signal(EMPTY_FILTERS);
  const refresh = signal(false);

  const displayData = computed(() => {
    if (search && folderData) {
      return {
        ...folderData,
        data: folderData.data.filter(o =>
          o.title.toLowerCase().includes(search.toLowerCase()),
        ),
      };
    }
    return folderData;
  });

  function Contents(): ReactElement {
    if (isGetFolderDataLoading || refresh.value) {
      return <Loading />;
    }
    if (!displayData.value) {
      return <div />;
    }
    return <Content folderData={displayData.value} filters={filters} />;
  }

  return (
    <div className="h-full w-full overflow-auto bg-default">
      <div className="flex flex-col p-8">
        <Toolbar
          folderData={displayData.value}
          updateRefresh={() => (refresh.value = true)}
          disabled={search !== '' || !displayData.value || refresh.value}
          filters={filters}
        />
        <Contents />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
