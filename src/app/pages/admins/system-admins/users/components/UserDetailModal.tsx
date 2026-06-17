import { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Spin, Steps, Radio } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import { handleFiles, handleImage } from '@/utils/utils';
import { RootState } from '@/redux/RootReducer';
import { HOST_API, requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { IChuyenGia, IUserDetails, UserType } from '@/models';
import { Gender, IPaginationResponse, IPosition, IResult } from '@/models';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';

import { AppDispatch } from '@/redux/Store';
import { TDUploadFile } from '@/models/TDUploadFile';
import { ImageUpload, TDSelect, OrganizationUnitTreeSelect } from '@/app/components';
import { DEFAULT_USER_PASSWORD, GENDERS, USER_TYPES } from '@/data';


const defaultAccountType: UserType = UserType.Basic;

export const UserDetailModal = (props: any) => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IUserDetails | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [form] = Form.useForm();

  const [attachment, setAttachment] = useState<TDUploadFile[]>([]);
  const [buttonLoading, setButtonLoading] = useState(false);


  const [currentStep, setCurrentStep] = useState<number>(id ? 1 : 0);
  const [accountType, setAccountType] = useState<UserType | null>(id ? null : defaultAccountType);
  const [selectedChuyenGia, setSelectedChuyenGia] = useState<any>(null);
  const [existingUserId, setExistingUserId] = useState<string | null>(null);

  const accountTypeCardMeta: Record<UserType, { label: string; description: string; icon: string, note: string }> = {
    [UserType.Admin]: {
      label: 'Tài khoản quản trị',
      description: 'Dành cho lãnh đạo, quản trị viên hệ thống',
      icon: 'fa-user-shield',
      note: ' '
    },
    [UserType.Basic]: {
      label: 'Tài khoản chuyên viên',
      description: 'Dành cho chuyên viên, cán bộ NCKH',
      icon: 'fa-briefcase',
      note: ' '
    },
    [UserType.Specialist]: {
      label: 'Tài khoản chuyên gia',
      description: 'Dành cho chuyên gia',
      icon: 'fa-user-friends',
      note: ''
    },
    [UserType.FromPortal]: {
      label: 'Tài khoản từ cổng thông tin',
      description: 'Dành cho người dùng đăng ký từ cổng thông tin',
      icon: 'fa-users',
      note: 'Tài khoản sẽ được tự động tạo khi người dùng đăng ký từ cổng thông tin'
    }
  };

  const handleAccountTypeSelect = (value: UserType): void => {
    setAccountType(value);
    form.setFieldValue('type', value);
  };

  const handleUserNameOnBlur = async (): Promise<void> => {
    const userName = form.getFieldValue('userName');
    if (!id && !existingUserId && userName) {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<boolean>>(`users/check-username/${userName}`, 'neutral');

        if (response.data) {
          // hiển thị cảnh báo lỗi
          toast.error('Tên tài khoản đã tồn tại trong hệ thống!');
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setIsLoading(false);
      }
    }

  }


  const handleAccountTypeKeyDown = (event: KeyboardEvent<HTMLDivElement>, value: UserType): void => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      handleAccountTypeSelect(value);
    }
  };

  const isCreateFlow = !id;
  const handleStepChange = (nextStep: number): void => {
    if (!isCreateFlow) {
      return;
    }

    if (nextStep === 0) {
      form.setFieldValue('organizationUnitId', null);
      form.setFieldValue('in', null);
      setCurrentStep(0);
      return;
    }

    if (nextStep === 1 && accountType !== null) {
      setCurrentStep(1);
    }
  };
  const isSelectionStep = isCreateFlow && currentStep === 0;
  const shouldShowForm = !isCreateFlow || currentStep === 1;


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
          setAttachment(handleImage(_data?.imageUrl ?? ''));
          setAccountType((_data?.type ?? null) as UserType | null);
          form.setFieldValue('type', _data?.type ?? null);
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

  const handleCancel = () => {
    form.resetFields();
    if (id) {
      form.setFieldValue('type', null);
      setAccountType(null);
      setCurrentStep(1);
    } else {
      form.setFieldValue('type', defaultAccountType);
      setAccountType(defaultAccountType);
      setCurrentStep(0);
    }
    setAttachment([]);
    setSelectedChuyenGia(null);
    setExistingUserId(null);
    setButtonLoading(false);
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const effectiveId = existingUserId || id;

      const formData: IUserDetails = {
        ...values,
        ...(effectiveId && { id: effectiveId }),
        password: DEFAULT_USER_PASSWORD,
        confirmPassword: DEFAULT_USER_PASSWORD,
        imageUrl: handleFiles(attachment).join('##'),
        type: accountType as UserType,
        chuyenGiaId: selectedChuyenGia?.id,
      };

      const response = effectiveId
        ? await requestPUT<IResult<string>>(`users/${effectiveId}`, formData, 'neutral')
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

  useEffect(() => {
    if (!modalVisible) {
      return;
    }

    setButtonLoading(false);

    if (id) {
      setCurrentStep(1);
      const existingType = form.getFieldValue('type');
      setAccountType((existingType ?? null) as UserType | null);
    } else {
      setCurrentStep(0);
      form.resetFields();
      form.setFieldValue('type', defaultAccountType);
      setAccountType(defaultAccountType);
      setAttachment([]);
    }
  }, [modalVisible, id]);

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
        {isCreateFlow && (
          <>
            <Steps
              current={currentStep}
              onChange={handleStepChange}
              size="small"
              items={[
                { title: 'Loại tài khoản' },
                { title: 'Thông tin tài khoản' },
              ]}
              className="mb-4"
            />
            {isSelectionStep && (
              <div className="mt-4" data-tour='user-type'>
                <div className="row row-cols-1 row-cols-md-3 g-3">
                  {USER_TYPES.map(option => {
                    const typeId = option.id as UserType;
                    const meta = accountTypeCardMeta[typeId];
                    const isActive = accountType === typeId;
                    return (
                      <div className="col" key={option.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          className={`card h-100 account-type-card ${isActive ? 'border border-success border-2 shadow-sm' : 'border border-2 border-light'}`}
                          onClick={() => handleAccountTypeSelect(typeId)}
                          onKeyDown={event => handleAccountTypeKeyDown(event, typeId)}
                          aria-pressed={isActive}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isActive ? '#E8FFF3' : undefined,
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                          }}
                        >
                          <div className="card-body d-flex flex-column align-items-center justify-content-center text-center py-5">
                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center mb-3 ${isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'}`}
                              style={{ width: 64, height: 64 }}
                            >
                              <i className={`fa ${meta?.icon ?? 'fa-user'} fs-3`}></i>
                            </div>
                            <span className="fw-semibold fs-4 user-select-none">{meta?.label ?? option.name}</span>
                            {meta?.description ? <span className="text-muted fs-6 user-select-none">{meta.description}</span> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="success"
                    size="sm"
                    type="button"
                    onClick={() => handleStepChange(1)}
                    disabled={accountType === null}
                    data-tour='user-continue'
                  >
                    Tiếp tục &nbsp;
                    <i className="fas fa-arrow-right"></i>
                  </Button>
                </div>
              </div>
            )}
            {shouldShowForm && <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <span className='fw-normal fs-5 text-decoration-underline'>Đã chọn:</span>
                <div className="fs-5 fw-semibold">&nbsp;{accountTypeCardMeta[accountType as UserType]?.label ?? accountType}</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => handleStepChange(0)}
              >
                <i className="fas fa-arrow-left"></i>
                &nbsp;Chọn lại

              </Button>
            </div>}
          </>
        )}
        <Spin spinning={isLoading}>
          {shouldShowForm && !isLoading && (
            <Form form={form} layout="vertical" autoComplete="off"
              initialValues={{
                type: accountType,
                gender: Gender.female
              }}
              data-tour='user-input'>
              <Form.Item
                name="type"
                hidden
                rules={isCreateFlow ? [{ required: true, message: 'Vui lòng chọn loại tài khoản!' }] : []}
              >
                <Input type="hidden" />
              </Form.Item>

              <div className="row">
                <div className="col col-xl-4">
                  <Form.Item label="Ảnh đại diện">
                    <ImageUpload
                      accept={['.png', '.jpg', '.jpeg']}
                      URL={`${HOST_API}attachments/public`}
                      fileList={attachment}
                      data={{
                        generateThumbnail: true,
                      }}
                      onChange={e => {
                        setAttachment(e.fileList);
                      }} />
                  </Form.Item>
                </div>
                <div className="col col-xl-8">
                  <div className="row g-3">
                    {accountType === UserType.Specialist && !id && (
                      <div className="col-12 col-xl-6">
                        <Form.Item
                          label="Chọn chuyên gia"
                          name="chuyenGia"
                          rules={[{ required: true, message: 'Không được để trống!' }]}
                        >
                          <TDSelect
                            notFoundContent="Không tìm thấy dữ liệu"
                            reload
                            showSearch
                            placeholder="Chọn chuyên gia"
                            fetchOptions={async keyword => {
                              const res = await requestPOST<IPaginationResponse<IChuyenGia[]>>('chuyengias/search', {
                                pageNumber: 1,
                                pageSize: 1000,
                                keyword: keyword,
                              });
                              return (
                                res.data?.data?.map(item => ({
                                  ...item,
                                  label: item?.hoTen,
                                  value: item?.id,
                                })) ?? []
                              );
                            }}
                            onChange={(value, current: any) => {
                              if (value && current) {
                                setSelectedChuyenGia(current);

                                const hasExistingUser = current.userId;
                                if (hasExistingUser) {
                                  setExistingUserId(current.userId);
                                  form.setFieldsValue({
                                    userName: current.userName,
                                    fullName: current.hoTen,
                                    email: current.email,
                                    gender: current.gioiTinh,
                                    organizationUnitId: current.organizationUnitId,
                                  });
                                } else {
                                  setExistingUserId(null);
                                  form.setFieldsValue({
                                    userName: current.userName,
                                    fullName: current.hoTen,
                                    email: current.email,
                                    gender: current.gioiTinh,
                                    organizationUnitId: current.organizationUnitId,
                                  });
                                }
                                setAttachment(handleImage(current.dinhKem ?? ''));
                              } else {
                                setSelectedChuyenGia(null);
                                setExistingUserId(null);
                                form.setFieldsValue({
                                  userName: '',
                                  fullName: '',
                                  email: '',
                                });
                                setAttachment([]);
                              }
                            }}
                          />
                        </Form.Item>
                      </div>
                    )}
                    <div className="col-12 col-xl-6">
                      <Form.Item
                        label="Tên tài khoản"
                        name="userName"
                        rules={[{ required: true, message: 'Không được để trống!' }]}
                      >
                        <Input
                          onBlur={handleUserNameOnBlur}
                          disabled={!!id || !!existingUserId}
                          placeholder=" "
                          autoComplete=""
                          allowClear
                        />
                      </Form.Item>

                    </div>
                    <div className="col-12 col-xl-6">
                      <Form.Item label="Tên hiển thị" name="fullName" rules={[{ required: true, message: 'Không được để trống!' }]}>
                        <Input placeholder=" " allowClear />
                      </Form.Item>
                    </div>
                    <div className='col-12 col-lg-12 col-xl-6'>
                      <Form.Item
                        label="Thuộc đơn vị"
                        name="organizationUnitId"
                      // rules={[
                      //   { required: true, message: "Không được để trống!" },
                      // ]}
                      >
                        <OrganizationUnitTreeSelect />
                      </Form.Item>
                    </div>

                    <div className="col-12 col-xl-6">
                      <Form.Item label="Chức vụ" name="position">
                        <TDSelect
                          notFoundContent="Không tìm thấy dữ liệu"
                          reload
                          showSearch
                          placeholder=" "
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
                  </div>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-12 col-lg-6 col-xl-4">
                  <Form.Item
                    name='gender'
                    label="Giới tính"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <Radio.Group block >
                      {GENDERS?.map((item, key) => (
                        <Radio.Button
                          key={key}
                          value={item.id}
                        >
                          <span className='user-select-none'>{item.name}</span>
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                </div>
                <div className='col-12 col-lg-6 col-xl-4'>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      // { required: true, message: 'Không được để trống!' },
                      {
                        pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Chưa đúng định dạng email! Vui lòng kiểm tra lại!',
                      },
                    ]}
                  >
                    <Input placeholder=" " allowClear />
                  </Form.Item>
                </div>
                <div className='col-12 col-lg-6 col-xl-4'>
                  <Form.Item
                    label="Số điện thoại"
                    name="phoneNumber"
                    rules={[
                      {
                        pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g,
                        message: 'Chưa đúng định dạng của số điện thoại! Vui lòng kiểm tra lại!',
                      },
                    ]}
                  >
                    <Input placeholder=" " allowClear />
                  </Form.Item>
                </div>

              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button data-tour='user-save' className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish} disabled={buttonLoading || isSelectionStep}>
            <i className="fa-regular fa-floppy-disk"></i>
            Lưu
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

