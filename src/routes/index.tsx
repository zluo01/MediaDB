import Content from '@/components/Content';
import Footer from '@/components/Footer';
import Toolbar from '@/components/Toolbar';
import { createFileRoute } from '@tanstack/solid-router';
import { appDataDir } from '@tauri-apps/api/path';

export const Route = createFileRoute('/')({
  loader: async () => await appDataDir(),
  component: () => {
    const appDir = Route.useLoaderData();

    return (
      <div class="bg-base-300 size-full overflow-y-auto scroll-smooth">
        <div class="relative flex flex-col p-8">
          <Toolbar />
          <Content appDir={appDir} />
        </div>
        <Footer />
      </div>
    );
  },
});
