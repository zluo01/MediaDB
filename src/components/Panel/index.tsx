import { useModalStore } from '@/lib/context';
import { useGetFolderListQuery, useGetSettingQuery } from '@/lib/queries';
import { ModalType } from '@/type';
import { Cog6ToothIcon, FolderIcon, PlusIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { Fragment, lazy, Suspense } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router';

const DirectoryModal = lazy(() => import('@/components/Modal/Directory'));

function SidePanel() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isSettingPage = location.pathname.includes('/setting');
  const currFolderIndex = parseInt(searchParams.get('id') || '0');

  const { data: setting } = useGetSettingQuery();
  const { data: folderList } = useGetFolderListQuery();

  const { openModal } = useModalStore();

  function handleOpen() {
    openModal(ModalType.DIRECTORY);
  }

  const showText = setting?.showSidePanel
    ? 'text-lg text-primary pl-2 max-w-[10vw] truncate'
    : 'hidden';
  return (
    <Fragment>
      <div
        className={clsx(
          setting?.showSidePanel ? 'w-full max-w-xs' : 'w-fit max-w-[5.5vw]',
          'flex h-full bg-secondary',
        )}
      >
        <div className="flex size-full flex-col flex-nowrap items-center justify-between overflow-hidden">
          <div className="flex w-full grow flex-col items-start">
            {folderList?.map(folder => {
              const isCurr =
                !isSettingPage && folder.position === currFolderIndex;
              return (
                <Link key={folder.position} to={`/?id=${folder.position}`}>
                  <div
                    className={clsx(
                      isCurr
                        ? 'pointer-events-none opacity-30'
                        : 'pointer-events-auto',
                      'flex w-full cursor-pointer flex-row flex-nowrap items-center px-4 py-2 hover:bg-hover',
                    )}
                    title={folder.name}
                  >
                    <FolderIcon
                      className={clsx(
                        isCurr ? 'text-[#21e18c]' : 'text-[#6f7a83]',
                        'size-8',
                      )}
                    />
                    <span className={showText}>{folder.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="flex w-full flex-col flex-nowrap items-center justify-between border-t-2 border-gray-700">
            <div
              className={clsx(
                'flex w-full cursor-pointer flex-row flex-nowrap items-center  px-4  py-2 hover:bg-hover',
              )}
              onClick={handleOpen}
            >
              <PlusIcon className="size-8 text-[#6f7a83]" />
              <span className={showText}>Add Video</span>
            </div>
            <Link to={'/setting'}>
              <div
                className={clsx(
                  isSettingPage
                    ? 'pointer-events-none opacity-30'
                    : 'pointer-events-auto',
                  'flex w-full cursor-pointer flex-row flex-nowrap items-center px-4  py-2 hover:bg-hover',
                )}
              >
                <Cog6ToothIcon
                  className={clsx(
                    isSettingPage ? 'text-[#21e18c]' : 'text-[#6f7a83]',
                    'size-8',
                  )}
                />
                <span className={showText}>Setting</span>
              </div>
            </Link>
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
