import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import Layout from '../components/Layout';
import { IFolder, IReduxState } from '../type';

interface IHomeProps {
  folders: IFolder[];
}

function Home({ folders }: IHomeProps): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    if (folders.length > 0) {
      router.push(`/folder/0`).catch(err => console.error(err));
    }
  }, [folders]);

  return <Layout />;
}

const mapStateToProps = (state: IReduxState) => ({
  folders: state.folders,
});

export default connect(mapStateToProps)(Home);
