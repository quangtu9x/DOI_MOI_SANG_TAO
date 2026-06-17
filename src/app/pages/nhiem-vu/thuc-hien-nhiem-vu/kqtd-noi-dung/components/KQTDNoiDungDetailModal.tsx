import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AutoComplete, Avatar, DatePicker, Form, Input, InputNumber, Space, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import {
  IBienBanThamDinh, IPaginationResponse, IResult,
  IKetQuaThamDinhKeHoach, LoaiChiTietMoHoSo, IBienBanMoHoSo, IChiTietMoHoSo
} from '@/models';
import { formatName, getThumbnailUrl, handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { HeaderTitle, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { getChuyenGiaLabel } from '../../../xet-duyet-chu-nhiem/common';
import dayjs from 'dayjs';

export const KQTDNoiDungDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IBienBanThamDinh | null;
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
        const response = await requestGET<IResult<IBienBanThamDinh>>(`BienBanThamDinhs/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));
          var chuNhiemLabel = await getChuyenGiaLabel(_data.chuNhiemId);
          _data.ngayHop = toViewDate(_data.ngayHop);
          _data.nhiemVu = _data.nhiemVuId ? {
            value: _data.nhiemVuId,
            label: _data.nhiemVuTen,
          } : null;

          _data.chuNhiem = _data.chuNhiemId ? {
            value: _data.chuNhiemId,
            label: chuNhiemLabel,
          } : null;

          _data.hoiDongThamDinh = _data.hoiDongThamDinhId ? {
            value: _data.hoiDongThamDinhId,
            label: _data.hoiDongThamDinhTen,
          } : null;


          const ketQuaThamDinhKeHoachs = (_data?.ketQuaThamDinhKeHoachs || []).map((item: IKetQuaThamDinhKeHoach, index: number) => {
            return {
              ...item,
              keHoachThucHien: item.keHoachThucHienId ? { label: item.keHoachThucHienTen, value: item.keHoachThucHienId } : null,
              thoiGian: [toViewDate(item?.ngayBatDauDuocDuyet), toViewDate(item?.ngayKetThucDuocDuyet)],
            };
          })
          console.log('ketQuaThamDinhKeHoachs', ketQuaThamDinhKeHoachs);

          form.setFieldsValue({
            ..._data,
            ketQuaThamDinhKeHoachs: ketQuaThamDinhKeHoachs,
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

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formData: IBienBanThamDinh = {
        ...values,
        ...(id && { id }),
        dinhKem: handleFiles(dinhKem).join('##'),
        ngayHop: toSaveDate(values.ngayHop),
        ketQuaThamDinhKeHoachs: (values.ketQuaThamDinhKeHoachs || []).map((item: IKetQuaThamDinhKeHoach) => ({
          ...item,
          ngayBatDauDuocDuyet: toSaveDate(item?.thoiGian?.[0]),
          ngayKetThucDuocDuyet: toSaveDate(item?.thoiGian?.[1]),
        })),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`BienBanThamDinhs/${id}/noi-dung`, formData)
        : await requestPOST<IResult<string>>(`BienBanThamDinhs/noi-dung`, formData);

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
                ketQuaThamDinhKeHoachs: [{}]
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
                  <Form.Item label="Hội đồng thẩm định" name="hoiDongThamDinh" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`hoidongthamdinhs/search`, {
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
                          form.setFieldValue('hoiDongThamDinhId', current?.id);
                        } else {
                          form.setFieldValue('hoiDongThamDinhId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ngày họp" name='ngayHop' initialValue={dayjs()}>
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Địa điểm" name='diaDiem'>
                    <Input placeholder=" " />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Tổng kinh phí đề xuất" name="tongKinhPhiDeXuat"
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
                      addonAfter="VND"
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Tổng kinh phí được duyệt" name="tongKinhPhiDuocDuyet"
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
                {/* <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Tổng kinh phí cắt giảm" name="tongKinhPhiCatGiam"
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
                      addonAfter="VND"
                    />
                  </Form.Item>
                </div> */}
              </div>
              {/* <HeaderTitle title={"Kế hoạch thực hiện đề xuất"} />
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
                                  <Input placeholder="" disabled />
                                </Form.Item >
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'ketQuaPhaiDat']}
                                  className="mb-0"
                                >
                                  <Input placeholder="" disabled />
                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'thoiGian']}
                                  className="mb-0"
                                >
                                  <DatePicker.RangePicker
                                    disabled
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
                                  <TDSelect
                                    disabled
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
                                        form.setFieldValue(['keHoachThucHiens', name, 'nguoiPhuTrachId'], current?.id);
                                      } else {
                                        form.setFieldValue(['keHoachThucHiens', name, 'nguoiPhuTrachId'], null);
                                      }
                                    }}
                                  />
                                </Form.Item>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </Form.List> */}

              <HeaderTitle title={"Kết quả thẩm định"} />
              <Form.List name="ketQuaThamDinhKeHoachs">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th className="text-center" style={{ width: '50px' }}>TT</th>
                            <th className="text-center" >Nội dung công việc</th>
                            <th className="text-center" style={{ width: '30%' }}>Kết quả sau phê duyệt</th>
                            <th className="text-center" style={{ width: '25%' }}>Thời gian sau phê duyệt</th>
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
                                  name={[name, 'keHoachThucHien']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
                                >
                                  <TDSelect
                                    notFoundContent="Không tìm thấy dữ liệu"
                                    reload
                                    showSearch
                                    placeholder="Chọn"
                                    fetchOptions={async keyword => {
                                      if (!true) return [];
                                      const res = await requestPOST<IPaginationResponse<any[]>>(`hosothamdinhs/search/noi-dung`, {
                                        pageNumber: 1,
                                        pageSize: 1000,
                                        keyword: keyword,
                                        hoSoThamDinhId: null,
                                      });
                                      return (
                                        res.data?.data?.map(item => ({
                                          ...item,
                                          label: item?.ten,
                                          value: item?.id,
                                        })) ?? []
                                      );
                                    }}
                                    optionLabelProp="label"
                                    onChange={(value, current: any) => {
                                      if (value) {
                                        form.setFieldValue(['ketQuaThamDinhKeHoachs', name, 'keHoachThucHienId'], current?.id);
                                      } else {
                                        form.setFieldValue(['ketQuaThamDinhKeHoachs', name, 'keHoachThucHienId'], null);
                                      }
                                    }}
                                  />
                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'sanPhamYeuCauLai']}
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
                                Thêm kết quả
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
