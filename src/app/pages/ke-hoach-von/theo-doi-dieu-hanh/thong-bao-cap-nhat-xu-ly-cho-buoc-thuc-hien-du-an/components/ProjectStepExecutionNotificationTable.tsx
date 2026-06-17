import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IProjectStepExecutionNotification, StepExecutionNotificationType, NotificationStatus } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { useProjectStepExecutionNotificationTable } from './useProjectStepExecutionNotificationTable';
import { ProjectStepExecutionNotificationModal } from './ProjectStepExecutionNotificationModal';
import { markNotificationAsRead } from '@/services/projectStepExecutionNotification.service';
import dayjs from 'dayjs';

interface ProjectStepExecutionNotificationTableProps {
  searchData?: SearchData;
}

const getNotificationTypeLabel = (notificationType?: StepExecutionNotificationType): string => {
  switch (notificationType) {
    case StepExecutionNotificationType.Upcoming:
      return 'Sắp đến hạn';
    case StepExecutionNotificationType.Due:
      return 'Đến hạn';
    case StepExecutionNotificationType.Overdue:
      return 'Quá hạn';
    default:
      return '-';
  }
};

const getNotificationTypeBadge = (notificationType?: StepExecutionNotificationType): string => {
  switch (notificationType) {
    case StepExecutionNotificationType.Upcoming:
      return 'badge-light-warning';
    case StepExecutionNotificationType.Due:
      return 'badge-light-info';
    case StepExecutionNotificationType.Overdue:
      return 'badge-light-danger';
    default:
      return 'badge-light-secondary';
  }
};

const getStatusBadge = (status?: NotificationStatus): string => {
  switch (status) {
    case NotificationStatus.Unread:
      return 'badge-light-primary';
    case NotificationStatus.Read:
      return 'badge-light-success';
    default:
      return 'badge-light-secondary';
  }
};

export const ProjectStepExecutionNotificationTable: React.FC<ProjectStepExecutionNotificationTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize, refresh } = useProjectStepExecutionNotificationTable({ 
    searchData
  });

  const handleAction = useCallback(
    async (type: string, record: IProjectStepExecutionNotification): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            // Đánh dấu đã đọc nếu chưa đọc
            if (record.id && record.status === NotificationStatus.Unread) {
              try {
                await markNotificationAsRead(record.id);
                // Refresh data để cập nhật status
                refresh();
              } catch (error) {
                console.error('Error marking notification as read:', error);
              }
            }
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error handling action:', error);
        toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
      }
    },
    [dispatch, refresh]
  );

  const columns: TableProps<IProjectStepExecutionNotification>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Loại thông báo',
      dataIndex: 'notificationType',
      key: 'notificationType',
      width: 120,
      className: 'text-center',
      render: (notificationType: StepExecutionNotificationType) => (
        <span className={`badge ${getNotificationTypeBadge(notificationType)}`}>
          {getNotificationTypeLabel(notificationType)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      className: 'text-center',
      render: (status: NotificationStatus) => (
        <span className={`badge ${getStatusBadge(status)}`}>
          {status === NotificationStatus.Unread ? 'Chưa đọc' : 'Đã đọc'}
        </span>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="fw-bold">{text || '-'}</div>,
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text, record) => (
        <div>
          <div className="fw-bold">{record.projectName || '-'}</div>
          {record.projectCode && (
            <div className="text-muted fs-7">{record.projectCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Bước thực hiện',
      dataIndex: 'projectProcessStepExecutionName',
      key: 'projectProcessStepExecutionName',
      render: (text) => text || '-',
    },
    {
      title: 'Người nhận',
      dataIndex: 'recipientUserFullName',
      key: 'recipientUserFullName',
      render: (text, record) => (
        <div>
          <div>{record.recipientUserFullName || record.recipientUserName || '-'}</div>
          {record.recipientUserName && (
            <div className="text-muted fs-7">{record.recipientUserName}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Ngày thông báo',
      dataIndex: 'notificationDate',
      key: 'notificationDate',
      className: 'text-center',
      width: 150,
      render: (text, record) => (
        <div>{record.notificationDate ? dayjs(record.notificationDate).format('DD/MM/YYYY HH:mm') : '-'}</div>
      ),
    },
    {
      title: 'Hạn xử lý',
      dataIndex: 'expectedEndDate',
      key: 'expectedEndDate',
      className: 'text-center',
      width: 150,
      render: (text, record) => (
        <div>{record.expectedEndDate ? dayjs(record.expectedEndDate).format('DD/MM/YYYY') : '-'}</div>
      ),
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 100,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết"
              onClick={() => {
                handleAction('detail', record);
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>
          </div>
        );
      },
    },
  ];


  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IProjectStepExecutionNotification>
            dataSource={data}
            columns={columns}
            isPagination={true}
            pageSize={pageSize}
            count={totalCount}
            offset={currentPage}
            setOffset={setCurrentPage}
            setPageSize={setPageSize}
            loading={loading}
          />
        </div>
      </div>
      {modalVisible ? <ProjectStepExecutionNotificationModal /> : <></>}
    </>
  );
};
