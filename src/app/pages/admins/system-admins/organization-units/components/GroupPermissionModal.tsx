import { useEffect, useState } from 'react';
import { Checkbox, Col, Form, Radio, Row, Spin } from 'antd';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { IGroupPermission } from '@/models';
import { requestGET, requestPOST } from '@/utils/baseAPI';

interface GroupPermissionModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  userIds: string[];
  onSuccess: () => void;
}

type PermissionMode = 'assign' | 'remove';

export const GroupPermissionModal = ({ visible, setVisible, userIds, onSuccess }: GroupPermissionModalProps) => {
  const [permissionGroupForm] = Form.useForm();
  const [mode, setMode] = useState<PermissionMode>('assign');
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [permissionGroups, setPermissionGroups] = useState<IGroupPermission[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await requestGET<IGroupPermission[]>('permissions/group', 'neutral');
        setPermissionGroups(response.data ?? []);
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải dữ liệu quyền. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancel = () => {
    permissionGroupForm.resetFields();
    setVisible(false);
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      const permissionValues = permissionGroupForm.getFieldsValue();
      const selectedPermissions = Object.entries(permissionValues)
        .filter(([, value]) => value)
        .map(([key]) => key);

      if (selectedPermissions.length === 0) {
        toast.warning('Vui lòng chọn ít nhất một quyền!');
        return;
      }

      const response = await requestPOST<string>(
        'users/group-permissions',
        {
          userIds,
          permissions: selectedPermissions,
          isAssign: mode === 'assign',
        },
        'neutral'
      );

      if (response.status === 200) {
        toast.success(mode === 'assign' ? 'Gán quyền thành công!' : 'Hủy gán quyền thành công!');
        onSuccess();
        handleCancel();
      } else {
        toast.error('Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Thao tác thất bại, vui lòng thử lại!');
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <Modal show={visible} fullscreen size="xl" keyboard scrollable onEscapeKeyDown={handleCancel} onExited={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Gán/Hủy gán quyền cho nhóm người dùng</Modal.Title>
        <button type="button" className="btn-close btn-close-white" onClick={handleCancel} />
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <div className="d-flex flex-column gap-5">
              <div className="d-flex align-items-center justify-content-between">
                <div className="fw-bold">Đã chọn {userIds.length} người dùng</div>
                <Radio.Group value={mode} onChange={event => setMode(event.target.value)}>
                  <Radio.Button value="assign">Gán quyền</Radio.Button>
                  <Radio.Button value="remove">Hủy gán quyền</Radio.Button>
                </Radio.Group>
              </div>

              <div className="card card-custom card-flush">
                <Form form={permissionGroupForm} layout="vertical" autoComplete="off">
                  {permissionGroups.map((group, groupIndex) => (
                    <div key={group.section} className="mb-3">
                      <h5 className="text-primary fw-bold px-4 py-4">
                        {groupIndex + 1}. {group.section}
                      </h5>

                      <Row gutter={[16, 16]}>
                        {group.permissions.map(permission => (
                          <Col lg={8} key={permission.value}>
                            <div className="d-flex align-items-center user-select-none">
                              <Form.Item name={permission.value} valuePropName="checked" style={{ margin: 0 }}>
                                <Checkbox style={{ border: 'none' }} value={permission.value} className="form-check-input mx-5" />
                              </Form.Item>
                              <label htmlFor={permission.value} className="fw-bold fs-6">
                                {permission.description}
                              </label>
                            </div>
                            <div className="separator separator-dashed my-3" />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ))}
                </Form>
              </div>
            </div>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5 ms-2" onClick={onFinish} disabled={buttonLoading}>
            <i className="fa-regular fa-floppy-disk"></i>
            Lưu
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
