import Toolbar from '@/components/Content/toolbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import { useAppSelector } from '@/lib/source';
import { RootState } from '@/lib/source/store';
import { IFolderData } from '@/type';
import React, { ReactElement, useState } from 'react';

import MediaGrid from './content';

interface IContentProps {
  folderData: IFolderData;
}

function Content({ folderData }: IContentProps): ReactElement {
  const search = useAppSelector((state: RootState) => state.control.search);

  const [refresh, setRefresh] = useState(false);

  if (refresh) {
    return <Loading />;
  }

  const disabled = search !== '';

  return (
    <div className="w-full overflow-auto bg-default">
      <div className="flex flex-col p-5">
        <Toolbar
          folderData={folderData}
          updateRefresh={setRefresh}
          disabled={disabled}
        />
        <MediaGrid folderData={folderData} />
      </div>
      <Footer />
    </div>
  );
}

export default Content;
