import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IUserUpdateLog, UserUpdateActionType } from '@/models';
import dayjs from 'dayjs';

const { TextArea } = Input;

const getActionTypeLabel = (actionType: string): string => {
  switch (actionType) {
    case UserUpdateActionType.ProfileUpdated:
      return 'Cập nhật profile';
    case UserUpdateActionType.PasswordChanged:
      return 'Đổi mật khẩu';
    case UserUpdateActionType.PermissionsUpdated:
      return 'Cập nhật quyền';
    case UserUpdateActionType.RolesUpdated:
      return 'Cập nhật vai trò';
    default:
      return actionType;
  }
};

export const UserUpdateLogModal = () => {
  const dispatch: AppDispatch = useDispatch();

  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IUserUpdateLog | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IUserUpdateLog>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!id) return;

      setIsLoading(true);
      try {
        if (dataModal) {
          form.setFieldsValue(dataModal);
        }
      } catch (error) {
        console.error('Error loading modal data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, dataModal, form]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
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
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IUserUpdateLog> form={form} layout="vertical" autoComplete="off">
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Người dùng" name="fullName">
                    <Input placeholder="" disabled />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tài khoản" name="userName">
                    <Input placeholder="" disabled />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Loại hành động" name="actionType">
                    <Input 
                      placeholder="" 
                      disabled 
                      value={dataModal?.actionType ? getActionTypeLabel(dataModal.actionType) : ''}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Thời gian" name="createdOn">
                    <Input 
                      placeholder="" 
                      disabled 
                      value={dataModal?.createdOn ? dayjs(dataModal.createdOn).format('DD/MM/YYYY HH:mm:ss') : ''}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Người thực hiện" name="createdByName">
                    <Input placeholder="" disabled />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Mô tả" name="description">
                    <TextArea rows={3} placeholder="" disabled />
                  </Form.Item>
                </div>
                {dataModal?.oldValues && (
                  <div className="col-xl-12">
                    <Form.Item label="Giá trị cũ" name="oldValues">
                      <TextArea rows={5} placeholder="" disabled />
                    </Form.Item>
                  </div>
                )}
                {dataModal?.newValues && (
                  <div className="col-xl-12">
                    <Form.Item label="Giá trị mới" name="newValues">
                      <TextArea rows={5} placeholder="" disabled />
                    </Form.Item>
                  </div>
                )}
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
