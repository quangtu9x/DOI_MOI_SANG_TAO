import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, InputNumber, Spin, Checkbox } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IBienBanMoHoSo, IChiTietMoHoSo, IDangKyChuTri, INhiemVuChinhThuc, IPaginationResponse, IResult, IUserDetails, LoaiChiTietMoHoSo } from '@/models';
import { toSaveDate, toViewDate } from '@/utils/utils';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { HeaderTitle, TDSelect, UserSelect } from '@/app/components';
import dayjs from 'dayjs';




export const BienBanMoHoSoDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IBienBanMoHoSo | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IBienBanMoHoSo>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [nhiemVuIdSelected, setNhiemVuIdSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await requestGET<IResult<INhiemVuChinhThuc>>(`nhiemvuchinhthucs/${nhiemVuIdSelected}`);
        const _data = res?.data?.data ?? null;
        if (_data) {
          var chiTietMoHoSos = _data?.dangKyChuTris?.map(item => ({
            tenCaNhanToChucDangKy: item.tenCaNhanToChucDangKy
          } as IChiTietMoHoSo)) || [];
          form.setFieldsValue({
            tinhTrangTruocKhiRaSoats: chiTietMoHoSos,
            tinhTrangSauKhiRaSoats: chiTietMoHoSos,
            hoSoHopLes: chiTietMoHoSos,
          });
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
        const response = await requestGET<IResult<IBienBanMoHoSo>>(`BienBanMoHoSos/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          _data.nhiemVu = _data.nhiemVuId ? {
            label: _data.nhiemVuTen,
            value: _data.nhiemVuId
          } : null;

          _data.ngayMoHoSo = toViewDate(_data.ngayMoHoSo);
          const chiTietMoHoSos = await Promise.all(
            (_data?.chiTietMoHoSos || []).map(async (item: IChiTietMoHoSo, index: number) => {
              let nguoiDangKyLabel: React.ReactNode = item.nguoiDangKyHoTen;

              if (item.nguoiDangKyId) {
                try {
                  const res = await requestGET<IUserDetails>(`users/${item.nguoiDangKyId}`, 'neutral');
                  const userData = res?.data;
                  if (userData) {
                    nguoiDangKyLabel = userData.fullName;
                  }
                } catch (error) {
                  console.error('Error fetching user info:', error);
                }
              }

              return {
                ...item,
                nguoiDangKy: item.nguoiDangKyId ? {
                  value: item.nguoiDangKyId,
                  label: nguoiDangKyLabel,
                } : null,
              } as IChiTietMoHoSo;
            })
          );
          _data.chiTietMoHoSos = chiTietMoHoSos;
          _data.tinhTrangTruocKhiRaSoats = chiTietMoHoSos.filter(item => item.phanLoai === LoaiChiTietMoHoSo.TruocRaSoat);
          _data.tinhTrangSauKhiRaSoats = chiTietMoHoSos.filter(item => item.phanLoai === LoaiChiTietMoHoSo.SauRaSoat);
          _data.hoSoHopLes = chiTietMoHoSos.filter(item => item.phanLoai === LoaiChiTietMoHoSo.HoSoHopLe);

          form.setFieldsValue({
            ..._data,
            thanhPhanThamGias: _data.thanhPhanThamGias || [],
            chiTietMoHoSos: _data.chiTietMoHoSos || [],
            tinhTrangTruocKhiRaSoats: _data.tinhTrangTruocKhiRaSoats || [],
            tinhTrangSauKhiRaSoats: _data.tinhTrangSauKhiRaSoats || [],
            hoSoHopLes: _data.hoSoHopLes || [],
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

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formData: IBienBanMoHoSo = {
        ...values,
        ...(id && { id }),
        ngayMoHoSo: toSaveDate(values.ngayMoHoSo),
        chiTietMoHoSos: [
          ...(values.tinhTrangTruocKhiRaSoats || []).map(item => ({
            ...item,
            phanLoai: LoaiChiTietMoHoSo.TruocRaSoat
          })),
          ...(values.tinhTrangSauKhiRaSoats || []).map(item => ({
            ...item,
            phanLoai: LoaiChiTietMoHoSo.SauRaSoat
          })),
          ...(values.hoSoHopLes || []).map(item => ({
            ...item,
            hopLeDeDuaVaoDanhGia: true,
            phanLoai: LoaiChiTietMoHoSo.HoSoHopLe,
          })),
        ]
      };

      const response = id
        ? await requestPUT<IResult<string>>(`BienBanMoHoSos/${id}`, formData)
        : await requestPOST<IResult<string>>(`BienBanMoHoSos`, formData);

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
            <Form<IBienBanMoHoSo>
              initialValues={{
                thanhPhanThamGias: [{}],
                tinhTrangTruocKhiRaSoats: [{}],
                tinhTrangSauKhiRaSoats: [{}],
                hoSoHopLes: [{}]
              }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}

            >
              <HeaderTitle title={"Thông tin chung"} />
              <div className="row">
                <div className="col-xl-8 col-lg-8">
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
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ngày mở hồ sơ" name='ngayMoHoSo' initialValue={dayjs()}>
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Địa điểm" name="diaDiem" >
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item
                    label="Tổng số hồ sơ đăng ký"
                    dependencies={['tinhTrangTruocKhiRaSoats']}
                  >
                    {({ getFieldValue }) => {
                      const list = getFieldValue('tinhTrangTruocKhiRaSoats') || [];
                      return (
                        <>
                          <InputNumber
                            value={list.length}
                            disabled
                            style={{ width: '100%' }}
                          />
                          <i className='text-muted'>Tự động lấy dữ liệu</i>
                        </>
                      );
                    }}
                  </Form.Item>

                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Số hồ sơ niêm phong kín" name="soHoSoNiemPhongKin" >
                    <InputNumber
                      placeholder=""
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value = '') => value.replace(/\$\s?|(,*)/g, "")}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>

                <div className="col-xl-4 col-lg-4">
                  <Form.Item
                    label="Số hồ sơ hợp lệ"
                    dependencies={['hoSoHopLes']}
                  >
                    {({ getFieldValue }) => {
                      const list = getFieldValue('hoSoHopLes') || [];
                      return (
                        <>
                          <InputNumber
                            value={list.length}
                            disabled
                            style={{ width: '100%' }}
                          />
                          <i className='text-muted'>Tự động lấy dữ liệu</i>
                        </>
                      );
                    }}
                  </Form.Item>
                </div>
              </div>
              <HeaderTitle title={"Thành phần tham gia mở hồ sơ"} />
              <Form.List name="thanhPhanThamGias">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th className="text-center" style={{ width: '50px' }}>TT</th>
                            <th className="text-center">Tên cơ quan, tổ chức</th>
                            <th className="text-center" style={{ width: '40%' }}>Họ và tên người tham dự</th>
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
                                  name={[name, 'tenCoQuan']}
                                  className="mb-0"
                                  rules={[{ required: true, message: 'Không được để trống!' }]}
                                >
                                  <Input placeholder="" />
                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'hoTenNguoiThamDu']}
                                  className="mb-0"
                                  rules={[{ required: true, message: 'Không được để trống!' }]}
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
                                Thêm thành phần
                              </Button>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </Form.List>
              <HeaderTitle title={"Tình trạng hồ sơ trước khi rà soát"} />
              <Form.List name="tinhTrangTruocKhiRaSoats">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th rowSpan={2} className="text-center align-middle" style={{ width: '50px' }}>TT</th>
                            <th rowSpan={2} className="text-center align-middle" >Tên cá nhân/tổ chức đăng ký tuyển chọn</th>
                            <th colSpan={3} className="text-center">Tình trạng Hồ sơ</th>
                            <th rowSpan={2} className="text-center align-middle" style={{ width: '8%' }}>Thao tác</th>
                          </tr>
                          <tr>
                            <th className="text-center align-middle" style={{ width: '16%' }}>Nộp đúng hạn</th>
                            <th className="text-center align-middle" style={{ width: '22%' }}>Tính đầy đủ của Hồ sơ đăng ký</th>
                            <th className="text-center align-middle" style={{ width: '22%' }}>Tổ chức có con dấu, tài khoản</th>

                          </tr>
                        </thead>
                        <tbody>
                          {fields.map(({ key, name, ...restField }, index) => (
                            <tr key={key}>
                              <td className="text-center align-middle">{index + 1}</td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'tenCaNhanToChucDangKy']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
                                >
                                  <Input placeholder="" />
                                </Form.Item>
                              </td>
                              <td className="text-center">
                                <Form.Item {...restField} name={[name, 'nopDungHan']} className="mb-0" valuePropName="checked">
                                  <Checkbox />
                                </Form.Item>
                              </td>
                              <td className="text-center">
                                <Form.Item {...restField} name={[name, 'dayDuTaiLieu']} className="mb-0" valuePropName="checked">
                                  <Checkbox />
                                </Form.Item>
                              </td>
                              <td className="text-center">
                                <Form.Item {...restField} name={[name, 'coConDauTaiKhoan']} className="mb-0" valuePropName="checked">
                                  <Checkbox />
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
                                Thêm hồ sơ
                              </Button>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </Form.List>
              <HeaderTitle title={"Tình trạng hồ sơ sau khi rà soát"} />
              <Form.List name="tinhTrangSauKhiRaSoats">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th rowSpan={2} className="text-center align-middle" style={{ width: '50px' }}>TT</th>
                            <th rowSpan={2} className="text-center align-middle" >Tên cá nhân/tổ chức đăng ký tuyển chọn</th>
                            <th colSpan={5} className="text-center">Tình trạng Hồ sơ</th>
                            <th rowSpan={2} className="text-center align-middle" style={{ width: '8%' }}>Thao tác</th>
                          </tr>
                          <tr>
                            <th className="text-center align-middle" style={{ width: '12%' }}>Đang chủ trì nhiệm vụ (chưa nghiệm thu)</th>
                            <th className="text-center align-middle" style={{ width: '12%' }}>Chưa thanh toán nợ phải thu hồi khi thực hiện nhiệm vụ KH&CN</th>
                            <th className="text-center align-middle" style={{ width: '12%' }}>Bị đình chỉ do sai phạm</th>
                            <th className="text-center align-middle" style={{ width: '12%' }}>Nộp hồ sơ đánh giá nghiệm thu muộn</th>
                            <th className="text-center align-middle" style={{ width: '12%' }}>Không đăng ký, nộp lưu giữ kết quả thực hiện theo quy định</th>

                          </tr>
                        </thead>
                        <tbody>
                          {fields.map(({ key, name, ...restField }, index) => (
                            <tr key={key}>
                              <td className="text-center align-middle">{index + 1}</td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'tenCaNhanToChucDangKy']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
                                >
                                  <Input placeholder="" />
                                </Form.Item>
                              </td>
                              <td className="text-center">
                                <Form.Item {...restField} name={[name, 'viPhamDangChuTri']} className="mb-0" valuePropName="checked">
                                  <Checkbox />
                                </Form.Item>
                              </td>
                              <td className="text-center">
                                <Form.Item {...restField} name={[name, 'viPhamNoDong']} className="mb-0" valuePropName="checked">
                                  <Checkbox />
                                </Form.Item>
                              </td>
                              <td className="text-center">
                                <Form.Item {...restField} name={[name, 'viPhamBiDinhChi']} className="mb-0" valuePropName="checked">
                                  <Checkbox />
                                </Form.Item>
                              </td>
                              <td className="text-center">
                                <Form.Item {...restField} name={[name, 'viPhamNopMuon']} className="mb-0" valuePropName="checked">
                                  <Checkbox />
                                </Form.Item>
                              </td>
                              <td className="text-center">
                                <Form.Item {...restField} name={[name, 'viPhamLuuGiuKetQua']} className="mb-0" valuePropName="checked">
                                  <Checkbox />
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
                                Thêm hồ sơ
                              </Button>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </Form.List>
              <HeaderTitle title={"Hồ sơ hợp lệ"} />
              <Form.List name="hoSoHopLes">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th className="text-center align-middle" style={{ width: '50px' }}>TT</th>
                            <th className="text-center align-middle" >Tên cá nhân/tổ chức đăng ký tuyển chọn</th>
                            <th className="text-center" style={{ width: '60%' }}>Ghi chú</th>
                            <th className="text-center align-middle" style={{ width: '8%' }}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map(({ key, name, ...restField }, index) => (
                            <tr key={key}>
                              <td className="text-center align-middle">{index + 1}</td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'tenCaNhanToChucDangKy']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
                                >
                                  <Input placeholder="" />
                                </Form.Item>
                              </td>
                              <td className="text-center">
                                <Form.Item {...restField} name={[name, 'ghiChu']} className="mb-0">
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
                                Thêm hồ sơ
                              </Button>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </Form.List>
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