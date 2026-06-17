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
  IProjectGroup,
  ICreateProjectGroupRequest,
  IUpdateProjectGroupRequest,
} from '@/models/ke-hoach-von';

import { handleFiles, handleImage } from '@/utils/utils';
import { requestPOST, requestPUT, API_URL } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import {
  getProjectGroupById,
} from '@/services/projectGroup.service';

export const ProjectGroupDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IProjectGroup | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IProjectGroup>();
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
        const response = await getProjectGroupById(id);
        if (response) {
          setAttachments(handleImage(response?.attachments ?? ''));
          form.setFieldsValue(response);
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

      const formData: ICreateProjectGroupRequest | IUpdateProjectGroupRequest = {
        ...(id && { id }),
        name: values.name,
        code: values.code,
        description: values.description,
        attachments: handleFiles(attachments ?? []),
        sortOrder: values.sortOrder,
        isActive: values.isActive ?? true,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`ProjectGroups/${id}`, formData)
        : await requestPOST<IResult<string>>(`ProjectGroups`, formData);

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
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} nhóm dự án</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form<IProjectGroup>
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
                  <Input placeholder="Mã nhóm dự án" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Tên"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên nhóm dự án' }]}
                >
                  <Input placeholder="Tên nhóm dự án" />
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
