import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IDatHangNhiemVu, IDeXuatDeTai, IPaginationResponse, IResult } from '@/models';
import { handleFiles, handleImage } from '@/utils/utils';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { ChuyenGiaInfoSection, FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';




export const DeXuatDeTaiDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModalCapBa = useSelector((state: RootState) => state.modal.dataModalCapBa) as IDeXuatDeTai | null;
  const modalVisibleCapBa = useSelector((state: RootState) => state.modal.modalVisibleCapBa);
  const id = dataModalCapBa?.id ?? null;

  const [form] = Form.useForm<IDeXuatDeTai>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [datHangNhiemVuIdSelected, setDatHangNhiemVuIdSelected] = useState<string | null>(null);
  const [chuyenGiaIdSelected, setChuyenGiaIdSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await requestGET<IResult<IDatHangNhiemVu>>(`dathangnhiemvus/${datHangNhiemVuIdSelected}`);
        const _data = res?.data?.data ?? null;
        if (_data) {
          form.setFieldsValue({
            datHangNhiemVu: {
              kinhPhiDuKien: _data.kinhPhiDuKien,
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
          setChuyenGiaIdSelected(_data.nguoiDeXuatId ?? null);
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
    dispatch(actionsModal.setModalVisibleCapBa(false));
  };

  return (
    <Modal
      show={modalVisibleCapBa}
      fullscreen={'lg-down'}
      size="xl"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">{dataModalCapBa?.readOnly ? 'Chi tiết' : (id ? 'Chỉnh sửa' : 'Tạo mới')}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IDeXuatDeTai>
              initialValues={{ sortOrder: totalCount + 1, isActive: true }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModalCapBa?.readOnly ?? false}>

              <ChuyenGiaInfoSection
                form={form}
                disabled={dataModalCapBa?.readOnly ?? false}
                initialChuyenGiaId={chuyenGiaIdSelected}
                onChuyenGiaIdChange={setChuyenGiaIdSelected}
              />
              <HeaderTitle title={"Thông tin đặt hàng"} />
              <div className="row">
                <div className="col-xl-8 col-lg-8">
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
              </div>
              <HeaderTitle title={"Thông tin đề xuất đề tài"} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tên đề tài" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder=""
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

                <div className="col-xl-6 col-lg-6">
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
                <div className="col-xl-6 col-lg-6">
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
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};