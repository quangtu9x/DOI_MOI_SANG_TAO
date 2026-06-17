import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, DatePicker, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { IResult, IThongTinChuyenGiao, IPaginationResponse } from '@/models';
import { API_URL, requestPOST, requestPUT, requestGET } from '@/utils/baseAPI';
import { FileUpload, TDSelect, HeaderTitle } from '@/app/components';
import { TRANG_THAI_THONG_TIN_CHUYEN_GIAO } from '@/data/nhiem-vu';
import { TDUploadFile } from '@/models/TDUploadFile';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';

export const ThongTinChuyenGiaoDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props;
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IThongTinChuyenGiao | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IThongTinChuyenGiao>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IThongTinChuyenGiao>>(`ThongTinChuyenGiaos/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          form.setFieldsValue({
            ..._data,
            thoiGianChuyenGiao: toViewDate(_data.thoiGianChuyenGiao),
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
      const formData: IThongTinChuyenGiao = {
        ...values,
        ...(id && { id }),
        thoiGianChuyenGiao: toSaveDate(values.thoiGianChuyenGiao),
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`ThongTinChuyenGiaos/${id}`, formData)
        : await requestPOST<IResult<string>>(`ThongTinChuyenGiaos`, formData);

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
            <Form<IThongTinChuyenGiao>
              form={form}
              layout="vertical"
              autoComplete="off"
              disabled={dataModal?.readOnly ?? false}
            >
              <HeaderTitle title={"Thông tin đề nghị chuyển giao"} />
              <div className="row">
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
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Cá nhân/Tổ chức nhận" name="tenCaNhanToChucNhan" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Trạng thái" name="trangThai">
                    <Select placeholder="Chọn" allowClear>
                      {TRANG_THAI_THONG_TIN_CHUYEN_GIAO?.map((item, key) => (
                        <Select.Option key={key} value={item.id}>{item.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Địa chỉ" name="diaChi">
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Điện thoại" name="dienThoai">
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Email" name="email">
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Nội dung chuyển giao" name="noiDungChuyenGiao">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Phương thức chuyển giao" name="phuongThucChuyenGiao">
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Thời gian chuyển giao" name='thoiGianChuyenGiao'>
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Địa điểm chuyển giao" name="diaDiemChuyenGiao">
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
