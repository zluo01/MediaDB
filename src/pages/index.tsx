import Layout from '@/components/Layout';
import { FOLDER_LIST, getFolderList } from '@/lib/storage';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import useSWR from 'swr';

function Home(): JSX.Element {
  const router = useRouter();
  const { data: folderList } = useSWR(FOLDER_LIST, getFolderList);

  useEffect(() => {
    if (folderList?.length > 0) {
      router.push(`/folder/0`).catch(err => console.error(err));
    }
  }, [folderList, router]);

  return <Layout />;
}

export default Home;
