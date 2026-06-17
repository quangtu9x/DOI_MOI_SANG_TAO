import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, Form, Input, InputNumber, Spin } from 'antd';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { IPermissionItem, IResult } from '@/models';
import * as actionsGlobal from '@/redux/global/Actions';
import * as actionsModal from '@/redux/modal/Actions';
import { AppDispatch, RootState } from '@/redux/Store';
import { requestPOST, requestPUT } from '@/utils/baseAPI';

interface PermissionDetailModalProps {
  totalCount: number;
}

export const PermissionDetailModal = ({ totalCount }: PermissionDetailModalProps) => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IPermissionItem | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IPermissionItem>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (id && dataModal) {
      form.setFieldsValue(dataModal);
    } else {
      form.setFieldsValue({
        sortOrder: totalCount + 1,
        isSystem: false,
      } as IPermissionItem);
    }
    setIsLoading(false);
  }, [dataModal, form, id, totalCount]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const formData = form.getFieldsValue(true);

      const response = id
        ? await requestPUT<IResult<string>>(`Permissions/${id}`, { ...formData, id })
        : await requestPOST<IResult<string>>('Permissions', formData);

      if (response?.data?.succeeded) {
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
    <Modal show={modalVisible} fullscreen={'lg-down'} size="lg" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết quyền</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IPermissionItem> form={form} layout="vertical" autoComplete="off">
              <div className="row">
                <div className="col-xl-12">
                  <Form.Item label="Mã quyền" name="code" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="Permissions.Resource.Action" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tên quyền" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Phân hệ" name="subSystemCode">
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Thứ tự" name="sortOrder">
                    <InputNumber className="w-100" min={0} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6 d-flex align-items-center">
                  <Form.Item name="isSystem" valuePropName="checked" className="mb-0">
                    <Checkbox>Quyền hệ thống</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Ghi chú" name="description">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center align-items-center">
          <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={onFinish} disabled={buttonLoading}>
            <i className="fa-regular fa-floppy-disk"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
        </div>
        <div className="d-flex justify-content-center align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
