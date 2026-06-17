import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, InputNumber, Spin, Modal as AntModal } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IDatHangNhiemVu, IDeXuatDeTai, IPaginationResponse, IResult, TrangThaiDatHang, TrangThaiDeXuat } from '@/models';
import { handleFiles, handleImage } from '@/utils/utils';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect, UserSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';




export const DeXuatDeTaiDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IDeXuatDeTai | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IDeXuatDeTai>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [datHangNhiemVuIdSelected, setDatHangNhiemVuIdSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await requestGET<IResult<IDatHangNhiemVu>>(`dathangnhiemvus/${datHangNhiemVuIdSelected}`);
        const _data = res?.data?.data ?? null;
        if (_data) {
          form.setFieldsValue({
            datHangNhiemVu: {
              kinhPhiDuKien: _data.kinhPhiDuKien,
              thoiGianThucHien: _data.thoiGianThucHien,
            }
          });
        }
      } catch (error) {
        console.error('Error searching business:', error);
      }
    }
    if (datHangNhiemVuIdSelected) {
      fetchData();
    }
  }, [datHangNhiemVuIdSelected, form]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IDeXuatDeTai>>(`DeXuatDeTais/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDatHangNhiemVuIdSelected(_data.datHangNhiemVuId ?? null);
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          _data.nguoiDeXuat = _data.nguoiDeXuatId ? {
            value: _data.nguoiDeXuatId,
            label: _data.nguoiDeXuatHoTen,
          } : null;

          _data.datHangNhiemVu = _data.datHangNhiemVuId ? {
            value: _data.datHangNhiemVuId,
            label: _data.datHangNhiemVuTen,
          } : null;
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

  const handleConfirmAccept = () => {
    AntModal.confirm({
      title: 'Xác nhận',

      content: 'Bạn chắc chắn chấp nhận tiếp nhận đề xuất đề tài này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: onFinish,
      width: '25%',
    });
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const kinhPhiDuKien = values.kinhPhiDuKien ? Number(values.kinhPhiDuKien) : 0;
      const kinhPhiTran = values.datHangNhiemVu?.kinhPhiDuKien ? Number(values.datHangNhiemVu.kinhPhiDuKien) : 0;
      if (kinhPhiDuKien > kinhPhiTran) {
        toast.warning('Kinh phí dự kiến không được lớn hơn kinh phí trần của nhiệm vụ đặt hàng!');
        setButtonLoading(false);
        return;
      }
      const formData: IDeXuatDeTai = {
        ...values,
        ...(id && { id }),
        dinhKem: handleFiles(dinhKem).join('##'),
      };
      if (dataModal?.approveView) {
        formData.trangThai = TrangThaiDeXuat.DaTiepNhan;
      }

      const response = id
        ? await requestPUT<IResult<string>>(`DeXuatDeTais/${id}`, formData)
        : await requestPOST<IResult<string>>(`DeXuatDeTais`, formData);

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
      fullscreen={true}
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
            <Form<IDeXuatDeTai>
              initialValues={{}}
              form={form} layout="vertical" autoComplete="off"
              disabled={(dataModal?.readOnly || dataModal?.approveView) ?? false}
            >

              <HeaderTitle title={"Thông tin chung"} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tên nhiệm vụ đặt hàng" name="datHangNhiemVu" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`dathangnhiemvus/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                          trangThai: TrangThaiDatHang.DaTiepNhan,
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
                          form.setFieldValue('datHangNhiemVuId', current?.id);
                          setDatHangNhiemVuIdSelected(current?.id || null);
                        } else {
                          form.setFieldValue('datHangNhiemVuId', null);
                          setDatHangNhiemVuIdSelected(null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Kinh phí trần" name={['datHangNhiemVu', 'kinhPhiDuKien']}>
                    <InputNumber
                      disabled
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
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Thời gian dự kiến"
                    name={['datHangNhiemVu', 'thoiGianThucHien']}
                    rules={[
                      { type: 'number', min: 0, message: "Giá trị không hợp lệ!" }
                    ]}>
                    <InputNumber
                      disabled
                      placeholder=""
                      className='input-with-addon'
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value = '') => value.replace(/\$\s?|(,*)/g, "")}
                      style={{ width: "100%" }}
                      addonAfter="tháng"
                    />
                  </Form.Item>
                </div>
              </div>
              <HeaderTitle title={"Thông tin đề xuất đề tài"} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tên đề tài" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input.TextArea rows={2} placeholder=""
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tính cấp thiết" name="tinhCapThiet" >
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Mục tiêu" name="mucTieu" >
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Nội dung sơ bộ" name="noiDungSoBo" >
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Sản phẩm dự kiến" name="sanPhamDuKien" >
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>

                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Tên tổ chức/cá nhân đề xuất" name="tenToChucCaNhanDeXuat" >
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Địa chỉ liên hệ" name="diaChiLienHe" >
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Điện thoại" name="dienThoai" >
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Kinh phí dự kiến" name="kinhPhiDuKien" >
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
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Thời gian dự kiến"
                    name='thoiGianThucHien'
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
                      addonAfter="tháng"
                    />
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
        {dataModal?.approveView && (
          <div className="d-flex justify-content-center  align-items-center">
            <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={handleConfirmAccept} disabled={buttonLoading}>
              <i className="fa-regular fa-floppy-disk"></i>
              Chấp nhận
            </Button>
          </div>
        )}
        {!dataModal?.readOnly && !dataModal?.approveView && (
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