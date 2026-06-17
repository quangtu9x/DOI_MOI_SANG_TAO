import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, InputNumber, Radio, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IThuyetMinhSXTN, IPaginationResponse, IResult, PhuongThucKhoan, LoaiNhiemVu, IUserDetails } from '@/models';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { HeaderTitle, TDSelect, UserSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { CATEGORY_GROUP_CODE, EASE_IN, EASE_OUT, PHUONG_THUC_KHOAN } from '@/data';
import { AnimatePresence, motion } from 'framer-motion';




export const ThuyetMinhSXTNDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IThuyetMinhSXTN | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IThuyetMinhSXTN>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [phuongThucKhoanSelected, setPhuongThucKhoanSelected] = useState<PhuongThucKhoan | null>(null);
  const [thanhVienIdSelected, setThanhVienIdSelected] = useState<{ [key: number]: string | null }>({});

  useEffect(() => {
    const fetchThanhVienInfo = async () => {
      const entries = Object.entries(thanhVienIdSelected);
      for (const [rowIndex, thanhVienId] of entries) {
        if (thanhVienId) {
          try {
            const res = await requestGET<IUserDetails>(`users/${thanhVienId}`, 'neutral');
            const _data = res?.data ?? null;
            if (_data) {
              form.setFieldValue(['thanhViens', Number(rowIndex), 'donViCongTac'], _data.organizationUnitName || '');
            }
          } catch (error) {
            console.error('Error fetching thanh vien info:', error);
          }
        }
      }
    };

    const hasSelection = Object.values(thanhVienIdSelected).some(id => id);
    if (hasSelection) {
      fetchThanhVienInfo();
    }
  }, [thanhVienIdSelected, form]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IThuyetMinhSXTN>>(`ThuyetMinhSXTNs/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));
          const thanhViensWithInfo = await Promise.all(
            (_data?.thanhViens || []).map(async (item: any, index: number) => {
              let thanhVienLabel: string = item.thanhVienHoTen;
              let donViCongTac = '';

              if (item.thanhVienId) {
                try {
                  const res = await requestGET<IUserDetails>(`users/${item.thanhVienId}`, 'neutral');
                  const userData = res?.data;
                  if (userData) {
                    thanhVienLabel = userData.fullName || item.thanhVienHoTen;
                    donViCongTac = userData.organizationUnitName || '';
                  }
                } catch (error) {
                  console.error('Error fetching user info:', error);
                }
              }

              setThanhVienIdSelected(prev => ({
                ...prev,
                [index]: item.thanhVienId
              }));

              return {
                ...item,
                donViCongTac,
                thanhVien: item.thanhVienId ? {
                  value: item.thanhVienId,
                  label: thanhVienLabel,
                } : null,
                chucVu: item.chucVuId ? {
                  value: item.chucVuId,
                  label: item.chucVuTen,
                } : null,
              };
            })
          );
          _data.nhiemVu = _data.nhiemVuId ? {
            value: _data.nhiemVuId,
            label: _data.nhiemVuTen,
          } : null;
          _data.capQuanLy = _data.capQuanLyId ? {
            value: _data.capQuanLyId,
            label: _data.capQuanLyTen,
          } : null;

          _data.thoiGian = [toViewDate(_data.ngayBatDau), toViewDate(_data.ngayKetThuc)];

          form.setFieldsValue({
            ..._data,
            thanhViens: thanhViensWithInfo,
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

      const formData: IThuyetMinhSXTN = {
        ...values,
        ...(id && { id }),
        dinhKem: handleFiles(dinhKem).join('##'),
        ngayBatDau: toSaveDate(values.thoiGian[0]),
        ngayKetThuc: toSaveDate(values.thoiGian[1]),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`ThuyetMinhSXTNs/${id}`, formData)
        : await requestPOST<IResult<string>>(`ThuyetMinhSXTNs`, formData);

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
            <Form<IThuyetMinhSXTN>
              initialValues={{
                phuongThucKhoan: PhuongThucKhoan.KhoanToanPhan
              }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <HeaderTitle title={"Thông tin chung"} />
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
                          loaiNhiemVu: LoaiNhiemVu.DuAnThuNghiem,
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
                        } else {
                          form.setFieldValue('nhiemVuId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Cấp quản lý" name="capQuanLy" rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                          categoryGroupCode: CATEGORY_GROUP_CODE.CAP_QUAN_LY,
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
                          form.setFieldValue('capQuanLyId', current?.id);
                        } else {
                          form.setFieldValue('capQuanLyId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-8 col-lg-8">
                  <Form.Item label="Thời gian" name="thoiGian" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <DatePicker.RangePicker
                      className="w-100"
                      format="DD/MM/YYYY"
                      placeholder={['Từ', 'đến']}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Tổng kinh phí" name="tongKinhPhi"
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
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Từ ngân sách nhà nước" name="kinhPhiTuNguonNhaNuoc"
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
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Từ nguồn ngoài nhà nước" name="kinhPhiNgoaiNhaNuoc"
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
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Phương án tài chính" name="phuongAnTaiChinh">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Khả năng thu hồi vốn" name="khaNangThuHoiVon">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item
                    name="phuongThucKhoan"
                    label="Đề nghị phương thức khoán chi"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <Radio.Group
                      onChange={(e) => setPhuongThucKhoanSelected(e.target.value)}
                      value={phuongThucKhoanSelected}
                    >
                      {PHUONG_THUC_KHOAN?.map((item, key) => (
                        <Radio
                          style={{ marginRight: "24px" }}
                          key={key}
                          value={item.id}
                        >
                          <span className='user-select-none'>{item.name}</span>
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>

                </div>
                <AnimatePresence initial={false} mode="wait">
                  {phuongThucKhoanSelected === PhuongThucKhoan.KhoanTungPhan && (
                    <>
                      <motion.div
                        key={PhuongThucKhoan.KhoanTungPhan}
                        initial={{ opacity: 0, x: -40 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { type: "tween", duration: 0.28, ease: EASE_IN }
                        }}
                        exit={{
                          opacity: 0,
                          x: -40,
                          transition: { type: "tween", duration: 0.35, ease: EASE_OUT }
                        }}
                        style={{ overflow: "hidden", willChange: "transform, opacity" }}
                        className="col-xl-4 col-lg-4"
                      >
                        <Form.Item label="Kinh phí khoán" name="kinhPhiKhoan"
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
                      </motion.div>
                      <motion.div
                        key={PhuongThucKhoan.KhoanTungPhan}
                        initial={{ opacity: 0, x: -40 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { type: "tween", duration: 0.28, ease: EASE_IN }
                        }}
                        exit={{
                          opacity: 0,
                          x: -40,
                          transition: { type: "tween", duration: 0.35, ease: EASE_OUT }
                        }}
                        style={{ overflow: "hidden", willChange: "transform, opacity" }}
                        className="col-xl-4 col-lg-4"
                      >
                        <Form.Item label="Kinh phí không khoán" name="kinhPhiKhongKhoan"
                          rules={[{ type: 'number', min: 0, message: "Giá trị không hợp lệ!" }]}>
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
                      </motion.div>
                    </>

                  )}
                </AnimatePresence>
              </div>
              <HeaderTitle title={"Thông tin thành viên"} />
              <Form.List name="thanhViens">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th className="text-center" style={{ width: '50px' }}>TT</th>
                            <th className="text-center" style={{ width: '30%' }} >Thành viên</th>
                            <th className="text-center">Chức vụ</th>
                            <th className="text-center" style={{ width: '30%' }}>Đơn vị công tác</th>
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
                                  name={[name, 'thanhVien']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
                                >
                                  <UserSelect
                                    placeholder="Chọn thành viên"
                                    onUserIdChange={(userId) => {
                                      if (userId) {
                                        form.setFieldValue(['thanhViens', name, 'thanhVienId'], userId);
                                        setThanhVienIdSelected(prev => ({
                                          ...prev,
                                          [name]: userId
                                        }));
                                      } else {
                                        form.setFieldValue(['thanhViens', name, 'thanhVienId'], null);
                                        form.setFieldValue(['thanhViens', name, 'donViCongTac'], '');
                                        setThanhVienIdSelected(prev => {
                                          const updated = { ...prev };
                                          delete updated[name];
                                          return updated;
                                        });
                                      }
                                    }}
                                  />
                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'chucVu']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
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
                                        categoryGroupCode: CATEGORY_GROUP_CODE.VAI_TRO,
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
                                        form.setFieldValue(['thanhViens', name, 'chucVuId'], current?.id);
                                      } else {
                                        form.setFieldValue(['thanhViens', name, 'chucVuId'], null);
                                      }
                                    }}
                                  />
                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'donViCongTac']}
                                  className="mb-0"
                                >
                                  <Input placeholder="" disabled />
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