import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Content from '../../components/Content';
import Layout from '../../components/Layout';
import { useAppSelector } from '../../lib/source';
import { getFolderInfo } from '../../lib/store';
import { IFolderInfo, IState } from '../../type';

function Folder(): JSX.Element {
  const [data, setData] = useState<IFolderInfo>();

  const router = useRouter();
  const { search, folders } = useAppSelector((state: IState) => state);
  const fid = parseInt(router.query.id as string);

  function updateData(data: IFolderInfo) {
    setData(data);
  }

  useEffect(() => {
    if (fid >= 0 && folders) {
      setData(getFolderInfo(folders[fid].name));
    }
  }, [fid, folders]);

  return (
    <Layout currFolderIndex={fid}>
      {data && (
        <Content
          folderInfo={folders[fid]}
          folderData={
            search
              ? {
                  ...data,
                  data: data.data.filter(o =>
                    o.title.toLowerCase().includes(search.toLowerCase())
                  ),
                }
              : data
          }
          updateData={updateData}
        />
      )}
    </Layout>
  );
}

export default Folder;
