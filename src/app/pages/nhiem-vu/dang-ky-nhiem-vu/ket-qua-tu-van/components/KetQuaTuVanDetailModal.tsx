import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AutoComplete, DatePicker, Form, Input, InputNumber, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IKetQuaTuVan, IResult, IDeXuatDeTai, IHoiDongTuVan, TrangThaiDeXuat, IPaginationResponse, INhiemVuChinhThuc } from '@/models';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { HeaderTitle, SubTitle, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';
import { DeXuatDeTaiTable } from './DeXuatDeTaiTable';
import { SearchData } from '@/types';
import { LOAI_NHIEM_VU } from '@/data';




export const KetQuaTuVanDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IKetQuaTuVan | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IKetQuaTuVan>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [deXuatDeTais, setDeXuatDeTais] = useState<IDeXuatDeTai[]>([]);

  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const deXuats = await Promise.all(
          selectedRowKeys.map(async (item: string) => {

            try {
              const res = await requestGET<IResult<IDeXuatDeTai>>(`dexuatdetais/${item}`);
              const deXuatData = res?.data?.data;
              return deXuatData;
            } catch (error) {
              console.error('Error fetching chuyengia info:', error);
            }
          })
        );

        if (deXuats) {
          setDeXuatDeTais(deXuats.filter(item => item !== undefined) as IDeXuatDeTai[]);
        }
      } catch (error) {
        console.error('Error fetching organization unit:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    }
    if (selectedRowKeys.length > 0) {
      fetchData();
    }
    else {
      setDeXuatDeTais([]);
    }
  }, [selectedRowKeys]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IKetQuaTuVan>>(`KetQuaTuVans/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));
          setSelectedRowKeys(_data?.deXuatDeTais?.map(item => item.id) ?? []);
          form.setFieldsValue({
            ..._data,
            hoiDongTuVan: _data.hoiDongTuVanId ? { value: _data.hoiDongTuVanId, label: _data.hoiDongTuVanTen } : null,
            ngayHop: toViewDate(_data.ngayHop),
            deXuatDeTais: [],
            nhiemVuChinhThuc: null,
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
      const formData: IKetQuaTuVan = {
        ...values,
        ...(id && { id }),
        ngayHop: toSaveDate(values.ngayHop),
        dinhKem: handleFiles(dinhKem).join('##'),
        deXuatDeTaiIds: selectedRowKeys,
        hoiDongTuVanId: values.hoiDongTuVan?.value || values.hoiDongTuVanId || '',
      };

      const response = id
        ? await requestPUT<IResult<string>>(`KetQuaTuVans/${id}`, formData)
        : await requestPOST<IResult<string>>(`KetQuaTuVans`, formData);

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
            <Form<IKetQuaTuVan>
              initialValues={{
                thanhViens: [{
                  thanhVienId: null,
                  chucVuId: null,
                  donViCongTac: '',
                }]
              }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <HeaderTitle title={"Đề xuất đề tài"} />
              <div className="row">
                <div className="card-toolbar d-flex flex-row-reverse">
                  <div className="btn-group w-250px">
                    <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
                  </div>
                </div>

                <DeXuatDeTaiTable
                  searchData={searchData}
                  selectedRowKeys={selectedRowKeys}
                  setSelectedRowKeys={setSelectedRowKeys} />
              </div>
              <HeaderTitle title={"Kết quả tư vấn"} />
              <div className="row">
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Hội đồng tư vấn" name='hoiDongTuVan'
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      reload
                      showSearch
                      placeholder="Chọn hội đồng tư vấn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<IHoiDongTuVan[]>>(`hoidongtuvans/search`, {
                          pageNumber: 1,
                          pageSize: 100,
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
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ngày họp" name='ngayHop' initialValue={dayjs()}
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Kết quả bỏ phiếu" name='ketQuaBoPhieu'
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item
                    label="Điểm trung bình"
                    name="diemTrungBinh"
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
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Ý kiến của hội đồng" name='yKienCuaHoiDong'>
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
              </div>
              <SubTitle title={"Nhiệm vụ chính thức"} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tên nhiệm vụ"
                    name={['nhiemVuChinhThuc', 'ten']}
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <AutoComplete
                      options={deXuatDeTais.map(item => ({ value: item.ten }))}
                      placeholder=""
                      allowClear
                      filterOption={(inputValue, option) =>
                        option!.value.toLowerCase().includes(inputValue.toLowerCase())
                      }
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Mã nhiệm vụ"
                    name={['nhiemVuChinhThuc', 'ma']}
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Loại nhiệm vụ"
                    name={['nhiemVuChinhThuc', 'loaiNhiemVu']}
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}>
                    <Select placeholder="Chọn" allowClear>
                      {LOAI_NHIEM_VU?.map((item, key) => (
                        <Select.Option key={key} value={item.id}>{item.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Mục tiêu"
                    name={['nhiemVuChinhThuc', 'mucTieu']} >
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Yêu cầu sản phẩm" name={['nhiemVuChinhThuc', 'yeuCauSanPham']} >
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Kinh phí trần"
                    name={['nhiemVuChinhThuc', 'kinhPhiTran']}
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
                  <Form.Item label="Thời gian thực hiện"
                    name={['nhiemVuChinhThuc', 'thoiGianThucHien']}
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