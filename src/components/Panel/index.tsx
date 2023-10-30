import { useGetFolderListQuery, useGetSettingQuery } from '@/lib/queries';
import { useAppDispatch } from '@/lib/source';
import { openDirectoryModal } from '@/lib/source/slice/directoryModalSlice';
import classNames from '@/lib/utils';
import { FolderIcon, PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import React, { Fragment, lazy, ReactElement } from 'react';

const DirectoryModal = lazy(() => import('@/components/Modal/Directory'));

function SidePanel(): ReactElement {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isSettingPage = usePathname().includes('/setting');
  const currFolderIndex = parseInt(useSearchParams().get('id')) || 0;

  const { data: setting } = useGetSettingQuery();
  const { data: folderList } = useGetFolderListQuery();

  function handleOpen() {
    dispatch(openDirectoryModal());
  }

  const showText = setting?.showSidePanel
    ? '2xl:text-lg text-primary pl-2 max-w-[10vw] truncate xl:text-base'
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
                  onClick={() => router.push(`/?id=${folder.position}`)}
                >
                  <FolderIcon
                    className={classNames(
                      isCurr ? 'text-[#21e18c]' : 'text-[#6f7a83]',
                      '2xl:h-8 2xl:w-8 xl:h-5 xl:w-5',
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
              <PlusIcon className="text-[#6f7a83] xl:h-5 xl:w-5 2xl:h-8 2xl:w-8" />
              <span className={showText}>Add Video</span>
            </div>
            <div
              className={classNames(
                isSettingPage
                  ? 'pointer-events-none opacity-30'
                  : 'pointer-events-auto',
                'flex w-full cursor-pointer flex-row flex-nowrap items-center px-4  py-2 hover:bg-hover',
              )}
              onClick={() => router.push(`/setting`)}
            >
              <Cog6ToothIcon
                className={classNames(
                  isSettingPage ? 'text-[#21e18c]' : 'text-[#6f7a83]',
                  '2xl:h-8 2xl:w-8 xl:h-5 xl:w-5',
                )}
              />
              <span className={showText}>Setting</span>
            </div>
          </div>
        </div>
      </div>
      <DirectoryModal folderList={folderList} />
    </Fragment>
  );
}

export default SidePanel;
