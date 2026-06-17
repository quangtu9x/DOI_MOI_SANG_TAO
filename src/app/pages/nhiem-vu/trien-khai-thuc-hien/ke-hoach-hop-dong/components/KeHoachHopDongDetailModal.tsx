import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Avatar, DatePicker, Form, Input, InputNumber, Space, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IPaginationResponse, IKeHoachHopDong, IResult } from '@/models';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { TDSelect } from '@/app/components';
import { formatName, getThumbnailUrl, toSaveDate, toViewDate } from '@/utils/utils';
import { getChuyenGiaLabel } from '../../../xet-duyet-chu-nhiem/common';




interface Props {
  totalCount: number;
}

export const KeHoachHopDongDetailModal: React.FC<Props> = ({ totalCount }) => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IKeHoachHopDong | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IKeHoachHopDong>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IKeHoachHopDong>>(`KeHoachHopDongs/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          _data.ngayBatDau = toViewDate(_data.ngayBatDau);
          _data.ngayKetThuc = toViewDate(_data.ngayKetThuc);
          _data.hopDong = _data.hopDongId ? { label: _data.hopDongTen, value: _data.hopDongId } : null;
          const nguoiPhuTrachLabel = await getChuyenGiaLabel(_data.nguoiPhuTrachId);
          _data.nguoiPhuTrach = _data.nguoiPhuTrachId ? { label: nguoiPhuTrachLabel, value: _data.nguoiPhuTrachId } : null;
          _data.thoiGian = [toViewDate(_data.ngayBatDau), toViewDate(_data.ngayKetThuc)];
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
      const formData: IKeHoachHopDong = {
        ...values,
        ...(id && { id }),
        ngayBatDau: toSaveDate(values.thoiGian?.[0]),
        ngayKetThuc: toSaveDate(values.thoiGian?.[1]),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`KeHoachHopDongs/${id}`, formData)
        : await requestPOST<IResult<string>>(`KeHoachHopDongs`, formData);

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
            <Form<IKeHoachHopDong>
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
                        } else {
                          form.setFieldValue('hopDongId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    label="Nội dung"
                    name='ten'
                    rules={[{ required: true, message: "Không được để trống!" }]}
                  >
                    <Input.TextArea placeholder=' ' rows={2} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    label="Kết quả phải đạt"
                    name='ketQuaPhaiDat'
                  >
                    <Input.TextArea placeholder=' ' rows={2} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Thời gian" name="thoiGian" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <DatePicker.RangePicker
                      className="w-100"
                      format="DD/MM/YYYY"
                      placeholder={['Từ', 'đến']}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Người phụ trách" name="nguoiPhuTrach"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`chuyengias/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                        });
                        return (
                          res.data?.data?.map(item => ({
                            ...item,
                            label: (
                              <Space>
                                <Avatar
                                  size="small"
                                  src={item.dinhKem ? getThumbnailUrl(item.dinhKem) : undefined}
                                  icon={!item.dinhKem && <i className="fa-regular fa-user"></i>}
                                />
                                {formatName(item.hocHamVietTat, item.hocViVietTat, item.hoTen)}
                              </Space>
                            ),
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                      optionLabelProp="label"
                      optionRender={(option) => (
                        <Space>
                          <Avatar
                            size="small"
                            src={option.data.dinhKem ? getThumbnailUrl(option.data.dinhKem) : undefined}
                            icon={!option.data.dinhKem && <i className="fa-regular fa-user"></i>}
                          />
                          <span>{formatName(option.data.hocHamVietTat, option.data.hocViVietTat, option.data.hoTen)}</span>
                        </Space>
                      )}
                      onChange={(value, current: any) => {
                        if (value) {
                          form.setFieldValue('nguoiPhuTrachId', current?.id);
                        } else {
                          form.setFieldValue('nguoiPhuTrachId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Kinh phí dự kiến" name="kinhPhiDuKien"
                    rules={[
                      { type: 'number', min: 0, message: "Giá trị không hợp lệ!" }
                    ]}>
                    <InputNumber
                      placeholder=""
                      className='input-with-addon'
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value = '') => value.replace(/\$\s?|(,*)/g, "")}
                      style={{ width: "100%" }}
                      addonAfter="VND"
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