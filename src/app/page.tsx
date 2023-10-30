"use client";

import { useGetFolderDataQuery } from "@/lib/queries";
import { useAppSelector } from "@/lib/source";
import { RootState } from "@/lib/source/store";
import { IFolderData } from "@/type";

import { useSearchParams } from "next/navigation";
import { ReactElement } from "react";
import Content from "@/components/Content";
import Loading from "@/components/Loading";

function Home(): ReactElement {
  const searchParams = useSearchParams();
  const { search } = useAppSelector((state: RootState) => state.control);

  const route = parseInt(searchParams.get("id")) || 0;

  const { data: folderData, isLoading: isGetFolderDataLoading } =
    useGetFolderDataQuery(route);

  function getDisplayData(): IFolderData {
    if (search) {
      return {
        ...folderData,
        data: folderData.data.filter(o =>
          o.title.toLowerCase().includes(search.toLowerCase())
        )
      };
    }
    return folderData;
  }

  function Contents(): ReactElement {
    if (isGetFolderDataLoading) {
      return <Loading />;
    }
    if (!folderData) {
      return <div />;
    }
    return <Content folderData={getDisplayData()} />;
  }

  return (
    <div className="h-full w-full overflow-auto bg-default">
      <Contents />
    </div>
  );
}

export default Home;
