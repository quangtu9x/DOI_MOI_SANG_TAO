import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Select, Spin, DatePicker, Checkbox, TreeSelect } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import { handleFiles, handleImage } from '@/utils/utils';
import { getAuth } from '@/app/modules/auth/core/AuthHelpers';
import { RootState } from '@/redux/RootReducer';
import { FILE_URL, requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { IUserDetails } from '@/models';
import { IOrganizationUnit, IPaginationResponse, IPosition, IResult } from '@/models';

import * as actionsModal from '@/redux/organization-unit/Actions';
import * as actionsGlobal from '@/redux/global/Actions';

import { AppDispatch } from '@/redux/Store';
import { TDUploadFile } from '@/models/TDUploadFile';
import { ImageUpload, TDSelect } from '@/app/components';
import { DEFAULT_USER_PASSWORD } from '@/data';



export const UserDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.organizationUnit.userDataModal) as IUserDetails | null;
  const modalVisible = useSelector((state: RootState) => state.organizationUnit.addUserModalVisible);
  const currentOrganizationUnit = useSelector((state: RootState) => state.organizationUnit.selectedOrganizationUnit);
  const id = dataModal?.id ?? null;
  const [treeData, setTreeData] = useState<IOrganizationUnit[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [form] = Form.useForm();

  const [image, setImage] = useState<TDUploadFile[]>([]);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IUserDetails>(`users/${id}`, 'neutral');
        const _data = response?.data ?? null;
        if (_data) {
          _data.position = _data?.positionId ? {
            label: _data?.positionName,
            value: _data?.positionId,
          } : null
          _data.dateOfBirth = _data?.dateOfBirth ? dayjs(_data?.dateOfBirth) : null;
          form.setFieldsValue(_data);
          setImage(handleImage(_data?.imageUrl ?? '', FILE_URL));
        }
      } catch (error) {
        console.error('Error fetching organization unit:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchOrganizationUnit = async (): Promise<void> => {
      try {
        const response = await requestPOST<IPaginationResponse<IOrganizationUnit[]>>('organizationunits/search', {
          advancedSearch: {
            fields: ['name', 'code'],
            keyword: null,
          },
          allowParentCodeNull: null,
          allowParentIdNull: null,
          pageNumber: 1,
          pageSize: 100000,
          orderBy: ['name'],
        });

        if (response?.data?.data) {
          const buildTreeSelect = (items, id = null, link = "parentId") =>
            items
              .filter((item) => item[link] === id)
              .map((item) => ({
                ...item,
                title: item.name,
                key: item.code,
                value: item.id,
                children: buildTreeSelect(items, item.id),
              }));
          let treeData = buildTreeSelect(response?.data?.data ?? []);
          setTreeData(treeData);
        }
      } catch (error) {
        console.error('Fetch organization units error:', error);
      }
    }
    fetchOrganizationUnit()
  }, []);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setAddUserModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);
      const imageUrls = handleFiles(image);
      const formData: IUserDetails = {
        ...values,
        ...(id && { id }),
        password: DEFAULT_USER_PASSWORD,
        confirmPassword: DEFAULT_USER_PASSWORD,
        imageUrl: imageUrls.join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`users/${id}`, formData, 'neutral')
        : await requestPOST<IResult<string>>(`users`, formData, 'neutral');

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
        <Modal.Title className="text-white">{id ? 'Chi tiết' : 'Thêm mới'}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form
              initialValues={{
                organizationUnitId: !id ? currentOrganizationUnit?.id ?? null : null,
              }}
              form={form}
              layout="vertical"
              autoComplete="off">
              <div className="row ">
                <div className="col col-xl-4">
                  <Form.Item label="Ảnh đại diện">
                    <ImageUpload URL={`${FILE_URL}/api/v1/attachments/public`} fileList={image} onChange={e => setImage(e.fileList)} />
                  </Form.Item>
                </div>
                <div className="col col-xl-8">
                  <div className="row">
                    <div className="col-xl-6">
                      <Form.Item label="Tên tài khoản" name="userName" rules={[{ required: true, message: 'Không được để trống!' }]}>
                        <Input placeholder="Tên tài khoản" autoComplete="" />
                      </Form.Item>
                    </div>
                    <div className="col-xl-6">
                      <Form.Item label="Tên hiển thị" name="fullName" rules={[{ required: true, message: 'Không được để trống!' }]}>
                        <Input placeholder="Tên hiển thị" />
                      </Form.Item>
                    </div>
                    <div className="col-xl-6">
                      <Form.Item
                        label="Thuộc đơn vị"
                        name="organizationUnitId"
                      >
                        <TreeSelect
                          allowClear
                          style={{ width: "100%" }}
                          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                          treeData={treeData}
                          placeholder="Chọn đơn vị"
                        />
                      </Form.Item>
                    </div>
                    <div className="col-xl-6">
                      <Form.Item label="Chức vụ" name="position">
                        <TDSelect
                          notFoundContent="Không tìm thấy dữ liệu"
                          reload
                          showSearch
                          placeholder="Chọn chức vụ"
                          fetchOptions={async keyword => {
                            const res = await requestPOST<IPaginationResponse<IPosition[]>>(`positions/search`, {
                              pageNumber: 1,
                              pageSize: 1000,
                              keyword: keyword,
                            });
                            return (
                              res.data?.data?.map(item => ({
                                ...item,
                                label: item?.name,
                                value: item?.id,
                              })) ?? []
                            );
                          }}
                          onChange={(value, current: any) => {
                            if (value) {
                              form.setFieldValue('positionId', current?.id);
                            } else {
                              form.setFieldValue('positionId', null);
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                    {/* {id ? (
                      <></>
                    ) : (
                      <>
                        <div className="col-xl-6">
                          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Không được để trống!' }]}>
                            <Input.Password
                              placeholder="Mật khẩu"
                              size="small"
                              iconRender={visible =>
                                visible ? (
                                  <div className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1">
                                    <i className="fa-regular fa-trash"></i>
                                  </div>
                                ) : (
                                  <div className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1">
                                    <i className="fa fa-eye-slash"></i>
                                  </div>
                                )
                              }
                            />
                          </Form.Item>
                        </div>
                        <div className="col-xl-6">
                          <Form.Item
                            label="Nhập lại mật khẩu"
                            name="confirmPassword"
                            dependencies={['password']}
                            rules={[
                              { required: true, message: 'Không được để trống!' },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('Không khớp với mật khẩu đã nhập!'));
                                },
                              }),
                            ]}
                          >
                            <Input.Password
                              size="small"
                              placeholder="Nhập lại mật khẩu"
                              iconRender={visible =>
                                visible ? (
                                  <div className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1">
                                    <i className="fa-regular fa-trash"></i>
                                  </div>
                                ) : (
                                  <div className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1">
                                    <i className="fa fa-eye-slash"></i>
                                  </div>
                                )
                              }
                            />
                          </Form.Item>
                        </div>
                      </>
                    )} */}

                  </div>
                </div>
              </div>
              <div className="row">

                <div className="col-xl-4 col-lg-6">
                  <Form.Item label="Giới tính" name="gender">
                    <Select placeholder="Chọn giới tính">
                      <Select.Option value="Nam">Nam</Select.Option>
                      <Select.Option value="Nữ">Nữ</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <Form.Item label="Ngày sinh" name="dateOfBirth">
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <Form.Item
                    label="Số điện thoại liên hệ"
                    name="phoneNumber"
                    rules={[
                      {
                        pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g,
                        message: 'Chưa đúng định dạng của số điện thoại! Vui lòng kiểm tra lại!',
                      },
                    ]}
                  >
                    <Input placeholder="Nhập số điện thoại liên hệ" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <Form.Item
                    label="Email liên hệ"
                    name="email"
                    rules={[
                      // {required: true, message: 'Không được để trống!'},
                      {
                        pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Chưa đúng định dạng email! Vui lòng kiểm tra lại!',
                      },
                    ]}
                  >
                    <Input placeholder="Nhập email liên hệ" />
                  </Form.Item>
                </div>
                <div className="col-xl-8 col-lg-8">
                  <Form.Item label="Địa chỉ" name="address">
                    <Input placeholder="Nhập địa chỉ" />
                  </Form.Item>
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