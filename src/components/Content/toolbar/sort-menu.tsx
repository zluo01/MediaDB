import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUpdateSortTypeTrigger } from '@/lib/queries';
import { IFolderData, SORT } from '@/type';
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
  folderData: IFolderData;
}

function SortMenu({ folderData }: ISortingMenuProps) {
  const { trigger: sortTypeTrigger } = useUpdateSortTypeTrigger(
    folderData.position,
  );

  async function update(type: SORT) {
    await sortTypeTrigger(type);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-base font-medium text-selected hover:bg-selected hover:text-hover"
        >
          <Bars3BottomLeftIcon className="mr-2 size-3.5" />
          {folderData && sortTypeLabel(folderData.sort)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border-0 bg-secondary text-selected focus:outline-none">
        <DropdownMenuGroup>
          {folderData &&
            Object.keys(SORT)
              .filter(key => !isNaN(Number(key)))
              .map(key => Number(key))
              .filter(o => o !== folderData.sort)
              .map(type => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => update(type)}
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
