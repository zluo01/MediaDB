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

  function updateData(data: IFolderInfo) {
    setData(data);
  }

  useEffect(() => {
    if (currFolderIndex >= 0 && currFolderIndex < folders.length) {
      setData(getFolderInfo(folders[currFolderIndex].name));
    }
  }, [currFolderIndex, folders]);

  return (
    <Layout>
      {data && (
        <Content
          folderInfo={folders[currFolderIndex]}
          folderData={data}
          updateData={updateData}
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
