import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { IResult, ISanPhamKhoaHoc, IPaginationResponse, INhiemVuChinhThuc, ICategory } from '@/models';
import { API_URL, requestPOST, requestPUT, requestGET } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { handleFiles, handleImage } from '@/utils/utils';

export const SanPhamKhoaHocDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props;
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as ISanPhamKhoaHoc | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ISanPhamKhoaHoc>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<ISanPhamKhoaHoc>>(`SanPhamKhoaHocs/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          form.setFieldsValue({
            ..._data,
            nhiemVu: _data.nhiemVuId ? {
              value: _data.nhiemVuId,
              label: _data.nhiemVuTen,
            } : null,
            loaiSanPham: _data.loaiSanPhamId ? {
              value: _data.loaiSanPhamId,
              label: _data.loaiSanPhamTen,
            } : null,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
    return () => { };
  }, [id, form]);

  const handleCancel = () => {
    form.resetFields();
    setDinhKem([]);
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formData: ISanPhamKhoaHoc = {
        ...values,
        ...(id && { id }),
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`SanPhamKhoaHocs/${id}`, formData)
        : await requestPOST<IResult<string>>(`SanPhamKhoaHocs`, formData);

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
        <Modal.Title className="text-white">
          {dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'}
        </Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<ISanPhamKhoaHoc>
              form={form}
              layout="vertical"
              autoComplete="off"
              disabled={dataModal?.readOnly ?? false}
            >
              <HeaderTitle title={"Thông tin sản phẩm khoa học"} />
              <div className="row">
                <div className="col-xl-12">
                  <Form.Item label="Nhiệm vụ" name="nhiemVu" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      showSearch
                      placeholder="Chọn nhiệm vụ"
                      fetchOptions={async (keyword) => {
                        const res = await requestPOST<IPaginationResponse<INhiemVuChinhThuc[]>>(`NhiemVuChinhThucs/search`, {
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
                      onChange={(value, current: any) => {
                        if (value) {
                          form.setFieldValue('nhiemVuId', current?.id);
                        } else {
                          form.setFieldValue('nhiemVuId', null);
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item name="nhiemVuId" hidden><Input /></Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tên sản phẩm" name="tenSanPham" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Loại sản phẩm" name="loaiSanPham" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      showSearch
                      placeholder="Chọn loại sản phẩm"
                      fetchOptions={async (keyword) => {
                        const res = await requestPOST<IPaginationResponse<ICategory[]>>(`Categories/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                          groupCode: 'LOAI_SAN_PHAM',
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
                          form.setFieldValue('loaiSanPhamId', current?.id);
                        } else {
                          form.setFieldValue('loaiSanPhamId', null);
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item name="loaiSanPhamId" hidden><Input /></Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Mô tả sản phẩm" name="moTaSanPham">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Khả năng ứng dụng" name="khaNangUngDung">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Địa chỉ ứng dụng" name="diaChiUngDung">
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Đính kèm" name='dinhKem'>
                    <FileUpload
                      accept={['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc']}
                      multiple={true}
                      URL={`${API_URL}/api/v1/attachments/public`}
                      maxCount={10}
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
