import Content from '@/components/Content/content';
import Toolbar from '@/components/Content/toolbar';
import Loading from '@/components/Loading';
import { searchContext } from '@/lib/controls';
import { useGetFolderDataQuery } from '@/lib/queries';
import {
  DEFAULT,
  EMPTY_FILTERS,
  FILTER,
  FolderStatus,
  IFolderData,
  IMediaData,
  IMovieData,
  ITags,
  MOVIE,
  TITLE_ASC,
  TITLE_DSC,
  YEAR_ASC,
  YEAR_DSC,
} from '@/type';
import { Signal, signal } from '@preact/signals-react';
import forEach from 'lodash/forEach';
import { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

function Home(): ReactElement {
  const [searchParams] = useSearchParams();

  const route = parseInt(searchParams.get('id') || '0');

  const { data: folderData, isLoading } = useGetFolderDataQuery(route);

  const filters: Signal<ITags> = signal(EMPTY_FILTERS);

  const displayData = finalizedData(folderData);

  function finalizedData(folderData?: IFolderData) {
    if (!folderData || folderData.status === FolderStatus.ERROR) {
      return folderData;
    }

    return {
      ...folderData,
      data: filteredData(folderData),
    };
  }

  function filteredData(folderData: IFolderData): IMediaData[] {
    let media = [...folderData.data];
    if (
      searchContext.value &&
      folderData &&
      folderData.status !== FolderStatus.ERROR
    ) {
      media = media.filter(o =>
        o.title.toLowerCase().includes(searchContext.value.toLowerCase()),
      );
    }

    forEach(filters.value, (value, tag) => {
      value.forEach(
        v => (media = media.filter(o => o[tag as FILTER].includes(v))),
      );
    });

    switch (folderData.sort) {
      case DEFAULT:
        break;
      case TITLE_ASC:
        media.sort((a: IMediaData, b: IMediaData) =>
          a.title > b.title ? 1 : -1,
        );
        break;
      case TITLE_DSC:
        media.sort((a: IMediaData, b: IMediaData) =>
          a.title < b.title ? 1 : -1,
        );
        break;
      case YEAR_DSC:
        if (media[0].type === MOVIE) {
          media.sort((a: IMediaData, b: IMediaData) =>
            (a as IMovieData).year < (b as IMovieData).year ? 1 : -1,
          );
        }
        break;
      case YEAR_ASC:
        if (media[0].type === MOVIE) {
          media.sort((a: IMediaData, b: IMediaData) =>
            (a as IMovieData).year > (b as IMovieData).year ? 1 : -1,
          );
        }
        break;
    }
    return media;
  }

  const disabled = searchContext.value !== '' || !displayData || isLoading;

  function ContentView() {
    if (isLoading) {
      return <Loading />;
    }
    if (!displayData) {
      return <div />;
    }
    if (displayData.status === FolderStatus.ERROR) {
      return (
        <div className="inset-0 flex h-full flex-col items-center justify-center space-y-1.5 text-xl text-white">
          <p>Encounter Error When Building Directory.</p>
          <p>Refresh to Retry.</p>
        </div>
      );
    }
    return <Content folderData={displayData} />;
  }

  return (
    <div className="h-full w-full overflow-auto scroll-smooth bg-default">
      <div className="flex h-full flex-col p-8">
        <Toolbar
          folderData={displayData}
          disabled={disabled}
          filters={filters}
        />
        <ContentView />
      </div>
      <footer className="fixed bottom-0 flex w-full flex-row flex-nowrap items-center justify-between bg-primary px-1">
        <span className="cursor-default truncate text-secondary" id="footer" />
      </footer>
    </div>
  );
}

export default Home;
