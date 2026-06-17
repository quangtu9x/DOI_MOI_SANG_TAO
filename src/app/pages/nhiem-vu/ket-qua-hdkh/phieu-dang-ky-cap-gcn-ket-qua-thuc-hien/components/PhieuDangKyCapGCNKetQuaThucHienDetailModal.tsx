import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, Spin, Select } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IPhieuDangKyCapGCNKetQuaThucHien, IResult, IPaginationResponse } from '@/models';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { API_URL, requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { TRANG_THAI_PHIEU_DANG_KY_CAP_GCN } from '@/data/nhiem-vu';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';

export const PhieuDangKyCapGCNKetQuaThucHienDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IPhieuDangKyCapGCNKetQuaThucHien | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IPhieuDangKyCapGCNKetQuaThucHien>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IPhieuDangKyCapGCNKetQuaThucHien>>(`PhieuDangKyCapGCNKetQuaThucHiens/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          form.setFieldsValue({
            ..._data,
            ngayDangKy: toViewDate(_data.ngayDangKy),
            nhiemVu: _data.nhiemVuId ? {
              value: _data.nhiemVuId,
              label: _data.nhiemVuTen,
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
      const formData: IPhieuDangKyCapGCNKetQuaThucHien = {
        ...values,
        ...(id && { id }),
        ngayDangKy: toSaveDate(values.ngayDangKy),
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`PhieuDangKyCapGCNKetQuaThucHiens/${id}`, formData)
        : await requestPOST<IResult<string>>(`PhieuDangKyCapGCNKetQuaThucHiens`, formData);

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
          {dataModal?.readOnly ? 'Chi tiết' : (id ? 'Chỉnh sửa' : 'Tạo mới')}
        </Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IPhieuDangKyCapGCNKetQuaThucHien>
              form={form}
              layout="vertical"
              autoComplete="off"
              disabled={dataModal?.readOnly ?? false}
              initialValues={{
                ngayDangKy: dayjs(),
              }}
            >
              <HeaderTitle title={"Thông tin phiếu đăng ký"} />
              <div className="row">
                <div className="col-xl-4 col-lg-6">
                  <Form.Item label="Số phiếu" name="soPhieu" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <Form.Item label="Ngày đăng ký" name='ngayDangKy' rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <Form.Item label="Trạng thái" name="trangThai">
                    <Select placeholder="Chọn" allowClear>
                      {TRANG_THAI_PHIEU_DANG_KY_CAP_GCN?.map((item, key) => (
                        <Select.Option key={key} value={item.id}>{item.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Nhiệm vụ" name="nhiemVu" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      showSearch
                      placeholder="Chọn nhiệm vụ"
                      fetchOptions={async (keyword) => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`NhiemVuChinhThucs/search`, {
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
                <div className="col-xl-12">
                  <Form.Item label="Tổ chức, cá nhân đăng ký" name="toChucCaNhanDangKy">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Kết quả thực hiện" name="ketQuaThucHien">
                    <Input.TextArea rows={3} placeholder="" />
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
