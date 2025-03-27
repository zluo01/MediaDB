import Filter from '@/components/Toolbar/filter';
import RefreshButton from '@/components/Toolbar/refresh';
import SortMenu from '@/components/Toolbar/sort-menu';
import { useLocation } from '@tanstack/solid-router';

function Toolbar() {
  const location = useLocation();
  const folderId = () => (location().search.id as number) || 0;

  return (
    <div class="bg-base-300 sticky top-0 z-10 flex flex-row flex-nowrap items-center gap-2 py-2">
      <hr class="ml-1 grow opacity-30" />
      <Filter folderId={folderId} />
      <SortMenu folderId={folderId} />
      <RefreshButton folderId={folderId} />
    </div>
  );
}

export default Toolbar;
