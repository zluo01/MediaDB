import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { IFolder, IFolderInfo, IReduxState } from '../type';
import { getFolderInfo } from '../store';
import { connect } from 'react-redux';
import Content from '../components/Content';

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
      setData(getFolderInfo(folders[currFolderIndex].name));
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
                    o.title.toLowerCase().includes(search)
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
