import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IPaginationResponse, ISanPhamNghiemThu, IResult } from '@/models';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, TDSelect } from '@/app/components';
import { handleFiles, handleImage } from '@/utils/utils';
import { TDUploadFile } from '@/models/TDUploadFile';
import { CATEGORY_GROUP_CODE } from '@/data';

interface Props {
  totalCount: number;
}

export const SanPhamNghiemThuDetailModal: React.FC<Props> = ({ totalCount }) => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as ISanPhamNghiemThu | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ISanPhamNghiemThu>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<ISanPhamNghiemThu>>(`SanPhamNghiemThus/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));
          _data.hopDong = _data.hopDongId ? { label: _data.hopDongTen, value: _data.hopDongId } : null;
          _data.loaiSanPham = _data.loaiSanPhamId ? { label: _data.loaiSanPhamTen, value: _data.loaiSanPhamId } : null;
          form.setFieldsValue(_data);
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
      const formData: ISanPhamNghiemThu = {
        ...values,
        ...(id && { id }),
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`SanPhamNghiemThus/${id}`, formData)
        : await requestPOST<IResult<string>>(`SanPhamNghiemThus`, formData);

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
            <Form<ISanPhamNghiemThu>
              initialValues={{ isActive: true }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Hợp đồng" name="hopDong" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`hopDongTrienKhais/search`, {
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
                          form.setFieldValue('hopDongId', current?.id);
                        } else {
                          form.setFieldValue('hopDongId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Loại sản phẩm" name="loaiSanPham"
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                          categoryGroupCode: CATEGORY_GROUP_CODE.LOAI_SAN_PHAM
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
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tên sản phẩm" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder=' ' />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Yêu cầu theo hợp đồng" name="yeuCauTheoHopDong">
                    <Input.TextArea rows={2} placeholder=' ' />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Kết quả đạt được thực tế" name="ketQuaDatDuocThucTe">
                    <Input.TextArea rows={2} placeholder=' ' />
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
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label=" " name="datYeuCau" valuePropName="checked">
                    <Checkbox>Đạt yêu cầu</Checkbox>
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
