import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, Form, Input, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IRole, IResult, IGroupPermission, IRoleWithPermissionGroup, IPaginationResponse, IPermissionResponse } from '@/models';
import { removeAccents } from '@/utils/utils';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';




export const RoleDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IRole | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IRole>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [permissionGroups, setPermissionGroups] = useState<IGroupPermission[] | null>([]);


  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        if (!id) {
          const res = await requestGET<IGroupPermission[]>(`permissions/group`, 'neutral');
          setPermissionGroups(res?.data ?? []);
        }
        else {
          const resRoles = await requestGET<IPermissionResponse>(`roles/${id}/permissions/group`, 'neutral');
          if (resRoles?.data) {
            form.setFieldsValue({
              name: resRoles?.data?.name,
              description: resRoles?.data?.description,
            });
            setPermissionGroups(resRoles?.data?.groups ?? []);
          }
        }
        // const response = await requestGET<IResult<IRole>>(`Roles/${id}`);
        // const _data = response?.data?.data ?? null;
        // if (_data) {
        //   form.setFieldsValue(_data);
        // }
      } catch (error) {
        console.error('Error fetching organization unit:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };
  const onChangePermission = (event) => {
    const element = event.target;
    const permission = element.value;

    const newPermissionGroups = permissionGroups?.map((g) => {
      const updatedPermissions = g.permissions.map((p) => {
        if (p.value === permission) {
          return { ...p, active: element.checked };
        }
        return p;
      });

      return { ...g, permissions: updatedPermissions };
    });

    setPermissionGroups(newPermissionGroups!);
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const permissionElements = document.querySelectorAll(
        'input[name="permissions"]'
      );
      let permissionValues: { value: string; active: boolean }[] = [];

      permissionElements.forEach((input) => {
        const checkbox = input as HTMLInputElement;
        permissionValues.push({
          value: checkbox.value,
          active: checkbox.checked,
        });
      });

      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }
      formData.permissions = permissionValues;

      const response = await requestPOST<IResult<string>>(`Roles`, formData, 'neutral');

      if (response?.status == 200) {
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
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IRole>
              initialValues={{ sortOrder: totalCount + 1, isActive: true }}
              form={form} layout="vertical" autoComplete="off">
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    label="Tên"
                    name="name"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Ghi chú" name="description">
                    <Input placeholder="" />
                  </Form.Item>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-12 col-lg-12 mt-4">
                  <div className="card card-xl-stretch">
                    <div className="card-header">
                      <div className="card-title fw-bold text-header-td fs-4 mb-0">
                        Danh sách quyền
                      </div>
                    </div>
                    <div className="card-body">
                      <Spin spinning={isLoading}>
                        {!isLoading && (
                          <div className="row">
                            {permissionGroups?.map((group) => (
                              <div className="mb-3">
                                <p className="fw-bold">{group.section}</p>
                                <div className="row">
                                  {group.permissions.map((i) => (
                                    <div className="col-3 mb-1">
                                      <div className="d-flex align-items-center">
                                        <input
                                          name="permissions"
                                          type="checkbox"
                                          id={i.value}
                                          value={i.value}
                                          checked={i.active}
                                          className="me-2"
                                          onChange={(e) =>
                                            onChangePermission(e)
                                          }
                                        ></input>
                                        <label htmlFor={i.value}>
                                          {i.description}
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Spin>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish} disabled={buttonLoading}>
            <i className="fa-regular fa-floppy-disk"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};