import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, InputNumber, Spin, Modal as AntModal } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IDatHangNhiemVu, IDotDangKy, IPaginationResponse, IResult, TrangThaiDatHang } from '@/models';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';
import { TDUploadFile } from '@/models/TDUploadFile';
import { data } from 'jquery';




export const DatHangNhiemVuDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IDatHangNhiemVu | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IDatHangNhiemVu>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [dotDangKyIdSelected, setDotDangKyIdSelected] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await requestGET<IResult<IDotDangKy>>(`dotdangkys/${dotDangKyIdSelected}`);
        const _data = res?.data?.data ?? null;
        if (_data) {
          form.setFieldsValue({
            dotDangKy: {
              ma: _data.ma,
              linhVuc: _data.linhVucId ? {
                value: _data.linhVucId,
                label: _data.linhVucTen,
              } : null,
              thoiGian: [toViewDate(_data.ngayBatDau), toViewDate(_data.ngayKetThuc)],
              namTaiChinh: toViewDate(_data.namTaiChinh, 'YYYY'),
            }
          });
        }
      } catch (error) {
        console.error('Error searching business:', error);
      }
    }
    if (dotDangKyIdSelected) {
      fetchData();
    }
  }, [dotDangKyIdSelected, form]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IDatHangNhiemVu>>(`DatHangNhiemVus/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDotDangKyIdSelected(_data.dotDangKyId ?? null);
          setDinhKem(handleImage(_data?.dinhKem ?? ''));
          _data.dotDangKy = _data.dotDangKyId ? {
            value: _data.dotDangKyId,
            label: _data.dotDangKyTen,
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

      content: 'Bạn chắc chắn chấp nhận tiếp nhận đề xuất đặt hàng này?',
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
      const formData: IDatHangNhiemVu = {
        ...values,
        ...(id && { id }),
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      if (dataModal?.approveView) {
        formData.trangThai = TrangThaiDatHang.DaTiepNhan;
      }

      const response = id
        ? await requestPUT<IResult<string>>(`DatHangNhiemVus/${id}`, formData)
        : await requestPOST<IResult<string>>(`DatHangNhiemVus`, formData);

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
            <Form<IDatHangNhiemVu>
              initialValues={{ sortOrder: totalCount + 1, isActive: true }}
              form={form} layout="vertical" autoComplete="off"
              disabled={(dataModal?.readOnly || dataModal?.approveView) ?? false}>
              <HeaderTitle title={"Thông tin đợt đăng ký"} />
              <div className="row">
                <div className="col-xl-8 col-lg-8">
                  <Form.Item label="Đợt đăng ký" name="dotDangKy" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`dotdangkys/search`, {
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
                          form.setFieldValue('dotDangKyId', current?.id);
                          setDotDangKyIdSelected(current?.id || null);
                        } else {
                          form.setFieldValue('dotDangKyId', null);
                          setDotDangKyIdSelected(null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>

                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Lĩnh vực" name={['dotDangKy', 'linhVuc']}>
                    <TDSelect
                      disabled
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                          categoryGroupCode: CATEGORY_GROUP_CODE.LINH_VUC,
                        });
                        return (
                          res.data?.data?.map(item => ({
                            ...item,
                            label: item?.name,
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                    />
                  </Form.Item>
                </div>
                {/* <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Thời gian" name={['dotDangKy', 'thoiGian']}>
                    <DatePicker.RangePicker
                      disabled
                      className="w-100"
                      format="DD/MM/YYYY"
                      placeholder={['Từ', 'đến']}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-2 col-lg-2">
                  <Form.Item
                    label="Năm tài chính"
                    name={['dotDangKy', 'namTaiChinh']}
                    className="mb-0"

                  >
                    <DatePicker disabled picker="year" placeholder='' className="w-100" />
                  </Form.Item>
                </div> */}
              </div>
              <HeaderTitle title={"Thông tin đặt hàng nhiệm vụ"} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tên nhiệm vụ" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                {/* <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Đơn vị đặt hàng" name="donViId" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <OrganizationUnitTreeSelect />
                  </Form.Item>
                </div> */}
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Tính cấp thiết" name="tinhCapThiet" >
                    <Input.TextArea rows={3} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Mục tiêu" name="mucTieu" >
                    <Input.TextArea rows={3} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Khả năng duy trì" name="khaNangDuyTri" >
                    <Input.TextArea rows={3} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Nội dung chính" name="noiDungChinh" >
                    <Input.TextArea rows={3} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Sản phẩm dự kiến" name="sanPhamDuKien" >
                    <Input.TextArea rows={3} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ghi chú" name="ghiChuXuLy" >
                    <Input.TextArea rows={3} placeholder="" />
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