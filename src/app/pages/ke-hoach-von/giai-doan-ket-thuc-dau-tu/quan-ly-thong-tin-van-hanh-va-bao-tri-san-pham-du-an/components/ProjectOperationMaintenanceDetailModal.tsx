import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IPaginationResponse, IResult } from '@/models';
import { IProjectOperationMaintenance, MaintenanceType } from '@/models/ke-hoach-von';
import { handleFiles, handleImage } from '@/utils/utils';
import { requestGET, requestPOST, requestPUT, API_URL } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import {
  getProjectOperationMaintenanceById,
  createProjectOperationMaintenance,
  updateProjectOperationMaintenance,
} from '@/services/projectOperationMaintenance.service';
import { searchProjects, getProjectById } from '@/services/project.service';

type ProjectOperationMaintenanceFormValues = Omit<IProjectOperationMaintenance, 'operationDate'> & {
  operationDate?: Dayjs;
};

export const ProjectOperationMaintenanceDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModal
  ) as IProjectOperationMaintenance | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ProjectOperationMaintenanceFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
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
                // Nếu không load được, vẫn set projectId để TDSelect có thể hiển thị
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
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      // Xử lý projectId: nếu là object thì lấy value, nếu không thì dùng trực tiếp
      const projectIdValue =
        typeof values.projectId === 'object' && values.projectId !== null
          ? values.projectId.value
          : values.projectId;

      const formData: any = {
        ...values,
        projectId: projectIdValue,
        operationDate: values.operationDate
          ? (values.operationDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        attachments: handleFiles(attachments ?? []).join('##'),
      };

      if (id) {
        await updateProjectOperationMaintenance(id, formData);
        toast.success('Cập nhật thành công!');
      } else {
        if (!formData.projectId) {
          toast.error('Vui lòng chọn dự án!');
          return;
        }
        await createProjectOperationMaintenance(formData);
        toast.success('Tạo mới thành công!');
      }
      dispatch(actionsGlobal.setRandom());
      handleCancel();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setButtonLoading(false);
    }
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
        <Modal.Title className="text-white">
          {dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} thông tin vận hành và bảo trì
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
          <Form<ProjectOperationMaintenanceFormValues>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin chung" />
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <Form.Item
                  label="Dự án"
                  name="projectId"
                  rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <TDSelect
                    placeholder="Chọn dự án"
                    fetchOptions={async keyword => {
                      const res = await searchProjects({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.map(item => ({
                          ...item,
                          label: `${item.code || ''} - ${item.name || ''}`,
                          value: item.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                    disabled={dataModal?.readOnly ?? false}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item
                  label="Tiêu đề"
                  name="title"
                  rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <Input placeholder="Tiêu đề" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Loại" name="type">
                  <Select placeholder="Chọn loại" style={{ width: '100%' }}>
                    <Select.Option value={MaintenanceType.Operation}>Vận hành</Select.Option>
                    <Select.Option value={MaintenanceType.Maintenance}>Bảo trì</Select.Option>
                    <Select.Option value={MaintenanceType.Repair}>Sửa chữa</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày vận hành/bảo trì" name="operationDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nội dung" name="content">
                  <Input.TextArea rows={4} placeholder="Nội dung vận hành/bảo trì" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={3} placeholder="Ghi chú" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Tài liệu đính kèm" name="attachments">
                  <FileUpload
                    fileList={attachments}
                    onChange={(e) => setAttachments(e.fileList)}
                    multiple={true}
                    URL={`${API_URL}/api/v1/attachments/public`}
                    isReadOnly={dataModal?.readOnly ?? false}
                    isUseAliyunOSS
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!dataModal?.readOnly && (
          <div className="d-flex justify-content-center align-items-center">
            <Button
              className="btn-sm btn-primary rounded-1 p-2 ms-2"
              onClick={onFinish}
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
