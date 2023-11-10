import AppBar from '@/components/AppBar';
import SidePanel from '@/components/Panel';
import { Fragment } from 'react';
import { Outlet } from 'react-router';

export default function Layout() {
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
