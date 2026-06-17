import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, DatePicker, Form, Input, InputNumber, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IPaginationResponse, IBienBanNghiemThu, IResult } from '@/models';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, TDSelect } from '@/app/components';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { TDUploadFile } from '@/models/TDUploadFile';
import { CATEGORY_GROUP_CODE, XEP_LOAI_NGHIEM_THU } from '@/data';
import dayjs from 'dayjs';

interface Props {
  totalCount: number;
}

export const BienBanNghiemThuDetailModal: React.FC<Props> = ({ totalCount }) => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IBienBanNghiemThu | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IBienBanNghiemThu>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IBienBanNghiemThu>>(`BienBanNghiemThus/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));
          _data.hopDong = _data.hopDongId ? { label: _data.hopDongTen, value: _data.hopDongId } : null;
          _data.hopDongNghiemThu = _data.hopDongNghiemThuId ? { label: _data.hopDongNghiemThuTen, value: _data.hopDongNghiemThuId } : null;
          _data.ngayNghiemThu = toViewDate(_data.ngayNghiemThu);
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

      if (soPhieuThuVe > soPhieuPhatRa) {
        toast.warning('Số phiếu thu về không được lớn hơn số phiếu phát ra!');
        setButtonLoading(false);
        return;
      }

      if (soPhieuHopLe <= 0) {
        toast.warning('Số phiếu hợp lệ phải lớn hơn 0!');
        setButtonLoading(false);
        return;
      }

      const formData: IBienBanNghiemThu = {
        ...values,
        ...(id && { id }),
        dinhKem: handleFiles(dinhKem).join('##'),
        ngayNghiemThu: toSaveDate(values.ngayNghiemThu),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`BienBanNghiemThus/${id}`, formData)
        : await requestPOST<IResult<string>>(`BienBanNghiemThus`, formData);

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
            <Form<IBienBanNghiemThu>
              initialValues={{ isActive: true }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Hợp đồng" name="hopDong" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`hopDongTrienKhais/search`, {
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
                          form.setFieldValue('hopDongId', current?.id);
                        } else {
                          form.setFieldValue('hopDongId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Hội đồng nghiệm thu" name="hopDongNghiemThu"
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`hoidongnghiemthus/search`, {
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
                          form.setFieldValue('hopDongNghiemThuId', current?.id);
                        } else {
                          form.setFieldValue('hopDongNghiemThuId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-8 col-lg-8">
                  <Form.Item label="Tên" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder=' ' />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ngày kiểm phiếu" name='ngayNghiemThu'
                    initialValue={dayjs()}
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                  <Form.Item label="Điểm trung bình" name="tongDiemTrungBinh"
                    rules={[
                      { required: true, message: 'Không được để trống!' },
                      {
                        type: 'number',
                        min: 0,
                        message: 'Phải là số nguyên dương!',
                      },
                    ]}>
                    <InputNumber<number>
                      min={0}
                      precision={1}
                      step={0.1}
                      placeholder=""
                      className="input-with-addon"
                      style={{ width: '100%' }}
                      formatter={(value) =>
                        value !== undefined && value !== null
                          ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          : ''
                      }
                      parser={(value) =>
                        value
                          ? Number(value.replace(/,/g, ''))
                          : 0
                      }
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Xếp loại" name="xepLoai"
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select placeholder="Chọn" allowClear>
                      {XEP_LOAI_NGHIEM_THU?.map((item, key) => (
                        <Select.Option key={key} value={item.id}>{item.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Kết luận của hội đồng" name="ketLuanCuaHoiDong">
                    <Input placeholder=' ' />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item
                    label="Đính kèm"
                    name='dinhKem'
                  >
                    <FileUpload
                      accept={['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc']}
                      multiple={false}
                      URL={`${API_URL}/api/v1/attachments/public`}
                      maxCount={2}
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
