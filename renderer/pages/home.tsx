import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import Layout from '../components/Layout';
import { IState } from '../type';

function Home(): JSX.Element {
  const router = useRouter();
  const folders = useSelector((state: IState) => state.folders);

  useEffect(() => {
    if (folders.length > 0) {
      router.push(`/folder/0`).catch(err => console.error(err));
    }
  }, [folders]);

  return <Layout />;
}

export default Home;
