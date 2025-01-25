import Filter from '@/components/toolbar/filter';
import RefreshButton from '@/components/toolbar/refresh';
import SortMenu from '@/components/toolbar/sort-menu';
import { useSearchParams } from 'react-router';

function Toolbar() {
  const [searchParams] = useSearchParams();

  const folderId = parseInt(searchParams.get('id') || '0');

  return (
    <div className="sticky top-0 z-10 flex flex-row flex-nowrap items-center gap-2 bg-default py-2">
      <hr className="ml-1 grow border-[#3b4956]" />
      <Filter folderId={folderId} />
      <SortMenu folderId={folderId} />
      <RefreshButton folderId={folderId} />
    </div>
  );
}

export default Toolbar;
