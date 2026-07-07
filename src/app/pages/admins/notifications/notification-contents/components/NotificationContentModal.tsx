import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, Form, Input, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { INotificationContent, IResult } from '@/models';
import { handleFiles, handleImage } from '@/utils/utils';
import { requestGET, requestPOST, requestPUT, API_URL } from '@/utils/baseAPI';
import { FileUpload } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';

const { TextArea } = Input;

export const NotificationContentModal = () => {
  const dispatch: AppDispatch = useDispatch();

  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as INotificationContent | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const readOnly = (dataModal as any)?.readOnly ?? false;

  const [form] = Form.useForm<INotificationContent>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [attachments, setAttachments] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!id) {
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
          sortOrder: 1,
        });
        setAttachments([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await requestGET<IResult<INotificationContent>>(`NotificationContents/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setAttachments(handleImage(_data?.attachments ?? ''));
          form.setFieldsValue(_data);
        }
      } catch (error) {
        console.error('Error fetching notification content:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    if (modalVisible) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, modalVisible]);

  const handleCancel = () => {
    form.resetFields();
    setAttachments([]);
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    if (readOnly) {
      handleCancel();
      return;
    }

    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const formData: any = {
        title: values.title,
        content: values.content,
        code: values.code,
        description: values.description || null,
        attachments: handleFiles(attachments ?? []),
        sortOrder: values.sortOrder || 1,
        isActive: values.isActive ?? true,
      };

      if (id) {
        formData.id = id;
      }

      const response = id
        ? await requestPUT<IResult<string>>(`NotificationContents/${id}`, formData)
        : await requestPOST<IResult<string>>(`NotificationContents`, formData);

      if (response?.status === 200 || response?.data?.succeeded) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
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
        <Modal.Title className="text-white">{id ? (readOnly ? 'Chi tiết' : 'Chỉnh sửa') : 'Tạo mới'} nội dung thông báo</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<INotificationContent> 
              form={form}
              initialValues={{ sortOrder: 1, isActive: true }}
              layout="vertical" 
              autoComplete="off"
            >
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item 
                    label="Tiêu đề" 
                    name="title" 
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <Input placeholder="Nhập tiêu đề thông báo" disabled={readOnly} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item 
                    label="Mã thông báo" 
                    name="code" 
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <Input placeholder="Nhập mã thông báo" disabled={readOnly} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item 
                    label="Thứ tự" 
                    name="sortOrder" 
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <InputNumber 
                      placeholder="Nhập thứ tự" 
                      min={0} 
                      max={1000} 
                      style={{ width: '100%' }} 
                      disabled={readOnly}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item 
                    label="Nội dung" 
                    name="content" 
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <TextArea 
                      rows={6} 
                      placeholder="Nhập nội dung thông báo" 
                      disabled={readOnly}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Mô tả" name="description">
                    <TextArea 
                      rows={3} 
                      placeholder="Nhập mô tả" 
                      disabled={readOnly}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tài liệu đính kèm" name="attachments">
                    <FileUpload
                      fileList={attachments}
                      onChange={(e) => setAttachments(e.fileList)}
                      multiple={true}
                      URL={`${API_URL}/api/v1/attachments/public`}
                      isReadOnly={readOnly}
                      isUseAliyunOSS
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label=" " name="isActive" valuePropName="checked">
                    <Checkbox disabled={readOnly}>Hoạt động</Checkbox>
                  </Form.Item>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!readOnly && (
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
