import { modalStatus } from '@/lib/controls';
import { useGetFolderListQuery, useGetSettingQuery } from '@/lib/queries';
import classNames from '@/lib/utils';
import { ModalType } from '@/type';
import { Cog6ToothIcon, FolderIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Fragment, lazy, ReactElement, Suspense } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

const DirectoryModal = lazy(() => import('@/components/Modal/Directory'));

function SidePanel(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isSettingPage = location.pathname.includes('/setting');
  const currFolderIndex = parseInt(searchParams.get('id') || '0');

  const { data: setting } = useGetSettingQuery();
  const { data: folderList } = useGetFolderListQuery();

  function handleOpen() {
    modalStatus.value = ModalType.DIRECTORY;
  }

  const showText = setting?.showSidePanel
    ? 'text-lg text-primary pl-2 max-w-[10vw] truncate'
    : 'hidden';
  return (
    <Fragment>
      <div
        className={classNames(
          setting?.showSidePanel ? 'w-full max-w-xs' : 'w-fit max-w-[5.5vw]',
          'h-full bg-secondary flex',
        )}
      >
        <div className="flex h-full w-full flex-col flex-nowrap items-center justify-between overflow-hidden">
          <div className="flex w-full grow flex-col items-start">
            {folderList?.map(folder => {
              const isCurr =
                !isSettingPage && folder.position === currFolderIndex;
              return (
                <div
                  className={classNames(
                    isCurr
                      ? 'pointer-events-none opacity-30'
                      : 'pointer-events-auto',
                    'flex w-full cursor-pointer flex-row flex-nowrap items-center px-4 py-2 hover:bg-hover',
                  )}
                  key={folder.position}
                  title={folder.name}
                  onClick={() => navigate(`/?id=${folder.position}`)}
                >
                  <FolderIcon
                    className={classNames(
                      isCurr ? 'text-[#21e18c]' : 'text-[#6f7a83]',
                      'h-8 w-8',
                    )}
                  />
                  <span className={showText}>{folder.name}</span>
                </div>
              );
            })}
          </div>
          <div className="flex w-full flex-col flex-nowrap items-center justify-between border-t-2 border-gray-700">
            <div
              className={classNames(
                'flex w-full cursor-pointer flex-row flex-nowrap items-center  px-4  py-2 hover:bg-hover',
              )}
              onClick={handleOpen}
            >
              <PlusIcon className="h-8 w-8 text-[#6f7a83]" />
              <span className={showText}>Add Video</span>
            </div>
            <div
              className={classNames(
                isSettingPage
                  ? 'pointer-events-none opacity-30'
                  : 'pointer-events-auto',
                'flex w-full cursor-pointer flex-row flex-nowrap items-center px-4  py-2 hover:bg-hover',
              )}
              onClick={() => navigate(`/setting`)}
            >
              <Cog6ToothIcon
                className={classNames(
                  isSettingPage ? 'text-[#21e18c]' : 'text-[#6f7a83]',
                  'h-8 w-8',
                )}
              />
              <span className={showText}>Setting</span>
            </div>
          </div>
        </div>
      </div>
      <Suspense>
        <DirectoryModal folderList={folderList} />
      </Suspense>
    </Fragment>
  );
}

export default SidePanel;
