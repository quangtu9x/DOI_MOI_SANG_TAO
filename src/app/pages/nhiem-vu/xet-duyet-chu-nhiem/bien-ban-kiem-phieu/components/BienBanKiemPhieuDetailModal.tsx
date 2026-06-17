import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AutoComplete, DatePicker, Form, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IBienBanKiemPhieu, IBienBanMoHoSo, IChiTietMoHoSo, IPaginationResponse, IResult, LoaiChiTietMoHoSo } from '@/models';
import { toSaveDate, toViewDate } from '@/utils/utils';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { TDSelect, UserSelect } from '@/app/components';
import dayjs from 'dayjs';




export const BienBanKiemPhieuDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IBienBanKiemPhieu | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IBienBanKiemPhieu>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [nhiemVuIdSelected, setNhiemVuIdSelected] = useState<string | null>(null);
  const [chiTietMoHoSos, setChiTietMoHoSos] = useState<IChiTietMoHoSo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await requestPOST<IPaginationResponse<IBienBanMoHoSo[]>>('BienBanMoHoSos/search', {
          pageNumber: 1,
          pageSize: 10,
          nhiemVuId: nhiemVuIdSelected,
        });
        const _data = res?.data?.data?.[0]?.chiTietMoHoSos ?? null;
        const hoSoHopLes = _data?.filter(x => x.phanLoai === LoaiChiTietMoHoSo.HoSoHopLe) ?? [];
        if (hoSoHopLes) {
          setChiTietMoHoSos(hoSoHopLes);
        }
      } catch (error) {
        console.error('Error searching business:', error);
      }
    }
    if (nhiemVuIdSelected) {
      fetchData();
    }
  }, [nhiemVuIdSelected, form]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IBienBanKiemPhieu>>(`BienBanKiemPhieus/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          _data.ngayKiemPhieu = toViewDate(_data.ngayKiemPhieu);
          _data.nhiemVu = _data.nhiemVuId ? { value: _data.nhiemVuId, label: _data.nhiemVuTen } : null;
          _data.hoiDongTuyenChon = _data.hoiDongTuyenChonId ? { value: _data.hoiDongTuyenChonId, label: _data.hoiDongTuyenChonTen } : null;
          _data.chuNhiem = _data.chuNhiemId ? { value: _data.chuNhiemId, label: _data.chuNhiemHoTen } : null;

          form.setFieldsValue(_data);
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
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);

      const soPhieuPhatRa = values.soPhieuPhatRa ?? 0;
      const soPhieuThuVe = values.soPhieuThuVe ?? 0;
      const soPhieuHopLe = values.soPhieuHopLe ?? 0;
      const soPhieuKhongHopLe = values.soPhieuKhongHopLe ?? 0;

      if (soPhieuThuVe > soPhieuPhatRa) {
        toast.warning('Số phiếu thu về không được lớn hơn số phiếu phát ra!');
        setButtonLoading(false);
        return;
      }

      if (soPhieuHopLe + soPhieuKhongHopLe !== soPhieuThuVe) {
        toast.warning(
          'Tổng số phiếu hợp lệ và không hợp lệ phải bằng số phiếu thu về!'
        );
        setButtonLoading(false);
        return;
      }

      if (soPhieuHopLe <= 0) {
        toast.warning('Số phiếu hợp lệ phải lớn hơn 0!');
        setButtonLoading(false);
        return;
      }

      const formData: IBienBanKiemPhieu = {
        ...values,
        ...(id && { id }),
        ngayKiemPhieu: toSaveDate(values.ngayKiemPhieu),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`BienBanKiemPhieus/${id}`, formData)
        : await requestPOST<IResult<string>>(`BienBanKiemPhieus`, formData);

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
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : (id ? 'Chỉnh sửa' : 'Tạo mới')}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IBienBanKiemPhieu>
              initialValues={{ sortOrder: totalCount + 1, isActive: true }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Nhiệm vụ" name="nhiemVu" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`nhiemvuchinhthucs/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                        });
                        return (
                          res.data?.data?.map(item => ({
                            ...item,
                            label: item?.ten,
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                      onChange={(value, current: any) => {
                        if (value) {
                          form.setFieldValue('nhiemVuId', current?.id);
                          setNhiemVuIdSelected(current?.id);
                        } else {
                          form.setFieldValue('nhiemVuId', null);
                          setNhiemVuIdSelected(null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6 mb-5">
                  <Form.Item
                    label="Hội đồng tuyển chọn"
                    name='hoiDongTuyenChon'
                    className="mb-0"
                    rules={[{ required: true, message: "Không được để trống!" }]}
                  >
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`hoiDongTuyenChons/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                        });
                        return (
                          res.data?.data?.map(item => ({
                            ...item,
                            label: item.ten,
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                      optionLabelProp="label"
                      onChange={(value, current: any) => {
                        if (value) {
                          form.setFieldValue('hoiDongTuyenChonId', current?.id);
                        } else {
                          form.setFieldValue('hoiDongTuyenChonId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6 mb-5">
                  <Form.Item
                    label="Tên cá nhân/tổ chức đăng ký"
                    name='tenCaNhanToChucDangKy'
                    className="mb-0"
                    rules={[{ required: true, message: "Không được để trống!" }]}
                  >
                    <AutoComplete
                      options={chiTietMoHoSos.map(item => ({ value: item.tenCaNhanToChucDangKy }))}
                      placeholder=""
                      allowClear
                      filterOption={(inputValue, option) =>
                        option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                      }
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ngày kiểm phiếu" name='ngayKiemPhieu' initialValue={dayjs()}>
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item
                    label="Số phiếu phát ra"
                    name="soPhieuPhatRa"
                    rules={[
                      { required: true, message: 'Không được để trống!' },
                      {
                        type: 'number',
                        min: 0,
                        message: 'Phải là số nguyên dương!',
                      },
                    ]}
                  >
                    <InputNumber<number>
                      min={0}
                      precision={0}
                      step={1}
                      placeholder=""
                      className="input-with-addon"
                      style={{ width: '100%' }}
                      addonAfter="phiếu"
                      formatter={(value) =>
                        value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d]/g, '')) : 0
                      }
                    />
                  </Form.Item>
                </div>

                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Số phiếu thu về" name="soPhieuThuVe"
                    rules={[
                      {
                        type: 'number',
                        min: 0,
                        message: 'Phải là số nguyên dương!',
                      },
                    ]}>
                    <InputNumber<number>
                      min={0}
                      precision={0}
                      step={1}
                      placeholder=""
                      className="input-with-addon"
                      style={{ width: '100%' }}
                      addonAfter="phiếu"
                      formatter={(value) =>
                        value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d]/g, '')) : 0
                      }
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Số phiếu hợp lệ" name="soPhieuHopLe"
                    rules={[
                      {
                        type: 'number',
                        min: 0,
                        message: 'Phải là số nguyên dương!',
                      },
                    ]}>
                    <InputNumber<number>
                      min={0}
                      precision={0}
                      step={1}
                      placeholder=""
                      className="input-with-addon"
                      style={{ width: '100%' }}
                      addonAfter="phiếu"
                      formatter={(value) =>
                        value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d]/g, '')) : 0
                      }
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Số phiếu không hợp lệ" name="soPhieuKhongHopLe"
                    rules={[
                      {
                        type: 'number',
                        min: 0,
                        message: 'Phải là số nguyên dương!',
                      },
                    ]}>
                    <InputNumber<number>
                      min={0}
                      precision={0}
                      step={1}
                      placeholder=""
                      className="input-with-addon"
                      style={{ width: '100%' }}
                      addonAfter="phiếu"
                      formatter={(value) =>
                        value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d]/g, '')) : 0
                      }
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Số phiếu tán thành" name="soPhieuTanThanh"
                    rules={[
                      {
                        type: 'number',
                        min: 0,
                        message: 'Phải là số nguyên dương!',
                      },
                    ]}>
                    <InputNumber<number>
                      min={0}
                      precision={0}
                      step={1}
                      placeholder=""
                      className="input-with-addon"
                      style={{ width: '100%' }}
                      addonAfter="phiếu"
                      formatter={(value) =>
                        value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d]/g, '')) : 0
                      }
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Số phiếu không tán thành" name="soPhieuKhongTanThanh"
                    rules={[
                      {
                        type: 'number',
                        min: 0,
                        message: 'Phải là số nguyên dương!',
                      },
                    ]}>
                    <InputNumber<number>
                      min={0}
                      precision={0}
                      step={1}
                      placeholder=""
                      className="input-with-addon"
                      style={{ width: '100%' }}
                      addonAfter="phiếu"
                      formatter={(value) =>
                        value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d]/g, '')) : 0
                      }
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Số phiếu trống" name="soPhieuTrong"
                    rules={[
                      {
                        type: 'number',
                        min: 0,
                        message: 'Phải là số nguyên dương!',
                      },
                    ]}>
                    <InputNumber<number>
                      min={0}
                      precision={0}
                      step={1}
                      placeholder=""
                      className="input-with-addon"
                      style={{ width: '100%' }}
                      addonAfter="phiếu"
                      formatter={(value) =>
                        value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d]/g, '')) : 0
                      }
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