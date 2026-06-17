import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IHoSoSangKien, IPaginationResponse, IResult, TrangThaiHoSoSangKien } from '@/models';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { API_URL, requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { FileUpload, OrganizationUnitTreeSelect, SubTitle, TDSelect, UserSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';
import { YKienFormList } from '@/app/pages/sang-kien/components/YKienFormList';

export const HoSoSangKienDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IHoSoSangKien | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IHoSoSangKien>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IHoSoSangKien>>(`HoSoSangKiens/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          _data.dotXetSangKien = _data.dotXetSangKienId ? {
            value: _data.dotXetSangKienId,
            label: _data.dotXetSangKienTen,
          } : null;

          _data.linhVuc = _data.linhVucId ? {
            value: _data.linhVucId,
            label: _data.linhVucTen,
          } : null;

          _data.ngayDuocApDungLanDau = toViewDate(_data.ngayDuocApDungLanDau);
          _data.ngayNopHoSo = toViewDate(_data.ngayNopHoSo);


          _data.thanhViens = _data.thanhViens?.map(item => ({
            ...item,
            ngaySinh: toViewDate(item.ngaySinh),
            trinhDoChuyenMon: item.trinhDoChuyenMonId ? {
              value: item.trinhDoChuyenMonId,
              label: item.trinhDoChuyenMonTen,
            } : null,
            chucDanh: item.chucDanhId ? {
              value: item.chucDanhId,
              label: item.chucDanhTen,
            } : null
          })) ?? [];
          _data.tacGias = _data.thanhViens.filter(item => item.thamGiaApDungThu !== true);
          _data.thanhVienThamGiaApDungThus = _data.thanhViens.filter(item => item.thamGiaApDungThu === true);

          form.setFieldsValue({
            ..._data,
            thanhViens: _data.thanhViens ?? [],
            tacGias: _data.tacGias ?? [],
            thanhVienThamGiaApDungThus: _data.thanhVienThamGiaApDungThus ?? [],
            phieuDanhGiaSangKiens: _data.phieuDanhGiaSangKiens?.map(item => ({
              ...item,
              ngayLapPhieu: toViewDate(item.ngayLapPhieu),
              chiTietDanhGiaSangKiens: item.chiTietDanhGiaSangKiens ?? []
            })) ?? [],
            yKienCapCoSo: _data.yKienCapCoSo ?? [],
            yKienCapThanhPho: _data.yKienCapThanhPho ?? [],
          });
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

  const onFinish = async (trangThaiHoSoSangKien: TrangThaiHoSoSangKien = TrangThaiHoSoSangKien.ChoTiepNhan) => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formData: IHoSoSangKien = {
        ...values,
        ...(id && { id }),
        ngayDuocApDungLanDau: toSaveDate(values.ngayDuocApDungLanDau),
        ngayNopHoSo: toSaveDate(values.ngayNopHoSo),
        dinhKem: handleFiles(dinhKem).join('##'),
        trangThai: trangThaiHoSoSangKien,
        thanhViens: [
          ...(values.tacGias || []).map(item => ({
            ...item,
            ngaySinh: toSaveDate(item.ngaySinh),
            thamGiaApDungThu: false
          })),
          ...(values.thanhVienThamGiaApDungThus || []).map(item => ({
            ...item,
            ngaySinh: toSaveDate(item.ngaySinh),
            thamGiaApDungThu: true
          }))
        ]
      };

      const response = id
        ? await requestPUT<IResult<string>>(`HoSoSangKiens/${id}`, formData)
        : await requestPOST<IResult<string>>(`HoSoSangKiens`, formData);

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
            <Form<IHoSoSangKien>
              initialValues={{
                tacGias: [{}],
                trangThai: TrangThaiHoSoSangKien.ChoTiepNhan
              }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Đơn vị được yêu cầu công nhận" name="donViDuocYeuCauId" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <OrganizationUnitTreeSelect useCurrentUserDefault={false} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Đợt xét sáng kiến" name="dotXetSangKien" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`dotxetsangkiens/search`, {
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
                          form.setFieldValue('dotXetSangKienId', current?.id);
                        } else {
                          form.setFieldValue('dotXetSangKienId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tên sáng kiến" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Chủ đầu tư" name="chuDauTu" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Lĩnh vực" name="linhVuc" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                          categoryGroupCode: CATEGORY_GROUP_CODE.LINH_VUC_SANG_KIEN,
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
                          form.setFieldValue('linhVucId', current?.id);
                        } else {
                          form.setFieldValue('linhVucId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ngày áp dụng thử" name='ngayDuocApDungLanDau' initialValue={dayjs()}>
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Mô tả" name="moTa">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Thông tin cần bảo mật" name="thongTinCanBaoMat">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Điều kiện cần thiết" name="dieuKienCanThiet">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Đánh giá lợi ích" name="danhGiaLoiIch">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ngày nộp hồ sơ" name='ngayNopHoSo' initialValue={dayjs()}
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Người nộp hồ sơ" name='nguoiNopHoSo'
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <UserSelect
                      useCurrentUserDefault={!id}
                      initialUserId={id ? dataModal?.nguoiNopHoSoId : undefined}
                      onDefaultValueSet={(value, userId) => {
                        form.setFieldsValue({
                          nguoiNopHoSo: value,
                          nguoiNopHoSoId: userId,
                        });
                      }}
                      onUserIdChange={(userId) => form.setFieldValue('nguoiNopHoSoId', userId)} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Đính kèm" name='dinhKem'>
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
                <SubTitle title={"Thông tin tác giả (nhóm tác giả)"} />
                <Form.List name="tacGias">
                  {(fields, { add, remove }) => (
                    <>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th className="text-center" style={{ width: '50px' }}>TT</th>
                              <th className="text-center" style={{ width: '20%' }} >Họ tên</th>
                              <th className="text-center" style={{ width: '10%' }} >Ngày sinh</th>
                              <th className="text-center">Đơn vị công tác</th>
                              <th className="text-center" style={{ width: '15%' }}>Chức danh</th>
                              <th className="text-center" style={{ width: '15%' }}>Trình độ chuyên môn</th>
                              <th className="text-center" style={{ width: '10%' }}>Tỷ lệ đóng góp</th>
                              <th className="text-center" style={{ width: '8%' }}>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <tr key={key}>
                                <td className="text-center">{index + 1}</td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'hoTen']}
                                    className="mb-0"
                                    rules={[{ required: true, message: "Không được để trống!" }]}
                                  >
                                    <Input placeholder=' ' />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'ngaySinh']}
                                    className="mb-0"
                                  >
                                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'donViCongTac']}
                                    className="mb-0"
                                  >
                                    <Input placeholder="" />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'chucDanh']}
                                    className="mb-0"
                                  >
                                    <TDSelect
                                      notFoundContent="Không tìm thấy dữ liệu"
                                      reload
                                      showSearch
                                      placeholder="Chọn"
                                      fetchOptions={async keyword => {
                                        const res = await requestPOST<IPaginationResponse<any[]>>(`positions/search`, {
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
                                          form.setFieldValue(['tacGias', name, 'chucDanhId'], current?.id);
                                        } else {
                                          form.setFieldValue(['tacGias', name, 'chucDanhId'], null);
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'trinhDoChuyenMon']}
                                    className="mb-0"
                                  >
                                    <TDSelect
                                      notFoundContent="Không tìm thấy dữ liệu"
                                      reload
                                      showSearch
                                      placeholder="Chọn"
                                      fetchOptions={async keyword => {
                                        const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                                          pageNumber: 1,
                                          pageSize: 1000,
                                          keyword: keyword,
                                          categoryGroupCode: CATEGORY_GROUP_CODE.TRINH_DO_CHUYEN_MON,
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
                                          form.setFieldValue(['tacGias', name, 'trinhDoChuyenMonId'], current?.id);
                                        } else {
                                          form.setFieldValue(['tacGias', name, 'trinhDoChuyenMonId'], null);
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'tyLeDongGop']}
                                    className="mb-0"
                                    rules={[{ required: true, message: "Không được để trống!" }]}
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
                                </td>
                                {/* Thao tác */}
                                <td className='text-center align-middle'>
                                  <Button
                                    type="button"
                                    className="btn btn-sm btn-light-danger d-inline-flex align-items-center justify-content-center"
                                    onClick={() => {
                                      remove(name);
                                    }}
                                    disabled={fields.length === 1 || (dataModal?.readOnly ?? false)}

                                  >
                                    <i className="fa-regular fa-trash"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-secondary">
                            <tr>
                              <td colSpan={16} className="text-left py-3">
                                <Button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={() => add()}
                                  disabled={dataModal?.readOnly ?? false}
                                >
                                  <i className="fa-regular fa-plus me-2"></i>
                                  Thêm thành viên
                                </Button>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </>
                  )}
                </Form.List>
                <SubTitle title={"Thông tin người đã tham gia áp dụng thử"} />
                <Form.List name="thanhVienThamGiaApDungThus">
                  {(fields, { add, remove }) => (
                    <>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th className="text-center" style={{ width: '50px' }}>TT</th>
                              <th className="text-center" style={{ width: '20%' }} >Họ tên</th>
                              <th className="text-center" style={{ width: '10%' }} >Ngày sinh</th>
                              <th className="text-center">Đơn vị công tác</th>
                              <th className="text-center" style={{ width: '15%' }}>Chức danh</th>
                              <th className="text-center" style={{ width: '10%' }}>Trình độ chuyên môn</th>
                              <th className="text-center" style={{ width: '15%' }}>Nội dung công việc</th>
                              <th className="text-center" style={{ width: '8%' }}>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <tr key={key}>
                                <td className="text-center">{index + 1}</td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'hoTen']}
                                    className="mb-0"
                                    rules={[{ required: true, message: "Không được để trống!" }]}
                                  >
                                    <Input placeholder=' ' />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'ngaySinh']}
                                    className="mb-0"
                                  >
                                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'donViCongTac']}
                                    className="mb-0"
                                  >
                                    <Input placeholder="" />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'chucDanh']}
                                    className="mb-0"
                                  >
                                    <TDSelect
                                      notFoundContent="Không tìm thấy dữ liệu"
                                      reload
                                      showSearch
                                      placeholder="Chọn"
                                      fetchOptions={async keyword => {
                                        const res = await requestPOST<IPaginationResponse<any[]>>(`positions/search`, {
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
                                          form.setFieldValue(['thanhVienThamGiaApDungThus', name, 'chucDanhId'], current?.id);
                                        } else {
                                          form.setFieldValue(['thanhVienThamGiaApDungThus', name, 'chucDanhId'], null);
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'trinhDoChuyenMon']}
                                    className="mb-0"
                                  >
                                    <TDSelect
                                      notFoundContent="Không tìm thấy dữ liệu"
                                      reload
                                      showSearch
                                      placeholder="Chọn"
                                      fetchOptions={async keyword => {
                                        const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                                          pageNumber: 1,
                                          pageSize: 1000,
                                          keyword: keyword,
                                          categoryGroupCode: CATEGORY_GROUP_CODE.TRINH_DO_CHUYEN_MON,
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
                                          form.setFieldValue(['thanhVienThamGiaApDungThus', name, 'trinhDoChuyenMonId'], current?.id);
                                        } else {
                                          form.setFieldValue(['thanhVienThamGiaApDungThus', name, 'trinhDoChuyenMonId'], null);
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'noiDungCongViec']}
                                    className="mb-0"
                                    rules={[{ required: true, message: "Không được để trống!" }]}
                                  >
                                    <Input placeholder="" />
                                  </Form.Item>
                                </td>
                                {/* Thao tác */}
                                <td className='text-center align-middle'>
                                  <Button
                                    type="button"
                                    className="btn btn-sm btn-light-danger d-inline-flex align-items-center justify-content-center"
                                    onClick={() => {
                                      remove(name);
                                    }}
                                    disabled={fields.length === 1 || (dataModal?.readOnly ?? false)}

                                  >
                                    <i className="fa-regular fa-trash"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-secondary">
                            <tr>
                              <td colSpan={16} className="text-left py-3">
                                <Button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={() => add()}
                                  disabled={dataModal?.readOnly ?? false}
                                >
                                  <i className="fa-regular fa-plus me-2"></i>
                                  Thêm thành viên
                                </Button>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </>
                  )}
                </Form.List>
                <YKienFormList form={form} name="yKienCapCoSo" title="Ý kiến cấp cơ sở" disabled={dataModal?.readOnly ?? false} />
                <YKienFormList form={form} name="yKienCapThanhPho" title="Ý kiến cấp Thành phố" disabled={dataModal?.readOnly ?? false} />
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!dataModal?.readOnly && (
          <>
            <div className="d-flex justify-content-center  align-items-center">
              <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={() => onFinish((dataModal as any)?.preserveTrangThaiOnSave ? (dataModal?.trangThai ?? TrangThaiHoSoSangKien.ChoTiepNhan) : TrangThaiHoSoSangKien.ChoTiepNhan)} disabled={buttonLoading}>
                <i className="fa-regular fa-floppy-disk"></i>
                {id ? 'Lưu' : 'Tạo mới'}
              </Button>
            </div>
            {
              (!id || dataModal?.trangThai == null || dataModal?.trangThai === TrangThaiHoSoSangKien.DangSoanThao || dataModal?.trangThai === TrangThaiHoSoSangKien.YeuCauBoSung) &&
              <div className="d-flex justify-content-center  align-items-center">
                <Button className="btn-sm btn-success rounded-1 p-2  ms-2" onClick={() => onFinish(dataModal?.trangThai ?? TrangThaiHoSoSangKien.DangSoanThao)} disabled={buttonLoading}>
                  <i className="fa-regular fa-floppy-disk"></i>
                  {'Lưu nháp'}
                </Button>
              </div>
            }

          </>
        )}
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal >
  );
};
