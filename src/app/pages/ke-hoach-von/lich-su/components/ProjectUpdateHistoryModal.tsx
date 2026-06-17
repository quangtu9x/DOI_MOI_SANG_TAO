import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { Spin, Button } from 'antd';
import { AppDispatch } from '@/redux/Store';
import { RootState } from '@/redux/RootReducer';
import * as actionsModal from '@/redux/modal/Actions';
import { IProjectUpdateHistory, ProjectUpdateHistoryType } from '@/models';
import dayjs from 'dayjs';

const getUpdateTypeLabel = (updateType?: ProjectUpdateHistoryType): string => {
  switch (updateType) {
    case ProjectUpdateHistoryType.ProjectInfo:
      return 'Thông tin dự án';
    case ProjectUpdateHistoryType.StepInfo:
      return 'Thông tin bước tiến trình';
    default:
      return '-';
  }
};

export const ProjectUpdateHistoryModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IProjectUpdateHistory | null;

  const handleCancel = () => {
    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(null));
  };

  return (
    <Modal
      show={modalVisible}
      fullscreen={'lg-down'}
      size="xl"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết lịch sử cập nhật</Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={false}>
          {dataModal && (
            <div className="row g-3">
        <div className="col-12">
            <div className="mb-3">
              <label className="form-label fw-bold">Loại cập nhật:</label>
              <div>
                <span className={`badge ${dataModal.updateType === ProjectUpdateHistoryType.ProjectInfo ? 'badge-light-primary' : 'badge-light-info'}`}>
                  {getUpdateTypeLabel(dataModal.updateType)}
                </span>
              </div>
            </div>
          </div>

          {dataModal.projectName && (
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-bold">Dự án:</label>
                <div>{dataModal.projectName}</div>
                {dataModal.projectCode && (
                  <div className="text-muted fs-7">Mã: {dataModal.projectCode}</div>
                )}
              </div>
            </div>
          )}

          {dataModal.projectProcessStepExecutionName && (
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-bold">Bước tiến trình:</label>
                <div>{dataModal.projectProcessStepExecutionName}</div>
              </div>
            </div>
          )}

          {dataModal.fieldDisplayName && (
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-bold">Trường thay đổi:</label>
                <div>{dataModal.fieldDisplayName}</div>
                {dataModal.fieldName && (
                  <div className="text-muted fs-7">Tên trường: {dataModal.fieldName}</div>
                )}
              </div>
            </div>
          )}

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">Thời gian cập nhật:</label>
              <div>{dataModal.updateDate ? dayjs(dataModal.updateDate).format('DD/MM/YYYY HH:mm:ss') : '-'}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">Người thực hiện:</label>
              <div>
                {dataModal.updatedByUserFullName || dataModal.updatedByUserName || '-'}
                {dataModal.updatedByUserName && (
                  <div className="text-muted fs-7">Tài khoản: {dataModal.updatedByUserName}</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="mb-3">
              <label className="form-label fw-bold">Giá trị cũ:</label>
              <div className="p-3 bg-light rounded">
                {dataModal.oldValue || '-'}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="mb-3">
              <label className="form-label fw-bold">Giá trị mới:</label>
              <div className="p-3 bg-primary bg-opacity-10 rounded">
                {dataModal.newValue || '-'}
              </div>
            </div>
          </div>

          {dataModal.description && (
            <div className="col-12">
              <div className="mb-3">
                <label className="form-label fw-bold">Mô tả:</label>
                <div className="p-3 bg-light rounded">
                  {dataModal.description}
                </div>
              </div>
            </div>
          )}

          {dataModal.changeSummary && (
            <div className="col-12">
              <div className="mb-3">
                <label className="form-label fw-bold">Tóm tắt thay đổi:</label>
                <div className="p-3 bg-light rounded">
                  {dataModal.changeSummary}
                </div>
              </div>
            </div>
          )}

          {dataModal.note && (
            <div className="col-12">
              <div className="mb-3">
                <label className="form-label fw-bold">Ghi chú:</label>
                <div className="p-3 bg-light rounded">
                  {dataModal.note}
                </div>
              </div>
            </div>
          )}
            </div>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-end align-items-center">
          <Button
            type="default"
            className="btn-sm rounded-1 p-2"
            onClick={handleCancel}
          >
            <i className="fa fa-times me-2" />
            Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
