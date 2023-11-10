import { searchContext } from '@/lib/controls';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function AppBar() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleSearch(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    searchContext.value = e.target.value;
  }

  return (
    <div className="fixed z-10 flex h-[5vh] min-h-[64px] w-full flex-row items-center justify-between bg-primary px-[1vw]">
      <span
        className="cursor-pointer text-4xl font-medium text-primary"
        onClick={() => navigate('/')}
      >
        MediaDB
      </span>
      <div className="relative block">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-[#21e18c]" />
          <span className="sr-only">Search icon</span>
        </div>
        <input
          type="text"
          id="search-navbar"
          className="block w-full rounded-lg bg-white/20 p-2 pl-10 text-base text-primary hover:bg-white/30 focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-30"
          placeholder="Search..."
          value={searchContext.value}
          onChange={handleSearch}
          disabled={location.pathname.includes('setting')}
        />
      </div>
    </div>
  );
}

export default AppBar;
