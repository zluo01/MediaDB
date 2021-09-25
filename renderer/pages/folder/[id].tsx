import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Content from '../../components/Content';
import Layout from '../../components/Layout';
import { IFolderInfo, IReduxState } from '../../type';
import { getFolderInfo } from '../../utils/store';

function Folder(): JSX.Element {
  const [data, setData] = useState<IFolderInfo>();
  const [search, setSearch] = useState('');

  const router = useRouter();
  const folders = useSelector((state: IReduxState) => state.folders);
  const fid = parseInt(router.query.id as string);

  function updateData(data: IFolderInfo) {
    setData(data);
  }

  useEffect(() => {
    if (fid >= 0 && folders) {
      getFolderInfo(folders[fid].name)
        .then(data => setData(data))
        .catch(err => console.error(err));
    }
  }, [fid, folders]);

  return (
    <Layout currFolderIndex={fid} updateSearch={setSearch}>
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
          searchState={search !== ''}
        />
      )}
    </Layout>
  );
}

export default Folder;
