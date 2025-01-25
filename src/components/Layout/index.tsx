import SidePanel from '@/components/Panel';
import Header from '@/components/header';
import { errorLog } from '@/lib/log';
import { Event, listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useSWRConfig } from 'swr';

export default function Layout() {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    const controller = new AbortController();

    const isDev = window.location.host.startsWith('localhost:');
    // Disable the default context menu on production builds
    if (!isDev) {
      window.addEventListener('contextmenu', e => e.preventDefault(), {
        signal: controller.signal,
      });
    }

    const unListen = listen('parsing', (e: Event<string>) => mutate(e.payload));

    return () => {
      if (!isDev) {
        controller.abort();
      }

      unListen.then(f => f()).catch(errorLog);
    };
  }, [mutate]);

  return (
    <>
      <Header />
      <div className="flex h-full w-screen flex-row flex-nowrap bg-default pt-[max(5vh,64px)]">
        <SidePanel />
        <Outlet />
      </div>
    </>
  );
}
