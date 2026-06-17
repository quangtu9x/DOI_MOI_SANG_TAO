import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { Form, Input } from 'antd';
import { Spin } from 'antd';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import {
  IProjectDifficulty,
  ProjectDifficultyType,
  ProjectDifficultyLevel,
  ResolutionStatus,
} from '@/models/ke-hoach-von';
import { HeaderTitle } from '@/app/components';

const getTypeLabel = (type?: ProjectDifficultyType): string => {
  switch (type) {
    case ProjectDifficultyType.Technical:
      return 'Kỹ thuật';
    case ProjectDifficultyType.Financial:
      return 'Tài chính';
    case ProjectDifficultyType.Legal:
      return 'Pháp lý';
    case ProjectDifficultyType.Other:
      return 'Khác';
    default:
      return 'Không xác định';
  }
};

const getLevelLabel = (level?: ProjectDifficultyLevel): string => {
  switch (level) {
    case ProjectDifficultyLevel.Low:
      return 'Thấp';
    case ProjectDifficultyLevel.Medium:
      return 'Trung bình';
    case ProjectDifficultyLevel.High:
      return 'Cao';
    case ProjectDifficultyLevel.Critical:
      return 'Nghiêm trọng';
    default:
      return 'Không xác định';
  }
};

const getResolutionStatusLabel = (status?: ResolutionStatus): string => {
  switch (status) {
    case ResolutionStatus.Pending:
      return 'Chờ xử lý';
    case ResolutionStatus.InProgress:
      return 'Đang xử lý';
    case ResolutionStatus.Resolved:
      return 'Đã xử lý';
    case ResolutionStatus.Unresolved:
      return 'Không thể xử lý';
    default:
      return 'Không xác định';
  }
};

export const ProjectDifficultyDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as
    | IProjectDifficulty
    | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const [form] = Form.useForm();
  const [isLoading] = useState<boolean>(false);

  useEffect(() => {
    if (modalVisible && dataModal) {
      form.setFieldsValue({
        projectCode: dataModal.projectCode,
        projectName: dataModal.projectName,
        title: dataModal.title,
        content: dataModal.content,
        type: getTypeLabel(dataModal.type),
        level: getLevelLabel(dataModal.level),
        occurredDate: dataModal.occurredDate
          ? new Date(dataModal.occurredDate).toLocaleDateString('vi-VN')
          : '',
        resolutionStatus: getResolutionStatusLabel(dataModal.resolutionStatus),
        resolvedDate: dataModal.resolvedDate
          ? new Date(dataModal.resolvedDate).toLocaleDateString('vi-VN')
          : '',
        resolutionResult: dataModal.resolutionResult,
        note: dataModal.note,
      });
    } else {
      form.resetFields();
    }
  }, [modalVisible, dataModal, form]);

  const handleCancel = (): void => {
    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(null));
    form.resetFields();
  };

  return (
    <Modal
      show={modalVisible}
      size="lg"
      onHide={handleCancel}
      keyboard={true}
      scrollable={true}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">
          <HeaderTitle title="Chi tiết khó khăn, vướng mắc" />
        </Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical" disabled={true}>
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Mã dự án" name="projectCode">
                  <Input />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Tên dự án" name="projectName">
                  <Input />
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Tiêu đề" name="title">
                  <Input />
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Loại khó khăn" name="type">
                  <Input />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Mức độ" name="level">
                  <Input />
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày phát sinh" name="occurredDate">
                  <Input />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Trạng thái xử lý" name="resolutionStatus">
                  <Input />
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày xử lý" name="resolvedDate">
                  <Input />
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nội dung" name="content">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Kết quả xử lý" name="resolutionResult">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-end w-100">
          <Button className="btn-sm btn-secondary rounded-1 p-2" onClick={handleCancel}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
