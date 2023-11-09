import AppBar from '@/components/AppBar';
import SidePanel from '@/components/Panel';
import { store } from '@/lib/source/store';
import { Fragment } from 'react';
import { Provider } from 'react-redux';
import { Outlet } from 'react-router';

export default function Layout() {
  return (
    <Fragment>
      <Provider store={store}>
        <AppBar />
        <div className="flex h-full w-screen flex-row flex-nowrap bg-default pt-[max(5vh,64px)]">
          <SidePanel />
          <Outlet />
        </div>
      </Provider>
    </Fragment>
  );
}
