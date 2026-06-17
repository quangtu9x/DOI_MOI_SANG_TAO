import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, InputNumber, DatePicker, Spin } from 'antd';
import { Modal } from 'react-bootstrap';
import dayjs from 'dayjs';

import { IProject, ProjectStatus, ProjectPhase } from '@/models/ke-hoach-von';
import { getProjectById } from '@/services/project.service';
import * as actionsModal from '@/redux/modal/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { HeaderTitle } from '@/app/components';
import { formatNumber } from '@/utils/utils';

const getStatusLabel = (status?: ProjectStatus): string => {
  switch (status) {
    case ProjectStatus.Draft:
      return 'Nháp';
    case ProjectStatus.Planning:
      return 'Đang lập kế hoạch';
    case ProjectStatus.Approved:
      return 'Đã phê duyệt';
    case ProjectStatus.Executing:
      return 'Đang thực hiện';
    case ProjectStatus.Suspended:
      return 'Tạm dừng';
    case ProjectStatus.Completed:
      return 'Hoàn thành';
    case ProjectStatus.Cancelled:
      return 'Hủy bỏ';
    default:
      return 'Không xác định';
  }
};

const getPhaseLabel = (phase?: ProjectPhase): string => {
  switch (phase) {
    case ProjectPhase.Preparation:
      return 'Chuẩn bị đầu tư';
    case ProjectPhase.Implementation:
      return 'Thực hiện đầu tư';
    case ProjectPhase.Completion:
      return 'Kết thúc đầu tư';
    case ProjectPhase.PostInvestment:
      return 'Sau đầu tư';
    default:
      return 'Không xác định';
  }
};

const ChiTietModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IProject | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IProject>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!id) {
        return;
      }

      try {
        setIsLoading(true);
        const project = await getProjectById(id);

        if (project) {
          const formValues: any = {
            ...project,
            startDate: project.startDate ? dayjs(project.startDate) : null,
            expectedEndDate: project.expectedEndDate ? dayjs(project.expectedEndDate) : null,
            actualEndDate: project.actualEndDate ? dayjs(project.actualEndDate) : null,
          };

          form.setFieldsValue(formValues);
        }
      } catch (error) {
        console.error('Error fetching project detail:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    if (modalVisible && id) {
      fetchData();
    }
  }, [id, modalVisible, form]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const statusValue = form.getFieldValue('status') as ProjectStatus | undefined;
  const phaseValue = form.getFieldValue('currentPhase') as ProjectPhase | undefined;

  return (
    <Modal
      show={modalVisible}
      fullscreen="lg-down"
      size="xl"
      onHide={handleCancel}
      keyboard={true}
      scrollable={true}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết dự án</Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form<IProject> form={form} layout="vertical" autoComplete="off" disabled={true}>
            <HeaderTitle title="Thông tin chung" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Mã dự án" name="code">
                  <Input placeholder="Mã dự án" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Tên dự án" name="name">
                  <Input placeholder="Tên dự án" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Loại dự án" name="projectTypeName">
                  <Input placeholder="Loại dự án" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Nhóm dự án" name="projectGroupName">
                  <Input placeholder="Nhóm dự án" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Chủ đầu tư" name="investorName">
                  <Input placeholder="Chủ đầu tư" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Đơn vị quản lý" name="organizationUnitName">
                  <Input placeholder="Đơn vị quản lý" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Nhà thầu" name="contractorName">
                  <Input placeholder="Nhà thầu" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Nguồn vốn đầu tư" name="investmentCapitalSourceName">
                  <Input placeholder="Nguồn vốn đầu tư" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Trạng thái" name="status">
                  <Input value={statusValue !== undefined ? getStatusLabel(statusValue) : ''} readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Giai đoạn" name="currentPhase">
                  <Input value={phaseValue !== undefined ? getPhaseLabel(phaseValue) : ''} readOnly />
                </Form.Item>
              </div>
            </div>

            <HeaderTitle title="Thông tin vốn đầu tư" />
            <div className="row">
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Tổng mức đầu tư" name="totalInvestment">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => (value ? formatNumber(value as number) : '')}
                    readOnly
                  />
                </Form.Item>
              </div>
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Vốn đã phân bổ" name="allocatedCapital">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => (value ? formatNumber(value as number) : '')}
                    readOnly
                  />
                </Form.Item>
              </div>
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Vốn đã giải ngân" name="disbursedCapital">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => (value ? formatNumber(value as number) : '')}
                    readOnly
                  />
                </Form.Item>
              </div>
            </div>

            <HeaderTitle title="Thông tin thời gian" />
            <div className="row">
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Ngày bắt đầu" name="startDate">
                  <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} disabled />
                </Form.Item>
              </div>
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Ngày kết thúc dự kiến" name="expectedEndDate">
                  <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} disabled />
                </Form.Item>
              </div>
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Ngày kết thúc thực tế" name="actualEndDate">
                  <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} disabled />
                </Form.Item>
              </div>
            </div>

            <HeaderTitle title="Thông tin địa điểm thực hiện dự án" />
            <div className="row">
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Tỉnh/Thành phố" name="provinceName">
                  <Input placeholder="Tỉnh/Thành phố" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Phường/Xã" name="wardName">
                  <Input placeholder="Phường/Xã" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-12">
                <Form.Item label="Địa chỉ" name="address">
                  <Input.TextArea rows={3} placeholder="Địa chỉ" readOnly />
                </Form.Item>
              </div>
            </div>

            <HeaderTitle title="Mô tả chi tiết" />
            <div className="row">
              <div className="col-xl-12">
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea rows={3} placeholder="Mô tả" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-12">
                <Form.Item label="Mục tiêu" name="objectives">
                  <Input.TextArea rows={3} placeholder="Mục tiêu" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-12">
                <Form.Item label="Phạm vi" name="scope">
                  <Input.TextArea rows={3} placeholder="Phạm vi" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-12">
                <Form.Item label="Nội dung" name="content">
                  <Input.TextArea rows={3} placeholder="Nội dung" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-12">
                <Form.Item label="Kết quả mong đợi" name="expectedResults">
                  <Input.TextArea rows={3} placeholder="Kết quả mong đợi" readOnly />
                </Form.Item>
              </div>
              <div className="col-xl-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={3} placeholder="Ghi chú" readOnly />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={handleCancel}>
          Đóng
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChiTietModal;

