import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IProjectOperationMaintenance, MaintenanceType, IProject } from '@/models/ke-hoach-von';
import { HeaderTitle, TDSelect, FileUpload } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { handleImage } from '@/utils/utils';
import { API_URL } from '@/utils/baseAPI';
import { getProjectOperationMaintenanceById } from '@/services/projectOperationMaintenance.service';
import { searchProjects, getProjectById } from '@/services/project.service';

type ProjectOperationMaintenanceWithUiFlags = IProjectOperationMaintenance & {
  readOnly?: boolean;
};

type ProjectOperationMaintenanceFormValues = Omit<IProjectOperationMaintenance, 'operationDate'> & {
  operationDate?: Dayjs;
};

export const ProjectOperationMaintenanceViewModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModalViewOperationMaintenance
  ) as ProjectOperationMaintenanceWithUiFlags | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleViewOperationMaintenance);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ProjectOperationMaintenanceFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        if (id) {
          const response = await getProjectOperationMaintenanceById(id);
          if (response) {
            const { operationDate, ...restData } = response;
            
            // Load thông tin project để hiển thị tên trong TDSelect
            let projectValue: any = null;
            if (response.projectId) {
              try {
                const project = await getProjectById(response.projectId);
                projectValue = {
                  value: project.id!,
                  label: `${project.code || ''} - ${project.name || ''}`,
                };
              } catch (error) {
                console.error('Error loading project:', error);
                projectValue = response.projectId;
              }
            }
            
            const formValues: any = {
              ...restData,
              projectId: projectValue,
              operationDate: operationDate ? dayjs(operationDate) : undefined,
            };
            setAttachments(handleImage(response?.attachments ?? ''));
            form.setFieldsValue(formValues);
          }
        } else {
          form.resetFields();
          setAttachments([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (modalVisible) {
      fetchData();
    }
  }, [id, modalVisible, form]);

  const handleCancel = () => {
    form.resetFields();
    setAttachments([]);
    dispatch(actionsModal.setModalVisibleViewOperationMaintenance(false));
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
        <Modal.Title className="text-white">Chi tiết vận hành và bảo trì</Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form<ProjectOperationMaintenanceFormValues>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={true}
          >
            <HeaderTitle title="Thông tin chung" />
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Dự án" name="projectId">
                  <TDSelect
                    placeholder="Chọn dự án"
                    fetchOptions={async keyword => {
                      const res = await searchProjects({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.map((item: IProject) => ({
                          ...item,
                          label: `${item.code || ''} - ${item.name || ''}`,
                          value: item.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                    disabled
                  />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Tiêu đề" name="title">
                  <Input placeholder="Tiêu đề" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Loại" name="type">
                  <Select placeholder="Chọn loại" style={{ width: '100%' }} disabled>
                    <Select.Option value={MaintenanceType.Operation}>Vận hành</Select.Option>
                    <Select.Option value={MaintenanceType.Maintenance}>Bảo trì</Select.Option>
                    <Select.Option value={MaintenanceType.Repair}>Sửa chữa</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày vận hành/bảo trì" name="operationDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nội dung" name="content">
                  <Input.TextArea rows={4} placeholder="Nội dung vận hành/bảo trì" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={3} placeholder="Ghi chú" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Tài liệu đính kèm" name="attachments">
                  <FileUpload
                    fileList={attachments}
                    onChange={() => {}}
                    multiple={true}
                    URL={`${API_URL}/api/v1/attachments/public`}
                    isReadOnly={true}
                    isUseAliyunOSS
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-end align-items-center">
          <Button className="btn btn-secondary btn-sm rounded-1 p-2" onClick={handleCancel}>
            <i className="fa fa-times me-2" />
            Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
