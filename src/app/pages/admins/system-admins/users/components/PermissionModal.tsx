import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Col, Form, Row, Spin, Checkbox } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { requestGET, requestPOST } from '@/utils/baseAPI';
import type { IUserDetails } from '@/models';
import type { IGroupPermission, IPaginationResponse, IResult, IRole, IUserRole } from '@/models';

import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';

interface PermissionModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const PermissionModal = ({ visible, setVisible }: PermissionModalProps) => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((s: RootState) => s.modal.dataModal) as IUserDetails | null;
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [permissionGroupForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<IGroupPermission[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [rolesSelected, setRolesSelected] = useState<string[]>([]);
  const [permissionsSelected, setPermissionsSelected] = useState<string[]>([]);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Tối ưu: Gộp các request vào một hàm duy nhất
  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [rolesRes, groupsRes, urRes, upRes] = await Promise.all([
        requestPOST<IPaginationResponse<IRole[]>>('Roles/search', {}, 'neutral'),
        requestGET<IGroupPermission[]>('permissions/group', 'neutral'),
        requestGET<string[]>(`users/${id}/roles`, 'neutral'),
        requestGET<string[]>(`users/${id}/permissions`, 'neutral')
      ]);
      setRoles(rolesRes.data?.data ?? []);
      setPermissionGroups(groupsRes.data ?? []);
      setUserRoles(urRes.data ?? []);
      setUserPermissions(upRes.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tối ưu: Gộp hai effect thành một
  useEffect(() => {
    if (roles.length && permissionGroups.length) {
      const roleValues = userRoles.reduce((acc, rid) => ({ ...acc, [rid]: true }), {});
      roleForm.setFieldsValue(roleValues);

      const permValues = userPermissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {});
      permissionGroupForm.setFieldsValue(permValues);
    }
  }, [userRoles, userPermissions, roles, permissionGroups, roleForm, permissionGroupForm]);

  const fetchPermissionsByRoles = useCallback(async () => {
    if (!rolesSelected.length) return;
    try {
      const response = await requestPOST<string[]>(`roles/permissions`, rolesSelected, 'neutral');
      setPermissionsSelected(response.data || []);
    } catch (error) {
      toast.error('Không thể tải dữ liệu quyền');
    }
  }, [rolesSelected]);

  useEffect(() => {
    fetchPermissionsByRoles();
  }, [fetchPermissionsByRoles]);

  useEffect(() => {
    if (rolesSelected.length === 0) return;
    permissionGroupForm.resetFields();
    const vals = permissionsSelected.reduce((acc, perm) => ({ ...acc, [perm]: true }), {});
    permissionGroupForm.setFieldsValue(vals);
  }, [rolesSelected, permissionsSelected]);

  // Tối ưu: Cập nhật form permission sau khi có dữ liệu mới
  useEffect(() => {
    if (!permissionsSelected.length) return;
    const permValues = permissionsSelected.reduce((acc, perm) => ({ ...acc, [perm]: true }), {});
    permissionGroupForm.setFieldsValue(permValues);
  }, [permissionsSelected, permissionGroupForm]);

  const handleRoleChange = () => {
    const selectedRoles = Object.entries(roleForm.getFieldsValue())
      .filter(([_, v]) => v)
      .map(([k]) => k);
    setRolesSelected(selectedRoles);
  };

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
    setVisible(false);
  };

  // Tối ưu: Xử lý cập nhật đồng thời role và permission
  const onFinish = async () => {
    setButtonLoading(true);
    try {
      const [roleVals, permVals] = await Promise.all([
        roleForm.validateFields(),
        permissionGroupForm.validateFields()
      ]);

      const selectedRoles = Object.entries(roleVals)
        .filter(([_, v]) => v)
        .map(([k]) => k);

      const userRolesArray: IUserRole[] = roles.map(r => ({
        roleId: r.id,
        roleName: r.name,
        description: r.description,
        enabled: !!roleVals[r.id],
      }));

      const selectedPerms = Object.entries(permVals)
        .filter(([_, v]) => v)
        .map(([k]) => k);

      // Chờ cả hai request hoàn thành
      const [roleRes, permRes] = await Promise.all([
        requestPOST<IResult<string>>(`users/${id}/roles`, {
          userRoles: userRolesArray,
        }, 'neutral'),
        requestPOST<IResult<string>>(`users/permissions`, {
          userId: id,
          permissions: selectedPerms,
        }, 'neutral'),
      ]);

      // Kiểm tra kết quả đồng thời
      const roleSuccess = roleRes.status === 200;
      const permSuccess = permRes.status === 200;

      if (roleSuccess && permSuccess) {
        toast.success('Cập nhật vai trò và quyền thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
      } else {
        const errorMsg = [
          !roleSuccess && 'vai trò',
          !permSuccess && 'quyền'
        ].filter(Boolean).join(' và ');
        toast.error(`Cập nhật thất bại ở: ${errorMsg}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Thao tác thất bại, vui lòng thử lại!');
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <Modal
      show={visible}
      fullscreen
      size="xl"
      onExited={handleCancel}
      keyboard
      scrollable
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Vai trò, quyền</Modal.Title>
        <button type="button" className="btn-close btn-close-white" onClick={handleCancel} />
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <div className="d-flex flex-column gap-7 gap-lg-10">
              <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-semibold mb-n2">
                <li className="nav-item">
                  <a className="nav-link active" data-bs-toggle="tab" href="#tab_roles">Vai trò</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" data-bs-toggle="tab" href="#tab_perms">Quyền</a>
                </li>
              </ul>

              <div className="tab-content" id="myTabContent">
                <div className="tab-pane fade active show" id="tab_roles">
                  <div className="card card-custom card-flush">
                    <div className="card-body">
                      <Form form={roleForm} layout="vertical" autoComplete="off">
                        <Row gutter={[16, 16]}>
                          {roles.map((role) => (
                            <Col lg={24} key={role.id}>
                              <div className="d-flex align-items-center user-select-none">
                                <Form.Item
                                  name={role.id}
                                  valuePropName="checked"
                                  style={{ margin: 0 }}
                                >
                                  <Checkbox onChange={handleRoleChange} style={{ border: 'none' }} value={role.id} className="form-check-input mx-5" />
                                </Form.Item>
                                <label htmlFor={role.id} className="fw-bold fs-6">
                                  {role.name}
                                </label>
                              </div>
                              <div className="separator separator-dashed my-3" />
                            </Col>
                          ))}
                        </Row>
                      </Form>
                    </div>
                  </div>
                </div>

                <div className="tab-pane fade" id="tab_perms">
                  <div className="card card-custom card-flush">
                    <Form form={permissionGroupForm} layout="vertical" autoComplete="off">
                      {permissionGroups.map((group, gIdx) => (
                        <div key={gIdx} className="mb-3">
                          <h5 className="text-primary fw-bold px-4 py-4">
                            {gIdx + 1}. {group.section}
                          </h5>

                          <Row gutter={[16, 16]}>
                            {group.permissions.map((perm) => (
                              <Col lg={8} key={perm.value}>
                                <div className="d-flex align-items-center user-select-none">
                                  <Form.Item name={perm.value} valuePropName="checked" style={{ margin: 0 }}>
                                    <Checkbox style={{ border: 'none' }} value={perm.value} className="form-check-input mx-5" />
                                  </Form.Item>
                                  <label htmlFor={perm.value} className="fw-bold fs-6">
                                    {perm.description}
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
              </div>
            </div>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={onFinish} disabled={buttonLoading}>
            <i className="fa-regular fa-floppy-disk"></i>
            {'Lưu'}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};