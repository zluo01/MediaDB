import { filterStore } from '@/lib/context';
import { cn, hasTag } from '@/lib/utils';
import { FilterOption, GroupedOption } from '@/type';
import { useStore } from '@tanstack/solid-store';
import isEqual from 'lodash/isEqual';
import { Accessor, For } from 'solid-js';

interface ITagFilterProps {
  groupOptions: Accessor<GroupedOption[]>;
}

function TagFilter({ groupOptions }: ITagFilterProps) {
  const tags = useStore(filterStore);

  function addTag(tag: FilterOption) {
    filterStore.setState(prev => {
      if (hasTag(prev, tag)) {
        return prev.filter(o => !isEqual(o, tag));
      } else {
        return [...prev, tag];
      }
    });
  }

  return (
    <dialog id="filter-modal" class="modal">
      <div class="modal-box h-[61.8vh] w-[61.8vw] max-w-[61.8vw]">
        <div class="flex flex-col gap-6">
          <For each={groupOptions()}>
            {groupOption => {
              const filteredTags = () =>
                tags().filter(o => o.tag === groupOption.label);
              return (
                <div class="bg-base-100 border-base-300 collapse border">
                  <input type="radio" name="tag-options" />
                  <div class="collapse-title capitalize">
                    {groupOption.label}
                  </div>
                  <div class="collapse-content flex flex-row flex-wrap space-x-1 gap-y-2 text-sm">
                    <For each={groupOption.options}>
                      {option => (
                        <div
                          onClick={() => addTag(option)}
                          class={cn(
                            'badge badge-outline hover:badge-ghost cursor-pointer px-2.5 py-0.5 text-sm font-medium',
                            hasTag(filteredTags(), option) && 'badge-soft',
                          )}
                        >
                          {option.label}
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default TagFilter;
