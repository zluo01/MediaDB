import { Loading } from '@/components/Content/styles';
import Layout from '@/components/Layout';
import useAppDataPath from '@/lib/hooks';
import {
  useGetFolderInfoQuery,
  useGetFolderQuery,
  useGetSettingQuery,
} from '@/lib/queries';
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
  const appDataPath = useAppDataPath();

  const { search } = useAppSelector((state: RootState) => state.control);

  const route = parseInt(router.query.id as string) || 0;

  const { data: setting, isLoading: isGetSettingLoading } =
    useGetSettingQuery();
  const { data: folder, isLoading: isGetFolderLoading } =
    useGetFolderQuery(route);
  const { data: folderData } = useGetFolderInfoQuery(folder?.name);

  function getDisplayData(): IFolderData {
    if (search) {
      return {
        ...folder,
        ...folderData,
        data: folderData.data.filter(o =>
          o.title.toLowerCase().includes(search.toLowerCase())
        ),
        appDir: appDataPath,
      };
    }
    return { ...folder, ...folderData, appDir: appDataPath };
  }

  function Contents(): JSX.Element {
    if (isGetSettingLoading || isGetFolderLoading || !appDataPath) {
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
