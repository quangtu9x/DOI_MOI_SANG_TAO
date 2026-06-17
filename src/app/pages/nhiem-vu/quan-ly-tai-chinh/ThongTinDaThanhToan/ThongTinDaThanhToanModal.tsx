import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IThongTinDaThanhToan, IResult, IPaginationResponse } from '@/models';
import { API_URL, requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { FileUpload, TDSelect } from '@/app/components';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';

export const ThongTinDaThanhToanModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModalCapMot) as any;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleCapMot);
  const id = dataModal?.id ?? null;
  const phieuDeNghiThanhToanId = dataModal?.phieuDeNghiThanhToanId ?? null;

  const [form] = Form.useForm<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<any>>(`ThongTinDaThanhToans/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));
          _data.ngayThanhToan = toViewDate(_data.ngayThanhToan);
          _data.phieuDeNghiThanhToan = _data.phieuDeNghiThanhToanId ? { label: _data.phieuDeNghiThanhToanMaPhieu, value: _data.phieuDeNghiThanhToanId } : null;
          form.setFieldsValue(_data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchData();
    } else {
      form.setFieldsValue({
        phieuDeNghiThanhToanId: phieuDeNghiThanhToanId,
        ngayThanhToan: dayjs(),
      });
    }
  }, [id, phieuDeNghiThanhToanId, form]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisibleCapMot(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formData: IThongTinDaThanhToan = {
        ...values,
        id: id,
        ngayThanhToan: toSaveDate(values.ngayThanhToan),
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`ThongTinDaThanhToans/${id}`, formData)
        : await requestPOST<IResult<string>>(`ThongTinDaThanhToans`, formData);

      if (response?.status === 200) {
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
        <Modal.Title className="text-white">
          {dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} thông tin đã thanh toán
        </Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              disabled={dataModal?.readOnly ?? false}
            >
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Phiếu đề nghị thanh toán" name="phieuDeNghiThanhToan" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn phiếu đề nghị thanh toán"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`PhieuDeNghiThanhToans/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                        });
                        return (
                          res.data?.data?.map(item => ({
                            ...item,
                            label: item?.maPhieu,
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                      onChange={(value, current: any) => {
                        if (value) {
                          form.setFieldValue('phieuDeNghiThanhToanId', current?.id);
                        } else {
                          form.setFieldValue('phieuDeNghiThanhToanId', null);
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item name="phieuDeNghiThanhToanId" hidden><Input /></Form.Item>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <Form.Item
                    label="Ngày thanh toán"
                    name="ngayThanhToan"
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <DatePicker placeholder="Chọn ngày" format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <Form.Item
                    label="Số tiền thanh toán"
                    name="soTienThanhToan"
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <InputNumber
                      placeholder="Nhập số tiền"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value = '') => value.replace(/\$\s?|(,*)/g, '')}
                      style={{ width: '100%' }}
                      addonAfter="VND"
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <Form.Item label="Số tiền tạm ứng đã khấu trừ" name="soTienTamUngDaKhauTru">
                    <InputNumber
                      placeholder="Nhập số tiền"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value = '') => value.replace(/\$\s?|(,*)/g, '')}
                      style={{ width: '100%' }}
                      addonAfter="VND"
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <Form.Item label="Số tiền thực nhận" name="soTienThucNhan">
                    <InputNumber
                      placeholder="Nhập số tiền"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value = '') => value.replace(/\$\s?|(,*)/g, '')}
                      style={{ width: '100%' }}
                      addonAfter="VND"
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <Form.Item label="Số chứng từ" name="soChungTu">
                    <Input placeholder="Nhập số chứng từ" />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Ghi chú" name="ghiChu">
                    <Input.TextArea rows={2} placeholder="Nhập ghi chú" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Đính kèm" name="dinhKem">
                    <FileUpload
                      accept={['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc']}
                      multiple={true}
                      URL={`${API_URL}/api/v1/attachments/public`}
                      fileList={dinhKem}
                      onChange={e => {
                        setDinhKem(e.fileList);
                      }}
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
