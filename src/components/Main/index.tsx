import Content from '@/components/Content/content';
import Footer from '@/components/Content/footer';
import Toolbar from '@/components/Content/toolbar';
import Loading from '@/components/Loading';
import { searchContext } from '@/lib/controls';
import { useGetFolderDataQuery } from '@/lib/queries';
import { EMPTY_FILTERS, ITags } from '@/type';
import { computed, Signal, signal } from '@preact/signals-react';
import { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

function Home(): ReactElement {
  const [searchParams] = useSearchParams();

  const route = parseInt(searchParams.get('id') || '0');

  const { data: folderData, isLoading } = useGetFolderDataQuery(route);

  const filters: Signal<ITags> = signal(EMPTY_FILTERS);
  const footer = signal('');

  const displayData = computed(() => {
    if (searchContext.value && folderData) {
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
    if (!displayData.value) {
      return <div />;
    }
    return (
      <Content
        folderData={displayData.value}
        filters={filters}
        footer={footer}
      />
    );
  });

  return (
    <div className="h-full w-full overflow-auto bg-default">
      <div className="flex flex-col p-8">
        <Toolbar
          folderData={displayData.value}
          disabled={disabled.value}
          filters={filters}
        />
        {content}
      </div>
      <Footer footer={footer} />
    </div>
  );
}

export default Home;
