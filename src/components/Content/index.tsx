import Content from '@/components/Content/content';
import Toolbar from '@/components/Content/toolbar';
import { IFolderData } from '@/type';

interface IContentViewProps {
  folderInfo: IFolderData;
}

export default function ContentView({ folderInfo }: IContentViewProps) {
  return (
    <>
      <Toolbar folderInfo={folderInfo} />
      <Content folderInfo={folderInfo} />
    </>
  );
}
