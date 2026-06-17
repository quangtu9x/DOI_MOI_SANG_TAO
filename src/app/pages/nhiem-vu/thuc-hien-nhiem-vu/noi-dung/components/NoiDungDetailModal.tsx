import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AutoComplete, DatePicker, Form, Input, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IHoSoThamDinh, IPaginationResponse, IResult, IKeHoachThucHien, IBienBanMoHoSo, IChiTietMoHoSo, LoaiChiTietMoHoSo } from '@/models';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { HeaderTitle, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { getChuyenGiaLabel } from '../../../xet-duyet-chu-nhiem/common';

export const NoiDungDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IHoSoThamDinh | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<any>();
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
        const response = await requestGET<IResult<IHoSoThamDinh>>(`HoSoThamDinhs/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          const keHoachThucHiens = _data?.keHoachThucHiens?.map(item => ({
            ...item,
            thoiGian: [toViewDate(item?.ngayBatDau), toViewDate(item?.ngayKetThuc)],
          }))

          form.setFieldsValue({
            ..._data,
            ngayThanhLap: toViewDate((_data as any).ngayThanhLap),
            keHoachThucHiens: keHoachThucHiens || [],
          });
        }
      } catch (error) {
        console.error('Error fetching HoSoThamDinh:', error);
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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await requestPOST<IPaginationResponse<IHoSoThamDinh[]>>('HoSoThamDinhs/search', {
  //         pageNumber: 1,
  //         pageSize: 10,
  //         nhiemVuId: objectSelected?.nhiemVuId,
  //         chuNhiemId: objectSelected?.chuNhiemId,
  //       });

  //       if (response.data) {
  //         const { data: responseData } = response.data;
  //         const hoSoThamDinh = responseData?.[0] ?? null;
  //         if (hoSoThamDinh) {
  //           const keHoachThucHiens = await Promise.all(
  //             (hoSoThamDinh?.keHoachThucHiens || []).map(async (item: IKeHoachThucHien, index: number) => {
  //               var nguoiPhuTrachLabel = await getChuyenGiaLabel(item.nguoiPhuTrachId);
  //               item.nguoiPhuTrach = item.nguoiPhuTrachId ? {
  //                 value: item.nguoiPhuTrachId,
  //                 label: nguoiPhuTrachLabel,
  //               } : null;
  //               return {
  //                 ...item,
  //                 thoiGian: [toViewDate(item?.ngayBatDau), toViewDate(item?.ngayKetThuc)],
  //               };
  //             })
  //           );

  //           form.setFieldsValue({
  //             tongKinhPhiDeXuat: hoSoThamDinh?.tongKinhPhiDeXuat || 0,
  //             nganSachNhaNuoc: hoSoThamDinh?.nganSachNhaNuoc || 0,
  //             nguonKhac: hoSoThamDinh?.nguonKhac || 0,
  //             keHoachThucHiens: keHoachThucHiens || [],
  //           })
  //         }
  //       } else {
  //         form.setFieldsValue({
  //           tongKinhPhiDeXuat: 0,
  //           nganSachNhaNuoc: 0,
  //           nguonKhac: 0,
  //           keHoachThucHiens: [],
  //         });
  //       }
  //     } catch (error) {
  //       form.setFieldsValue({
  //         tongKinhPhiDeXuat: 0,
  //         nganSachNhaNuoc: 0,
  //         nguonKhac: 0,
  //         keHoachThucHiens: [],
  //       });
  //       console.error('Error fetching hoSoThamDinh:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  //   if (objectSelected?.nhiemVuId && objectSelected?.chuNhiemId && !id) {
  //     fetchData();
  //   }
  // }, [objectSelected, id]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formData: IHoSoThamDinh = {
        ...values,
        ...(id && { id }),
        dinhKem: handleFiles(dinhKem).join('##'),
        keHoachThucHiens: (values.keHoachThucHiens || []).map((item: IKeHoachThucHien) => ({
          ...item,
          ngayBatDau: toSaveDate(item?.thoiGian?.[0]),
          ngayKetThuc: toSaveDate(item?.thoiGian?.[1]),
        })),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`HoSoThamDinhs/${id}/noi-dung`, formData)
        : await requestPOST<IResult<string>>(`HoSoThamDinhs/noi-dung`, formData);

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
            <Form<any>
              initialValues={{
                keHoachThucHiens: [{}]
              }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
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
                          setNhiemVuIdSelected(current?.id)
                        } else {
                          form.setFieldValue('nhiemVuId', null);
                          setNhiemVuIdSelected(null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
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
                  <Form.Item label="Tổng kinh phí đề xuất" name="tongKinhPhiDeXuat"
                    rules={[
                      { required: true, message: "Không được để trống!" },
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
                  <Form.Item label="Kinh phí ngân sách" name="nganSachNhaNuoc"
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
                  <Form.Item label="Kinh phí khác" name="nguonKhac"
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
              <HeaderTitle title={"Kế hoạch thực hiện"} />
              <Form.List name="keHoachThucHiens">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th className="text-center" style={{ width: '50px' }}>TT</th>
                            <th className="text-center" >Nội dung công việc</th>
                            <th className="text-center" style={{ width: '20%' }}>Kết quả cần đạt</th>
                            <th className="text-center" style={{ width: '22%' }}>Thời gian</th>
                            <th className="text-center" style={{ width: '15%' }}>Người phụ trách</th>
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
                                  name={[name, 'ten']}
                                  className="mb-0"
                                >
                                  <Input placeholder="" />
                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'ketQuaPhaiDat']}
                                  className="mb-0"
                                >
                                  <Input placeholder="" />
                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'thoiGian']}
                                  className="mb-0"
                                >
                                  <DatePicker.RangePicker
                                    className="w-100"
                                    format="DD/MM/YYYY"
                                    placeholder={['Từ', 'đến']}
                                  />
                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'nguoiPhuTrach']}
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
                                Thêm kế hoạch
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
