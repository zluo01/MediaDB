import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Content from '../components/Content';
import Layout from '../components/Layout';
import { getFolderInfo } from '../store';
import { IFolder, IFolderInfo, IReduxState } from '../type';

interface IHomeProps {
  currFolderIndex: number;
  folders: IFolder[];
}

function Home({ currFolderIndex, folders }: IHomeProps): JSX.Element {
  const [data, setData] = useState<IFolderInfo>();
  const [search, setSearch] = useState('');

  function updateData(data: IFolderInfo) {
    setData(data);
  }

  useEffect(() => {
    if (currFolderIndex >= 0 && currFolderIndex < folders.length) {
      getFolderInfo(folders[currFolderIndex].name)
        .then(data => setData(data))
        .catch(err => console.error(err));
    }
  }, [currFolderIndex, folders]);

  return (
    <Layout updateSearch={setSearch}>
      {data && (
        <Content
          folderInfo={folders[currFolderIndex]}
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

const mapStateToProps = (state: IReduxState) => ({
  currFolderIndex: state.currFolderIndex,
  folders: state.folders,
});

export default connect(mapStateToProps)(Home);
