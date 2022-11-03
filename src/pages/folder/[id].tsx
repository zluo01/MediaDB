import Content from '@/components/Content';
import { Loading } from '@/components/Content/styles';
import Layout from '@/components/Layout';
import { useAppSelector } from '@/lib/source';
import { RootState } from '@/lib/source/store';
import {
  FOLDER,
  FOLDER_LIST,
  getFolder,
  getFolderInfo,
  getSetting,
  SETTING,
} from '@/lib/storage';
import { useRouter } from 'next/router';
import useSWR from 'swr';

function Home(): JSX.Element {
  const router = useRouter();
  const { search } = useAppSelector((state: RootState) => state.control);

  const route = parseInt(router.query.id as string);

  const { data: setting } = useSWR(SETTING, getSetting);
  const { data: folder } = useSWR([FOLDER_LIST, route], () => getFolder(route));
  const { data: folderData } = useSWR(
    folder?.name ? [FOLDER, folder.name] : null,
    () => getFolderInfo(folder.name)
  );

  function getDisplayData() {
    if (search) {
      return {
        ...folder,
        ...folderData,
        data: folderData.data.filter(o =>
          o.title.toLowerCase().includes(search.toLowerCase())
        ),
      };
    }
    return { ...folder, ...folderData };
  }

  function Contents(): JSX.Element {
    if (!setting || !folder) {
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
