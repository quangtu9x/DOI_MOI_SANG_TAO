import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AutoComplete, Avatar, Checkbox, DatePicker, Form, InputNumber, Space, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IBienBanKiemPhieu, IBienBanMoHoSo, IChiTietMoHoSo, IPaginationResponse, IResult, LoaiChiTietMoHoSo, LoaiNhiemVu } from '@/models';
import { formatName, getThumbnailUrl, handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, TDSelect, UserSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { getChuyenGiaLabel } from '../../common';
import dayjs from 'dayjs';




export const KetQuaXetChonDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IBienBanKiemPhieu | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IBienBanKiemPhieu>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
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
          _data.nhiemVu = _data.nhiemVuId ? { value: _data.nhiemVuId, label: _data.nhiemVuTen } : null;
          _data.hoiDongTuyenChon = _data.hoiDongTuyenChonId ? { value: _data.hoiDongTuyenChonId, label: _data.hoiDongTuyenChonTen } : null;
          _data.chuNhiem = _data.chuNhiemId ? { value: _data.chuNhiemId, label: _data.chuNhiemHoTen } : null;
          setDinhKem(handleImage(_data?.dinhKem ?? ''));
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

      const tongDiem = values.tongDiemTrungBinh ?? 0;
      const ketLuanTrungTuyen = values.ketLuanTrungTuyen ?? false;
      if (tongDiem < 70 && ketLuanTrungTuyen) {
        toast.warning('Điểm trung bình phải từ 70 trở lên để kết luận trúng tuyển!');
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
                <div className="col-xl-6 col-lg-6">
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
                <div className="col-xl-4 col-lg-4">
                  <Form.Item
                    label="Điểm trung bình"
                    name="tongDiemTrungBinh"
                    rules={[
                      { required: true, message: 'Không được để trống!' },
                      {
                        type: 'number',
                        min: 0,
                        max: 100,
                        message: 'Điểm phải nằm trong khoảng 0 – 100'
                      }
                    ]}
                  >
                    <InputNumber<number>
                      min={0}
                      max={100}
                      step={0.1}
                      precision={1}
                      placeholder="0 – 100"
                      style={{ width: '100%' }}
                      formatter={(value) => {
                        if (value === undefined || value === null) return '';
                        const num = Number(value);
                        return Number.isInteger(num) ? `${num}` : `${num}`;
                      }}
                      parser={(value) => {
                        if (!value) return 0;
                        return Number(value.replace(',', '.'));
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label=' ' name="ketLuanTrungTuyen" valuePropName="checked">
                    <Checkbox>Kết luận trúng tuyển</Checkbox>
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