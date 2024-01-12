import Content from '@/components/Content/content';
import Toolbar from '@/components/Content/toolbar';
import Loading from '@/components/Loading';
import { searchContext } from '@/lib/controls';
import { useGetFolderDataQuery } from '@/lib/queries';
import { EMPTY_FILTERS, FolderStatus, ITags } from '@/type';
import { computed, Signal, signal } from '@preact/signals-react';
import { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

function Home(): ReactElement {
  const [searchParams] = useSearchParams();

  const route = parseInt(searchParams.get('id') || '0');

  const { data: folderData, isLoading } = useGetFolderDataQuery(route);

  const filters: Signal<ITags> = signal(EMPTY_FILTERS);

  const displayData = computed(() => {
    if (
      searchContext.value &&
      folderData &&
      folderData.status !== FolderStatus.ERROR
    ) {
      return {
        ...folderData,
        data: folderData.data.filter(o =>
          o.title.toLowerCase().includes(searchContext.value.toLowerCase()),
        ),
      };
    }
    return folderData;
  });

  const disabled = computed(
    () => searchContext.value !== '' || !displayData.value || isLoading,
  );

  const content = computed(() => {
    if (isLoading) {
      return <Loading />;
    }
    if (displayData.value?.status === FolderStatus.ERROR) {
      return (
        <div className="inset-0 flex h-full flex-col items-center justify-center space-y-1.5 text-xl text-white">
          <p>Encounter Error When Building Directory.</p>
          <p>Refresh to Retry.</p>
        </div>
      );
    }
    if (!displayData.value) {
      return <div />;
    }
    return <Content folderData={displayData.value} filters={filters} />;
  });

  return (
    <div className="h-full w-full overflow-auto scroll-smooth bg-default">
      <div className="flex h-full flex-col p-8">
        <Toolbar
          folderData={displayData.value}
          disabled={disabled.value}
          filters={filters}
        />
        {content}
      </div>
      <footer className="fixed bottom-0 flex w-full flex-row flex-nowrap items-center justify-between bg-primary px-1">
        <span className="cursor-default truncate text-secondary" id="footer" />
      </footer>
    </div>
  );
}

export default Home;
