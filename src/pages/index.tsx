import { Loading } from '@/components/Content/styles';
import Layout from '@/components/Layout';
import { useGetFolderDataQuery, useGetSettingQuery } from '@/lib/queries';
import { useAppSelector } from '@/lib/source';
import { RootState } from '@/lib/source/store';
import { IFolderData } from '@/type';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const Content = dynamic(() => import('@/components/Content'), {
  ssr: false,
});

function Home(): JSX.Element {
  const router = useRouter();
  const { search } = useAppSelector((state: RootState) => state.control);

  const route = parseInt(router.query.id as string) || 0;

  const { data: setting, isLoading: isGetSettingLoading } =
    useGetSettingQuery();
  const { data: folderData, isLoading: isGetFolderDataLoading } =
    useGetFolderDataQuery(route);

  function getDisplayData(): IFolderData {
    if (search) {
      return {
        ...folderData,
        data: folderData.data.filter(o =>
          o.title.toLowerCase().includes(search.toLowerCase())
        ),
      };
    }
    return folderData;
  }

  function Contents(): JSX.Element {
    if (isGetSettingLoading || isGetFolderDataLoading) {
      return <Loading />;
    }
    if (!folderData) {
      return <div />;
    }
    return <Content setting={setting} folderData={getDisplayData()} />;
  }

  return (
    <Layout currFolderIndex={route}>
      <Contents />
    </Layout>
  );
}

export default Home;
