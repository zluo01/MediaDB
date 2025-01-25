import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateSortType, useGetFolderDataQuery } from '@/lib/queries';
import { SORT } from '@/type';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/solid';

function sortTypeLabel(sortType: SORT): string {
  switch (sortType) {
    case SORT.DEFAULT:
      return 'Directory';
    case SORT.TITLE_ASC:
      return 'Name(A-Z)';
    case SORT.TITLE_DSC:
      return 'Name(Z-A)';
    case SORT.YEAR_ASC:
      return 'Oldest';
    case SORT.YEAR_DSC:
      return 'Newest';
  }
}

interface ISortingMenuProps {
  folderId: number;
}

function SortMenu({ folderId }: ISortingMenuProps) {
  const { data, isLoading } = useGetFolderDataQuery(folderId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isLoading}>
        <Button
          variant="ghost"
          className="text-base font-medium text-selected hover:bg-selected hover:text-hover"
        >
          <Bars3BottomLeftIcon className="mr-2 size-3.5" />
          {data ? sortTypeLabel(data.sort) : 'Unknown'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border-0 bg-secondary text-selected focus:outline-none">
        <DropdownMenuGroup>
          {data &&
            Object.keys(SORT)
              .filter(key => !isNaN(Number(key)))
              .map(key => Number(key))
              .filter(o => o !== data.sort)
              .map(type => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => updateSortType(folderId, type)}
                  className="cursor-pointer focus:bg-selected focus:text-hover"
                >
                  {sortTypeLabel(type)}
                </DropdownMenuItem>
              ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SortMenu;
