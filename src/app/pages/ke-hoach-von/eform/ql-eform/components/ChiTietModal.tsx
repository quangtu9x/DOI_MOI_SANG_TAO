import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, InputNumber, Spin, Switch, Checkbox } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IEform, IPaginationResponse, IResult } from '@/models';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, ImageUpload } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';

export const ChiTietModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props;
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as any | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const readOnly = dataModal?.readOnly ?? false;
  const [form] = Form.useForm<IEform>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [logo, setLogo] = useState<TDUploadFile[]>([]);
  const [background, setBackground] = useState<TDUploadFile[]>([]);
  const [isNhapThongTin, setIsNhapThongTin] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const res = await requestGET<IResult<IEform>>(`eforms/${id}`);
          const _data = res?.data?.data ?? null;
          if (_data) {
            // Transform date fields`
            _data.thoiGianBatDau = _data.thoiGianBatDau ? dayjs(_data.thoiGianBatDau) : undefined;
            _data.thoiGianKetThuc = _data.thoiGianKetThuc ? dayjs(_data.thoiGianKetThuc) : undefined;
            form.setFieldsValue(_data);

            // Initialize file lists
            if (_data.dinhKem) {
              const files = _data.dinhKem
                .split('##')
                .filter(Boolean)
                .map((url, index) => ({
                  uid: `${index}`,
                  name: url.split('/').pop() || `file-${index}`,
                  status: 'done',
                  url: url,
                }));
              setDinhKem(files as any);
            }

            if (_data.logo) {
              setLogo(handleImage(_data.logo) as any);
            }

            if (_data.background) {
              setBackground(handleImage(_data.background) as any);
            }
            setIsNhapThongTin(_data.isNhapThongTin);
          }
        } catch (error) {
          console.error('Error fetching eform:', error);
          toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [id, form]);

  const handleCancel = () => {
    form.resetFields();
    setDinhKem([]);
    setLogo([]);
    setBackground([]);
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formData: IEform = {
        ...values,
        ...(id && { id }),
        dinhKem: handleFiles(dinhKem).join('##'),
        logo: handleFiles(logo).join('##'),
        background: handleFiles(background).join('##'),
      };

      const response = id ? await requestPUT<IResult<string>>(`eforms/${id}`, formData) : await requestPOST<IResult<string>>(`eforms`, formData);

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
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IEform>
              initialValues={{
                isActive: true,
                isCongKhai: false,
                isNhapThongTin: false,
                isTen: false,
                isEmail: false,
                isDienThoai: false,
                isNamSinh: false,
                isDiaChi: false,
                isGioiTinh: false,
              }}
              form={form}
              layout="vertical"
              autoComplete="off"
              disabled={dataModal?.readOnly ?? false}
            >
              <HeaderTitle title={'Thông tin chung'} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tiêu đề" name="tieuDe" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="Nhập tiêu đề" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Logo" name="logo">
                    <ImageUpload
                      accept={['.png', '.jpg', '.jpeg']}
                      multiple={false}
                      URL={`${API_URL}/api/v1/attachments/public`}
                      maxCount={1}
                      fileList={logo}
                      onChange={e => {
                        setLogo(e.fileList);
                      }}
                      isUseAliyunOSS
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Ảnh nền" name="background">
                    <ImageUpload
                      accept={['.png', '.jpg', '.jpeg']}
                      multiple={false}
                      URL={`${API_URL}/api/v1/attachments/public`}
                      maxCount={1}
                      fileList={background}
                      onChange={e => {
                        setBackground(e.fileList);
                      }}
                      isUseAliyunOSS
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Thời gian bắt đầu" name="thoiGianBatDau">
                    <DatePicker className="w-100" format="DD/MM/YYYY" placeholder="Chọn thời gian" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Thời gian kết thúc" name="thoiGianKetThuc">
                    <DatePicker className="w-100" format="DD/MM/YYYY" placeholder="Chọn thời gian" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Công khai" name="isCongKhai" valuePropName="checked">
                    <Switch checkedChildren="Có" unCheckedChildren="Không" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Trạng thái hoạt động" name="isActive" valuePropName="checked">
                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                  </Form.Item>
                </div>
              </div>
              <HeaderTitle title={'Cấu hình thông tin thu thập'} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Yêu cầu nhập thông tin" name="isNhapThongTin" valuePropName="checked">
                    <Switch
                      checkedChildren="Có"
                      unCheckedChildren="Không"
                      onChange={value => {
                        console.log('isNhapThongTin changed:', value);
                        setIsNhapThongTin(value);
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item name="isTen" valuePropName="checked">
                    <Checkbox disabled={!isNhapThongTin}>Họ và tên</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item name="isEmail" valuePropName="checked">
                    <Checkbox disabled={!isNhapThongTin}>Email</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item name="isDienThoai" valuePropName="checked">
                    <Checkbox disabled={!isNhapThongTin}>Điện thoại</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item name="isNamSinh" valuePropName="checked">
                    <Checkbox disabled={!isNhapThongTin}>Năm sinh</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item name="isDiaChi" valuePropName="checked">
                    <Checkbox disabled={!isNhapThongTin}>Địa chỉ</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item name="isGioiTinh" valuePropName="checked">
                    <Checkbox disabled={!isNhapThongTin}>Giới tính</Checkbox>
                  </Form.Item>
                </div>
              </div>
              <HeaderTitle title={'Tài liệu đính kèm'} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Đính kèm" name="dinhKem">
                    <FileUpload
                      accept={['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc']}
                      multiple={true}
                      URL={`${API_URL}/api/v1/attachments/public`}
                      maxCount={5}
                      fileList={dinhKem}
                      onChange={e => {
                        setDinhKem(e.fileList);
                      }}
                      isUseAliyunOSS
                    />
                  </Form.Item>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!dataModal?.readOnly && (
          <div className="d-flex justify-content-center  align-items-center">
            <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish} disabled={buttonLoading}>
              <i className="fa-regular fa-floppy-disk"></i>
              {id ? 'Lưu' : 'Tạo mới'}
            </Button>
          </div>
        )}
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
