import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IDotDangKy, IPaginationResponse, IResult } from '@/models';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, TDSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';
import { TDUploadFile } from '@/models/TDUploadFile';




export const DotDangKyDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IDotDangKy | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IDotDangKy>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IDotDangKy>>(`DotDangKys/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));
          _data.capQuanLy = _data.capQuanLyId ? {
            value: _data.capQuanLyId,
            label: _data.capQuanLyTen,
          } : null;
          _data.linhVuc = _data.linhVucId ? {
            value: _data.linhVucId,
            label: _data.linhVucTen,
          } : null;
          _data.thoiGian = [toViewDate(_data.ngayBatDau), toViewDate(_data.ngayKetThuc)];
          _data.namTaiChinh = toViewDate(_data.namTaiChinh, 'YYYY');
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
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formData: IDotDangKy = {
        ...values,
        ...(id && { id }),
        ngayBatDau: toSaveDate(values.thoiGian?.[0]),
        ngayKetThuc: toSaveDate(values.thoiGian?.[1]),
        namTaiChinh: toSaveDate(values.namTaiChinh, 'YYYY'),
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`DotDangKys/${id}`, formData)
        : await requestPOST<IResult<string>>(`DotDangKys`, formData);

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
            <Form<IDotDangKy>
              initialValues={{ sortOrder: totalCount + 1, isActive: true }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-8 col-lg-8">
                  <Form.Item label="Tên" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder=""
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Mã" name="ma" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Lĩnh vực" name="linhVuc">
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
                          categoryGroupCode: CATEGORY_GROUP_CODE.LINH_VUC,
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
                          form.setFieldValue('linhVucId', current?.id);
                        } else {
                          form.setFieldValue('linhVucId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>

                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Thời gian" name="thoiGian" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <DatePicker.RangePicker
                      className="w-100"
                      format="DD/MM/YYYY"
                      placeholder={['Từ', 'đến']}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-2 col-lg-2">
                  <Form.Item
                    label="Năm tài chính"
                    name="namTaiChinh"
                    className="mb-0"
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <DatePicker picker="year" placeholder='' className="w-100" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Cấp quản lý" name="capQuanLy">
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
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Văn bản căn cứ" name="vanBanCanCu" >
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
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