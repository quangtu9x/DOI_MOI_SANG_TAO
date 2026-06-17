import React from 'react';
import clsx from 'clsx';
import { DatabaseNotification } from '@/types';
import { KTIcon } from '@/_metronic/helpers';

interface NotificationItemProps {
    notification: DatabaseNotification;
    onClick: (notification: DatabaseNotification) => void;
    onDelete: (id: string) => void;
    showDeleteButton?: boolean;
    isHighlighted?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onClick,
    onDelete,
    showDeleteButton = false,
    isHighlighted = false
}) => {
    const getNotificationIcon = (categoryName?: string) => {
        switch (categoryName?.toLowerCase()) {
            case 'system':
                return 'gear';
            case 'user':
                return 'profile-circle';
            case 'task':
                return 'note-2';
            default:
                return 'notification-bing';
        }
    };

    const getNotificationState = (categoryName?: string) => {
        switch (categoryName?.toLowerCase()) {
            case 'system':
                return 'primary';
            case 'user':
                return 'info';
            case 'task':
                return 'warning';
            default:
                return 'primary';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 0) {
            return 'vừa xong';
        }

        const totalSeconds = Math.floor(diff / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);

        const seconds = totalSeconds % 60;
        const minutes = totalMinutes % 60;
        const hours = totalHours % 24;
        const days = totalDays % 7;
        const weeks = Math.floor(totalDays / 7);

        if (totalSeconds < 60) {
            return 'vừa xong';
        } else if (totalMinutes < 60) {
            if (seconds > 0) {
                return `${totalMinutes} phút ${seconds} giây trước`;
            }
            return `${totalMinutes} phút trước`;
        } else if (totalHours < 24) {
            if (minutes > 0) {
                return `${totalHours} giờ ${minutes} phút trước`;
            }
            return `${totalHours} giờ trước`;
        } else if (totalDays < 7) {
            if (hours > 0) {
                return `${totalDays} ngày ${hours} giờ trước`;
            }
            return `${totalDays} ngày trước`;
        } else if (weeks < 4) {
            if (days > 0) {
                return `${weeks} tuần ${days} ngày trước`;
            }
            return `${weeks} tuần trước`;
        } else if (totalDays < 365) {
            const months = Math.floor(totalDays / 30);
            const remainingDays = totalDays % 30;
            if (remainingDays > 0 && months < 12) {
                return `${months} tháng ${remainingDays} ngày trước`;
            }
            return `${months} tháng trước`;
        } else {
            const years = Math.floor(totalDays / 365);
            const remainingMonths = Math.floor((totalDays % 365) / 30);
            if (remainingMonths > 0 && years < 3) {
                return `${years} năm ${remainingMonths} tháng trước`;
            }
            return `${years} năm trước`;
        }
    };

    return (
        <div
            className={clsx('d-flex flex-stack py-4 cursor-pointer notification-item', {
                'bg-light-primary': isHighlighted
            })}
            onClick={() => onClick(notification)}
            data-kt-menu-dismiss='true'
        >
            <div className='d-flex align-items-center px-4'>
                <div className='symbol symbol-35px me-4'>
                    <span className={clsx('symbol-label', `bg-light-${getNotificationState(notification.categoryName)}`)}>
                        <KTIcon iconName={getNotificationIcon(notification.categoryName)} className={`fs-2 text-${getNotificationState(notification.categoryName)}`} />
                    </span>
                </div>

                <div className='mb-0 me-2'>
                    <a href='#' className={clsx('fs-6 text-gray-800 text-hover-primary', {
                        'fw-bolder': !notification.isRead,
                        'fw-bold': notification.isRead
                    })}>
                        {notification.title}
                        {!notification.isRead && (
                            <span className='badge badge-primary fs-8 fw-bold ms-2'>Mới</span>
                        )}
                    </a>
                    <span className='badge badge-light fs-8'>{formatDate(notification.createdOn)}</span>
                    <div className='text-gray-500 fs-7'>{notification.description}</div>
                </div>
            </div>

            <div className='d-flex flex-column align-items-end'>


                {showDeleteButton && (
                    <button
                        className='btn btn-sm btn-icon btn-light-danger mt-2 h-25px w-25px'
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                        }}
                        title='Xóa thông báo'
                    >
                        <i className='bi bi-x fs-4'></i>
                    </button>
                )}
            </div>
        </div>
    );
};
