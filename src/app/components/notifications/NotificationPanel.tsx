import React, { useState } from 'react';
import './NotificationComponents.css';
import { useNotificationTable } from '@/hooks';
import { SearchData, DatabaseNotification } from '@/types';
import { NotificationItem } from './NotificationItem';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export const NotificationPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [searchData, setSearchData] = useState<SearchData & { isRead?: boolean }>({});
    const navigate = useNavigate();
    const {
        data: databaseNotifications,
        loading: isLoadingNotifications,
        totalCount,
        currentPage,
        pageSize,
        setCurrentPage,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotificationTable({
        searchData,
        initialPageSize: 10
    });

    const hasNextPage = currentPage * pageSize < totalCount;

    const handleSearch = () => {
        setSearchData(prev => ({ ...prev, keyword: searchKeyword }));
    };

    const handleTabChange = (key: string) => {
        setActiveTab(key);
        switch (key) {
            case 'all':
                setSearchData(prev => ({ ...prev, isRead: undefined }));
                break;
            case 'unread':
                setSearchData(prev => ({ ...prev, isRead: false }));
                break;
            case 'read':
                setSearchData(prev => ({ ...prev, isRead: true }));
                break;
        }
    };

    const handleNotificationClick = async (notification: DatabaseNotification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        // Handle navigation if needed
        if (notification.link) {
            navigate(notification.link);

        }
    };


    const handleLoadMore = () => {
        setCurrentPage(currentPage + 1);
    };

    return (
        <div
            className='menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px'
            data-kt-menu='true'
        >
            {/* Header với background image và tabs */}
            <div
                className='d-flex flex-column bgi-no-repeat rounded-top'
                style={{ backgroundImage: `url('/media/misc/menu-header-bg.jpg')` }}
            >
                <h3 className='text-white fw-bold px-9 mt-10 mb-6'>
                    Thông báo
                    {totalCount > 0 && <span className='fs-8 opacity-75 ps-3'>{totalCount} thông báo</span>}

                </h3>

                {/* Tab navigation */}
                <ul className='nav nav-line-tabs nav-line-tabs-2x nav-stretch fw-bold px-9'>
                    <li className='nav-item'>
                        <a
                            className={clsx('nav-link text-white opacity-75 opacity-state-100 pb-4', {
                                'active': activeTab === 'all'
                            })}
                            data-bs-toggle='tab'
                            href='#kt_topbar_notifications_all'
                            onClick={(e) => {
                                e.preventDefault();
                                handleTabChange('all');
                            }}
                        >
                            Tất cả
                        </a>
                    </li>

                    <li className='nav-item'>
                        <a
                            className={clsx('nav-link text-white opacity-75 opacity-state-100 pb-4', {
                                'active': activeTab === 'unread'
                            })}
                            data-bs-toggle='tab'
                            href='#kt_topbar_notifications_unread'
                            onClick={(e) => {
                                e.preventDefault();
                                handleTabChange('unread');
                            }}
                        >
                            Chưa đọc
                        </a>
                    </li>

                    {/* <li className='nav-item'>
                        <a
                            className={clsx('nav-link text-white opacity-75 opacity-state-100 pb-4', {
                                'active': activeTab === 'read'
                            })}
                            data-bs-toggle='tab'
                            href='#kt_topbar_notifications_read'
                            onClick={(e) => {
                                e.preventDefault();
                                handleTabChange('read');
                            }}
                        >
                            Đã đọc
                        </a>
                    </li> */}
                </ul>
            </div>

            {/* Tab content */}
            <div className='tab-content'>
                {/* Search section - chỉ hiện trong tab Tất cả và Chưa đọc */}
                {(activeTab === 'all' || activeTab === 'unread') && (
                    <div className='px-9 py-5 border-bottom'>
                        <div className='d-flex align-items-center gap-3'>
                            <div className='position-relative flex-grow-1'>
                                <i className='bi bi-search fs-5 text-gray-500 position-absolute top-50 translate-middle ms-4'></i>
                                <input
                                    type='text'
                                    className='form-control form-control-solid ps-12 py-2 fs-7'
                                    placeholder='Tìm kiếm thông báo...'
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            {/* <button
                                className='btn btn-sm btn-light-primary fw-semibold fs-7'
                                onClick={handleMarkAllAsRead}
                            >
                                <i className='bi bi-check-all me-2'></i>
                                Đánh dấu đã đọc
                            </button> */}
                        </div>
                    </div>
                )}

                {/* All notifications tab */}
                <div
                    className={clsx('tab-pane fade', {
                        'show active': activeTab === 'all'
                    })}
                    id='kt_topbar_notifications_all'
                    role='tabpanel'
                >
                    <div className='scroll-y mh-325px'>
                        {isLoadingNotifications ? (
                            <div className='text-center py-10'>
                                <div className='spinner-border text-primary' role='status'>
                                    <span className='visually-hidden'>Loading...</span>
                                </div>
                                <div className='text-gray-600 fs-7 mt-3'>Đang tải thông báo...</div>
                            </div>
                        ) : databaseNotifications.length === 0 ? (
                            <div className='text-center py-10'>
                                <div className='d-flex flex-column align-items-center'>
                                    <div className='symbol symbol-60px mb-4'>
                                        <div className='symbol-label bg-light-primary'>
                                            <i className='bi bi-bell-slash text-primary fs-2x'></i>
                                        </div>
                                    </div>
                                    <h5 className='fs-6 fw-bold text-gray-800 mb-2'>Không có thông báo</h5>
                                    <div className='fs-7 text-gray-600'>Hiện tại chưa có thông báo nào cho bạn</div>
                                </div>
                            </div>
                        ) : (
                            databaseNotifications.map((notification, index) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClick={handleNotificationClick}
                                    onDelete={deleteNotification}
                                    showDeleteButton={false}
                                    isHighlighted={false}
                                />
                            ))
                        )}
                    </div>

                    {hasNextPage && !isLoadingNotifications && (
                        <div className='py-3 text-center border-top'>
                            <button
                                className='btn btn-color-gray-600 btn-active-color-primary'
                                onClick={handleLoadMore}
                            >
                                Xem thêm <i className='bi bi-arrow-right fs-5'></i>
                            </button>
                        </div>
                    )}
                </div>

                {/* Unread notifications tab */}
                <div
                    className={clsx('tab-pane fade', {
                        'show active': activeTab === 'unread'
                    })}
                    id='kt_topbar_notifications_unread'
                    role='tabpanel'
                >
                    <div className='scroll-y mh-325px'>
                        {isLoadingNotifications ? (
                            <div className='text-center py-10'>
                                <div className='spinner-border text-primary' role='status'>
                                    <span className='visually-hidden'>Loading...</span>
                                </div>
                                <div className='text-gray-600 fs-7 mt-3'>Đang tải thông báo...</div>
                            </div>
                        ) : databaseNotifications.filter(n => !n.isRead).length === 0 ? (
                            <div className='text-center py-10'>
                                <div className='d-flex flex-column align-items-center'>
                                    <div className='symbol symbol-60px mb-4'>
                                        <div className='symbol-label bg-light-success'>
                                            <i className='bi bi-check-circle text-success fs-2x'></i>
                                        </div>
                                    </div>
                                    <h5 className='fs-6 fw-bold text-gray-800 mb-2'>Tất cả đã đọc</h5>
                                    <div className='fs-7 text-gray-600'>Bạn đã đọc hết tất cả thông báo</div>
                                </div>
                            </div>
                        ) : (
                            databaseNotifications.filter(n => !n.isRead).map((notification, index) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClick={handleNotificationClick}
                                    onDelete={deleteNotification}
                                    showDeleteButton={false}
                                    isHighlighted={false}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Read notifications tab */}
                <div
                    className={clsx('tab-pane fade', {
                        'show active': activeTab === 'read'
                    })}
                    id='kt_topbar_notifications_read'
                    role='tabpanel'
                >
                    <div className='scroll-y mh-325px'>
                        {isLoadingNotifications ? (
                            <div className='text-center py-10'>
                                <div className='spinner-border text-primary' role='status'>
                                    <span className='visually-hidden'>Loading...</span>
                                </div>
                                <div className='text-gray-600 fs-7 mt-3'>Đang tải thông báo...</div>
                            </div>
                        ) : databaseNotifications.filter(n => n.isRead).length === 0 ? (
                            <div className='text-center py-10'>
                                <div className='d-flex flex-column align-items-center'>
                                    <div className='symbol symbol-60px mb-4'>
                                        <div className='symbol-label bg-light-info'>
                                            <i className='bi bi-inbox text-info fs-2x'></i>
                                        </div>
                                    </div>
                                    <h5 className='fs-6 fw-bold text-gray-800 mb-2'>Chưa có thông báo đã đọc</h5>
                                    <div className='fs-7 text-gray-600'>Các thông báo đã đọc sẽ hiển thị ở đây</div>
                                </div>
                            </div>
                        ) : (
                            databaseNotifications.filter(n => n.isRead).map((notification, index) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClick={handleNotificationClick}
                                    onDelete={deleteNotification}
                                    showDeleteButton={false}
                                    isHighlighted={false}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
