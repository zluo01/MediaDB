import { useSearchStore } from '@/lib/context';
import { Input } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function AppBar() {
  const { searchKey, search } = useSearchStore();

  const navigate = useNavigate();
  const location = useLocation();

  function handleSearch(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    search(e.target.value);
  }

  return (
    <div className="fixed z-10 flex h-[5vh] min-h-[64px] w-full flex-row items-center justify-between bg-primary px-[1vw]">
      <span
        className="cursor-pointer text-4xl font-medium text-primary"
        onClick={() => navigate('/')}
      >
        MediaDB
      </span>
      <div className="relative mx-2 block w-auto">
        <div className="pointer-events-none absolute flex h-full items-center justify-center px-4">
          <MagnifyingGlassIcon className="size-5 text-[#21e18c]" />
        </div>
        <Input
          type="text"
          className={clsx(
            'inline-flex w-40 rounded-lg bg-white/20 py-2 pl-10 pr-2 text-base text-primary transition-all duration-300',
            'hover:bg-white/30 focus:w-64 focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-30',
          )}
          placeholder="Search..."
          value={searchKey}
          onChange={handleSearch}
          disabled={location.pathname.includes('setting')}
        />
      </div>
    </div>
  );
}

export default AppBar;
