"use client";

import { ReactElement } from "react";
import AppBar from "@/components/AppBar";
import { store } from "@/lib/source/store";
import { Provider } from "react-redux";

import "./globals.css";
import SidePanel from "@/components/Panel";


interface Props {
  children: ReactElement;
}

export default function Layout(props: Props) {
  return (
    <html lang="en" className="scroll-smooth">
    <head>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <title>MediaDB</title>
    </head>
    <body className="flex h-screen w-screen flex-col flex-nowrap overflow-hidden">
    <Provider store={store}>
      <AppBar />
      <div className="flex h-full w-screen flex-row flex-nowrap bg-default pt-[max(5vh,64px)]">
        <SidePanel />
        {props.children}
      </div>
    </Provider>
    </body>
    </html>
  );
}
