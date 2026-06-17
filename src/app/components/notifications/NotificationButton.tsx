import React from 'react';
import { useNotificationCount } from '@/hooks';
import { NotificationPanel } from './NotificationPanel';

export const NotificationButton: React.FC = () => {
    const { unreadCount } = useNotificationCount();

    return (
        <div className="app-navbar-item ms-1 ms-md-4">
            <div
                className="btn btn-icon btn-custom btn-active-light btn-active-color-primary w-35px h-35px position-relative"
                data-kt-menu-trigger="click"
                data-kt-menu-attach="parent"
                data-kt-menu-placement="bottom-end"
                data-bs-toggle='tooltip'
                data-bs-placement='bottom'
                data-bs-trigger='hover'
                title='Thông báo'
            >
                <i className="fa-regular fa-bell fs-3"></i>

                {unreadCount > 0 && (
                    <span className="position-absolute start-100 translate-middle badge badge-circle badge-sm badge-primary"
                        style={{ top: '5px' }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>

            <NotificationPanel />
        </div>
    );
};
