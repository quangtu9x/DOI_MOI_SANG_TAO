

import { Link } from 'react-router-dom'
import { KTIcon } from '../../../helpers'
import { SearchData } from '@/types';
import { useState } from 'react';
import { List, Pagination, Spin, Empty, Input } from 'antd';
import { IUserGuide } from '@/models';
import { useTourGuide } from '@/context/TourGuideProvider';
import { DrawerComponent } from '../../../assets/ts/components';
import { useUserGuideTable } from '@/app/pages/admins/catalogs/user-guide/components/useUserGuideTable';

const HelpDrawer = () => {
  const [searchData, setSearchData] = useState<SearchData | undefined>({
    isPublished: true
  });
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useUserGuideTable({ searchData, initialPageSize: 10 });
  const { startTour } = useTourGuide();

  const handleSearch = (value: string) => {
    setSearchData(value ? { keyword: value, isPublished: true } : { isPublished: true });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleStartTour = (guide: IUserGuide) => {
    // Đóng drawer
    const drawer = DrawerComponent.getInstance('kt_help');
    if (drawer) {
      drawer.hide();
    }

    // Start tour sau một chút delay để drawer đóng xong
    setTimeout(() => {
      startTour(guide);
    }, 300);
  };
  return (
    <div
      id='kt_help'
      className='bg-body'
      data-kt-drawer='true'
      data-kt-drawer-name='help'
      data-kt-drawer-activate='true'
      data-kt-drawer-overlay='true'
      data-kt-drawer-width="{default:'350px', 'md': '525px'}"
      data-kt-drawer-direction='end'
      data-kt-drawer-toggle='#kt_help_toggle'
      data-kt-drawer-close='#kt_help_close'
    >
      {/* begin::Card */}
      <div className='card shadow-none rounded-0 w-100'>
        {/* begin::Header */}
        <div className='card-header' id='kt_help_header'>
          <h5 className='card-title fw-bold text-gray-600'>Hướng dẫn sử dụng</h5>

          <div className='card-toolbar'>
            <button
              type='button'
              className='btn btn-sm btn-icon explore-btn-dismiss me-n5'
              id='kt_help_close'
            >
              <KTIcon iconName='cross' className='fs-2' />
            </button>
          </div>
        </div>
        {/* end::Header */}

        {/* begin::Body */}
        <div className='card-body' id='kt_help_body'>
          {/* begin::Content */}
          <div
            id='kt_help_scroll'
            className='hover-scroll-overlay-y'
            data-kt-scroll='true'
            data-kt-scroll-height='auto'
            data-kt-scroll-wrappers='#kt_help_body'
            data-kt-scroll-dependencies='#kt_help_header'
            data-kt-scroll-offset='5px'
          >
            {/* begin::Search */}
            <div className='mb-5'>
              <Input
                placeholder='Tìm kiếm hướng dẫn...'
                allowClear
                onChange={e => handleSearch(e.target.value)}
                size='large'
              />
            </div>
            {/* end::Search */}

            {/* begin::User Guide List */}
            <Spin spinning={loading}>
              <List
                dataSource={data}
                locale={{
                  emptyText: <Empty description='Không có hướng dẫn nào' />
                }}
                renderItem={(item: IUserGuide) => (
                  <List.Item
                    key={item.id}
                    className='border border-dashed border-gray-300 rounded p-4 mb-3 cursor-pointer hover-elevate-up'
                    style={{ transition: 'all 0.3s ease' }}
                    onClick={() => handleStartTour(item)}
                  >
                    <div className='w-100'>
                      <div className='d-flex align-items-center justify-content-between mb-2'>
                        <h5 className='fw-bold text-gray-900 mb-0'>{item.title}</h5>
                        <div className='d-flex align-items-center gap-2'>
                          {item.isPublished && (
                            <span className='badge badge-light-success'>Đã xuất bản</span>
                          )}
                          <KTIcon iconName='right' className='fs-3 text-gray-500' />
                        </div>
                      </div>
                      <div className='text-muted fs-7 mb-2'>
                        <KTIcon iconName='tag' className='fs-6 me-1' />
                        {item.key}
                      </div>
                      <div className='d-flex align-items-center text-muted fs-8'>
                        <span className='me-3'>
                          <KTIcon iconName='category' className='fs-7 me-1' />
                          {item.type}
                        </span>
                        <span className='me-3'>
                          <KTIcon iconName='flag' className='fs-7 me-1' />
                          {item.locale}
                        </span>
                        <span>
                          <KTIcon iconName='code' className='fs-7 me-1' />
                          v{item.version}
                        </span>
                      </div>
                    </div>
                  </List.Item>
                )}
              />

              {/* begin::Pagination */}
              {totalCount > pageSize && (
                <div className='d-flex justify-content-center mt-5'>
                  <Pagination
                    current={currentPage}
                    total={totalCount}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                  />
                </div>
              )}
              {/* end::Pagination */}
            </Spin>
            {/* end::User Guide List */}
          </div>
          {/* end::Content */}
        </div>
        {/* end::Body */}
      </div>
      {/* end::Card */}
    </div>
  )
}

export { HelpDrawer }
