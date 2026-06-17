import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'antd';
import dayjs from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { IProjectStepExecutionNotification, StepExecutionNotificationType, NotificationStatus } from '@/models/ke-hoach-von';

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

export const ProjectStepExecutionNotificationModal: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as unknown as IProjectStepExecutionNotification | undefined;

  const handleClose = (): void => {
    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(undefined));
  };

  return (
    <Modal
      title="Chi tiết thông báo"
      open={modalVisible}
      onCancel={handleClose}
      footer={[
        <button key="close" className="btn btn-light" onClick={handleClose}>
          Đóng
        </button>,
      ]}
      width={800}
    >
      {dataModal && (
        <div className="p-3">
          <div className="mb-3">
            <label className="form-label fw-bold">Loại thông báo:</label>
            <div>
              <span className={`badge ${getNotificationTypeBadge(dataModal.notificationType)}`}>
                {getNotificationTypeLabel(dataModal.notificationType)}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Trạng thái:</label>
            <div>
              <span className={`badge ${dataModal.status === NotificationStatus.Unread ? 'badge-light-primary' : 'badge-light-success'}`}>
                {dataModal.status === NotificationStatus.Unread ? 'Chưa đọc' : 'Đã đọc'}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Tiêu đề:</label>
            <div>{dataModal.title || '-'}</div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Nội dung:</label>
            <div className="border rounded p-3 bg-light">{dataModal.content || '-'}</div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Dự án:</label>
              <div>
                {dataModal.projectName || '-'}
                {dataModal.projectCode && (
                  <div className="text-muted fs-7">Mã: {dataModal.projectCode}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Bước thực hiện:</label>
              <div>{dataModal.projectProcessStepExecutionName || '-'}</div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Người nhận:</label>
              <div>
                {dataModal.recipientUserFullName || dataModal.recipientUserName || '-'}
                {dataModal.recipientUserName && (
                  <div className="text-muted fs-7">Tên đăng nhập: {dataModal.recipientUserName}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Ngày thông báo:</label>
              <div>
                {dataModal.notificationDate ? dayjs(dataModal.notificationDate).format('DD/MM/YYYY HH:mm') : '-'}
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Hạn xử lý:</label>
              <div>
                {dataModal.expectedEndDate ? dayjs(dataModal.expectedEndDate).format('DD/MM/YYYY') : '-'}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Ngày đọc:</label>
              <div>
                {dataModal.readDate ? dayjs(dataModal.readDate).format('DD/MM/YYYY HH:mm') : 'Chưa đọc'}
              </div>
            </div>
          </div>

          {dataModal.note && (
            <div className="mb-3">
              <label className="form-label fw-bold">Ghi chú:</label>
              <div className="border rounded p-3 bg-light">{dataModal.note}</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
