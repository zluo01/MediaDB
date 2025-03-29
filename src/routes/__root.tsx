import Header from '@/components/Header';
import SidePanel from '@/components/Panel';
import { FilterProvider } from '@/lib/context/filterContext';
import { errorLog } from '@/lib/log';
import {
  invalidateFolderInformation,
  invalidateFolderListChange,
} from '@/lib/queries';
import { InvalidationPayload, InvalidationType } from '@/type';
import type { QueryClient } from '@tanstack/solid-query';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/solid-router';
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools';
import { Event, listen } from '@tauri-apps/api/event';
import { onCleanup } from 'solid-js';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  const controller = new AbortController();

  const isDev = window.location.host.startsWith('localhost:');

  // Disable the default context menu on production builds
  if (!isDev) {
    window.addEventListener('contextmenu', e => e.preventDefault(), {
      signal: controller.signal,
    });
  }

  const unListen = listen('parsing', async (e: Event<InvalidationPayload>) => {
    switch (e.payload.t) {
      case InvalidationType.FOLDER_LIST:
        await invalidateFolderListChange();
        break;
      case InvalidationType.FOLDER_INFORMATION:
        await invalidateFolderInformation(e.payload.id);
        break;
    }
  });

  onCleanup(() => {
    unListen.then(f => f()).catch(errorLog);
    if (!isDev) {
      controller.abort();
    }
  });

  return (
    <>
      <HeadContent />
      <Header />
      <div class="flex h-full w-screen flex-row flex-nowrap pt-16">
        <SidePanel />
        <FilterProvider>
          <Outlet />
        </FilterProvider>
      </div>
      <SolidQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
