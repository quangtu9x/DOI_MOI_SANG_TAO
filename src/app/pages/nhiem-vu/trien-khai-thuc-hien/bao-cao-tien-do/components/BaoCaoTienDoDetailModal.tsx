import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Avatar, Checkbox, DatePicker, Form, Input, InputNumber, Select, Space, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IPaginationResponse, IBaoCaoTienDo, IResult } from '@/models';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, TDSelect } from '@/app/components';
import { formatName, getThumbnailUrl, handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';
import { LOAI_NHIEM_VU, TU_DANH_GIA } from '@/data';




export const BaoCaoTienDoDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IBaoCaoTienDo | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IBaoCaoTienDo>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [quyetDinhTrienKhaiId, setQuyetDinhTrienKhaiId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IBaoCaoTienDo>>(`BaoCaoTienDos/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));
          _data.ngayBaoCao = toViewDate(_data.ngayBaoCao);
          _data.hopDong = _data.hopDongId ? { label: _data.hopDongTen, value: _data.hopDongId } : null;
          _data.keHoachThucHien = _data.keHoachThucHienId ? { label: _data.keHoachThucHienTen, value: _data.keHoachThucHienId } : null;
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
      const formData: IBaoCaoTienDo = {
        ...values,
        ...(id && { id }),
        ngayBaoCao: toSaveDate(values.ngayBaoCao),
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`BaoCaoTienDos/${id}`, formData)
        : await requestPOST<IResult<string>>(`BaoCaoTienDos`, formData);

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
            <Form<IBaoCaoTienDo>
              initialValues={{ sortOrder: totalCount + 1, isActive: true }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-12 col-lg-12">
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
                          setQuyetDinhTrienKhaiId(current?.quyetDinhTrienKhaiId);
                        } else {
                          form.setFieldValue('hopDongId', null);
                          setQuyetDinhTrienKhaiId(null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-8 col-lg-8">
                  <Form.Item
                    label="Kế hoạch thực hiện"
                    name='keHoachThucHien'
                    className="mb-0"
                    rules={[{ required: true, message: "Không được để trống!" }]}
                  >
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        if (!quyetDinhTrienKhaiId) {
                          return [];
                        }
                        const res = await requestPOST<IPaginationResponse<any[]>>(`BienBanThamDinhs/search/noi-dung`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                          quyetDinhTrienKhaiId: quyetDinhTrienKhaiId,
                        });
                        return (
                          res.data?.data?.map(item => ({
                            ...item,
                            label: item?.keHoachThucHienTen,
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                      optionLabelProp="label"
                      onChange={(value, current: any) => {
                        if (value) {
                          form.setFieldValue('keHoachThucHienId', current?.id);
                        } else {
                          form.setFieldValue('keHoachThucHienId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item
                    label="Ngày báo cáo"
                    name="ngayBaoCao"
                    rules={[
                      { required: true, message: 'Không được để trống!' },
                    ]}
                    initialValue={dayjs()}
                  >
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className='col-xl-4 col-lg-4'>
                  <Form.Item
                    label="Tỉ lệ hoàn thành"
                    name="phanTramHoanThanh"
                    rules={[
                      { required: true, message: 'Không được để trống!' },
                    ]}
                  >
                    <InputNumber<number>
                      min={0}
                      max={100}
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
                      addonAfter="%"
                    />
                  </Form.Item>

                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Kết quả đạt được" name="ketQuaDatDuoc">
                    <Input placeholder=' ' />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Sản phẩm cụ thể" name="sanPhamCuThe">
                    <Input placeholder=' ' />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Tự đánh giá tiến độ"
                    name='tuDanhGia'>
                    <Select placeholder="Chọn" allowClear>
                      {TU_DANH_GIA?.map((item, key) => (
                        <Select.Option key={key} value={item.id}>{item.name}</Select.Option>
                      ))}
                    </Select>
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