import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IResult } from '@/models/response';
import {
  IProjectType,
  ICreateProjectTypeRequest,
  IUpdateProjectTypeRequest,
} from '@/models/ke-hoach-von';

import { handleFiles, handleImage } from '@/utils/utils';
import { requestGET, requestPOST, requestPUT, API_URL } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import {
  getProjectTypeById,
} from '@/services/projectType.service';
import { searchProjectGroups } from '@/services/projectGroup.service';

export const ProjectTypeDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IProjectType | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IProjectType>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      if (!id) {
        form.resetFields();
        setAttachments([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getProjectTypeById(id);
        if (response) {
          setAttachments(handleImage(response?.attachments ?? ''));
          
          // Load thông tin nhóm dự án để hiển thị tên
          let projectGroupValue: any = null;
          if (response.projectGroupId) {
            try {
              const projectGroupResponse = await requestGET<IResult<any>>(`ProjectGroups/${response.projectGroupId}`);
              if (projectGroupResponse?.data?.data) {
                projectGroupValue = {
                  value: projectGroupResponse.data.data.id,
                  label: `${projectGroupResponse.data.data.code || ''} - ${projectGroupResponse.data.data.name || ''}`,
                };
              }
            } catch (error) {
              // Silent fail
            }
          }

          form.setFieldsValue({
            ...response,
            projectGroupId: projectGroupValue as any,
          });
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, form]);

  const handleCancel = (): void => {
    form.resetFields();
    setAttachments([]);
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async (): Promise<void> => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const formData: ICreateProjectTypeRequest | IUpdateProjectTypeRequest = {
        ...(id && { id }),
        name: values.name,
        code: values.code,
        description: values.description,
        attachments: handleFiles(attachments ?? []),
        projectGroupId: values.projectGroupId?.value || values.projectGroupId,
        sortOrder: values.sortOrder,
        isActive: values.isActive ?? true,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`ProjectTypes/${id}`, formData)
        : await requestPOST<IResult<string>>(`ProjectTypes`, formData);

      if (response?.data?.succeeded) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo: any) {
      const errorMessage =
        errorInfo?.response?.data?.message || errorInfo?.message || 'Thao tác thất bại, vui lòng thử lại!';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
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
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} loại dự án</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form<IProjectType>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin chung" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Mã"
                  name="code"
                >
                  <Input placeholder="Mã loại dự án" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Tên"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên loại dự án' }]}
                >
                  <Input placeholder="Tên loại dự án" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nhóm dự án" name="projectGroupId">
                  <TDSelect
                    placeholder="Chọn nhóm dự án"
                    fetchOptions={async keyword => {
                      const res = await searchProjectGroups({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      const filtered = res.data ?? [];
                      return filtered.map(item => ({
                        ...item,
                        label: `${item.code || ''} - ${item.name || ''}`,
                        value: item.id,
                      }));
                    }}
                    showSearch
                    reload
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Thứ tự sắp xếp" name="sortOrder">
                  <Input type="number" placeholder="Thứ tự sắp xếp" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nội dung" name="description">
                  <Input.TextArea rows={4} placeholder="Nội dung" />
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
            <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={onFinish} disabled={buttonLoading}>
              <i className="fa-regular fa-floppy-disk"></i>
              {id ? 'Lưu' : 'Tạo mới'}
            </Button>
          </div>
        )}
        <div className="d-flex justify-content-center align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
