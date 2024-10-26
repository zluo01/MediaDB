import AppBar from '@/components/AppBar';
import SidePanel from '@/components/Panel';
import { errorLog } from '@/lib/log';
import { Event, listen } from '@tauri-apps/api/event';
import { Fragment, useEffect } from 'react';
import { Outlet } from 'react-router';
import { useSWRConfig } from 'swr';

export default function Layout() {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    const isDev = window.location.host.startsWith('localhost:');
    // Disable the default context menu on production builds
    if (!isDev) {
      window.addEventListener('contextmenu', e => e.preventDefault());
    }

    const unListen = listen('parsing', (e: Event<string>) => mutate(e.payload));

    return () => {
      if (!isDev) {
        window.removeEventListener('contextmenu', e => e.preventDefault());
      }

      unListen.then(f => f()).catch(errorLog);
    };
  }, [mutate]);

  return (
    <Fragment>
      <AppBar />
      <div className="flex h-full w-screen flex-row flex-nowrap bg-default pt-[max(5vh,64px)]">
        <SidePanel />
        <Outlet />
      </div>
    </Fragment>
  );
}
