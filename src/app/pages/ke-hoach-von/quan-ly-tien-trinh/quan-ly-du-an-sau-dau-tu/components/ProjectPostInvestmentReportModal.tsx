import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, DatePicker, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import {
  IProjectPostInvestmentReport,
  ReportType,
  IProject,
} from '@/models/ke-hoach-von';
import {
  createProjectPostInvestmentReport,
  getProjectPostInvestmentReportById,
  updateProjectPostInvestmentReport,
} from '@/services/projectPostInvestmentReport.service';
import * as actionsGlobal from '@/redux/global/Actions';
import { searchProjects } from '@/services/project.service';
import { TDSelect } from '@/app/components';

const { TextArea } = Input;

export const ProjectPostInvestmentReportModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModal
  ) as IProjectPostInvestmentReport & { readOnly?: boolean } | null;
  const modalVisible = useSelector(
    (state: RootState) => state.modal.modalVisible
  );

  const [form] = Form.useForm<IProjectPostInvestmentReport>();
  const [isLoading, setIsLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const id = dataModal?.id ?? null;
  const readOnly = !!dataModal?.readOnly;

  useEffect(() => {
    const loadDetail = async (): Promise<void> => {
      if (!id) {
        form.resetFields();
        return;
      }

      try {
        setIsLoading(true);
        const detail = await getProjectPostInvestmentReportById(id);
        if (detail) {
          const initialValues: IProjectPostInvestmentReport & {
            project?: { value: string; label: string };
          } = {
            ...detail,
            project: detail.projectId
              ? {
                  value: detail.projectId,
                  label: `${detail.projectCode || ''} - ${detail.projectName || ''}`,
                }
              : undefined,
          };
          form.setFieldsValue(initialValues);
        }
      } catch (error) {
        // comment: xử lý lỗi khi tải chi tiết báo cáo sau đầu tư
        console.error('Error loading post investment report detail:', error);
        toast.error('Không thể tải chi tiết báo cáo sau đầu tư. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    if (modalVisible && id) {
      loadDetail();
    }

    if (modalVisible && !id) {
      form.resetFields();
    }
  }, [id, form, modalVisible]);

  const handleCancel = (): void => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(null));
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true) as IProjectPostInvestmentReport & {
        project?: { value: string; label: string };
      };

      setButtonLoading(true);

      const payload: IProjectPostInvestmentReport = {
        ...values,
        projectId: values.projectId || values.project?.value,
        reportDate: values.reportDate
          ? dayjs(values.reportDate as any).toISOString()
          : undefined,
      };

      if (!payload.projectId) {
        toast.error('Vui lòng chọn dự án!');
        setButtonLoading(false);
        return;
      }

      if (id) {
        await updateProjectPostInvestmentReport(id, {
          id,
          reportNumber: payload.reportNumber,
          reportDate: payload.reportDate,
          title: payload.title,
          content: payload.content,
          type: payload.type,
          attachments: payload.attachments,
          note: payload.note,
        });
        toast.success('Cập nhật báo cáo sau đầu tư thành công!');
      } else {
        await createProjectPostInvestmentReport({
          projectId: payload.projectId,
          reportNumber: payload.reportNumber,
          reportDate: payload.reportDate,
          title: payload.title!,
          content: payload.content,
          type: payload.type,
          attachments: payload.attachments,
          note: payload.note,
        });
        toast.success('Thêm mới báo cáo sau đầu tư thành công!');
      }

      dispatch(actionsGlobal.setRandom());
      handleCancel();
    } catch (error) {
      // comment: xử lý lỗi khi lưu báo cáo sau đầu tư
      console.error('Error saving post investment report:', error);
      if ((error as any)?.errorFields) {
        toast.error('Vui lòng kiểm tra lại các trường bắt buộc!');
      } else {
        toast.error('Không thể lưu báo cáo sau đầu tư. Vui lòng thử lại!');
      }
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <Modal
      show={modalVisible}
      fullscreen={'lg-down'}
      size="lg"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">
          {readOnly
            ? 'Chi tiết báo cáo sau đầu tư'
            : id
            ? 'Chỉnh sửa báo cáo sau đầu tư'
            : 'Thêm mới báo cáo sau đầu tư'}
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
          <Form<IProjectPostInvestmentReport>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={readOnly}
          >
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Dự án"
                  name="project"
                  rules={[{ required: true, message: 'Vui lòng chọn dự án!' }]}
                >
                  <TDSelect
                    placeholder="Chọn dự án"
                    fetchOptions={async keyword => {
                      const res = await searchProjects({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      const items = (res.data || []) as IProject[];
                      return (
                        items.map(item => ({
                          ...item,
                          label: `${item.code || ''} - ${item.name || ''}`,
                          value: item.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                    onChange={(value, option: any) => {
                      if (!value) {
                        form.setFieldsValue({
                          projectId: undefined,
                        } as any);
                        return;
                      }
                      form.setFieldsValue({
                        projectId: option?.id,
                      } as any);
                    }}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-3 col-lg-3">
                <Form.Item label="Số báo cáo" name="reportNumber">
                  <Input placeholder="Nhập số báo cáo" />
                </Form.Item>
              </div>
              <div className="col-xl-3 col-lg-3">
                <Form.Item label="Ngày báo cáo" name="reportDate">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày báo cáo"
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Tiêu đề"
                  name="title"
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề báo cáo!' }]}
                >
                  <Input placeholder="Nhập tiêu đề báo cáo" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Loại báo cáo" name="type">
                  <Select placeholder="Chọn loại báo cáo" allowClear>
                    <Select.Option value={ReportType.Monitoring}>Giám sát</Select.Option>
                    <Select.Option value={ReportType.Evaluation}>Đánh giá</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="col-xl-12">
                <Form.Item label="Nội dung báo cáo" name="content">
                  <TextArea rows={4} placeholder="Nhập nội dung báo cáo" />
                </Form.Item>
              </div>
              <div className="col-xl-12">
                <Form.Item label="Ghi chú" name="note">
                  <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!readOnly && (
          <div className="d-flex justify-content-center align-items-center">
            <Button
              className="btn-sm btn-primary rounded-1 p-2 ms-2"
              onClick={handleSubmit}
              disabled={buttonLoading}
            >
              <i className="fa-regular fa-floppy-disk"></i>
              {id ? 'Lưu' : 'Tạo mới'}
            </Button>
          </div>
        )}
        <div className="d-flex justify-content-center align-items-center">
          <Button
            className="btn-sm btn-secondary rounded-1 p-2 ms-2"
            onClick={handleCancel}
            disabled={buttonLoading}
          >
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};


