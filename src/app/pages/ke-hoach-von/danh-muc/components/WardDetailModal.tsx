import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IWardCommune,
  ICreateWardCommuneRequest,
  IUpdateWardCommuneRequest,
} from '@/models/ke-hoach-von';

import { handleFiles, handleImage } from '@/utils/utils';
import { requestPOST, requestPUT, requestGET, API_URL } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import {
  getWardById,
} from '@/services/ward.service';
import { searchProvinces } from '@/services/province.service';

export const WardDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IWardCommune | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IWardCommune>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      if (!id) {
        form.resetFields();
        setAttachments([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getWardById(id);
        if (response) {
          setAttachments(handleImage(response?.attachments ?? ''));
          
          // Load thông tin tỉnh thành phố để hiển thị tên
          let provinceCityValue: any = null;
          if (response.provinceCityId) {
            try {
              const provinceResponse = await requestGET<IResult<any>>(`ProvinceCities/${response.provinceCityId}`);
              if (provinceResponse?.data?.data) {
                provinceCityValue = {
                  value: provinceResponse.data.data.id,
                  label: `${provinceResponse.data.data.code || ''} - ${provinceResponse.data.data.name || ''}`,
                };
              }
            } catch (error) {
              // Silent fail
            }
          }

          form.setFieldsValue({
            ...response,
            provinceCityId: provinceCityValue as any,
          });
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, form]);

  const handleCancel = (): void => {
    form.resetFields();
    setAttachments([]);
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async (): Promise<void> => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const formData: ICreateWardCommuneRequest | IUpdateWardCommuneRequest = {
        ...(id && { id }),
        name: values.name,
        code: values.code,
        provinceCityId: values.provinceCityId?.value || values.provinceCityId,
        administrativeCode: values.administrativeCode,
        level: values.level,
        description: values.description,
        attachments: handleFiles(attachments ?? []),
        sortOrder: values.sortOrder,
        isActive: values.isActive ?? true,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`WardCommunes/${id}`, formData)
        : await requestPOST<IResult<string>>(`WardCommunes`, formData);

      if (response?.data?.succeeded) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo: any) {
      const errorMessage =
        errorInfo?.response?.data?.message || errorInfo?.message || 'Thao tác thất bại, vui lòng thử lại!';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
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
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} phường xã</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form<IWardCommune>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin chung" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Mã"
                  name="code"
                >
                  <Input placeholder="Mã phường xã" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Tên"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên phường xã' }]}
                >
                  <Input placeholder="Tên phường xã" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item
                  label="Tỉnh thành phố"
                  name="provinceCityId"
                  rules={[{ required: true, message: 'Vui lòng chọn tỉnh thành phố' }]}
                >
                  <TDSelect
                    placeholder="Chọn tỉnh thành phố"
                    fetchOptions={async keyword => {
                      const res = await searchProvinces({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      const filtered = res.data ?? [];
                      return filtered.map(item => ({
                        ...item,
                        label: `${item.code || ''} - ${item.name || ''}`,
                        value: item.id,
                      }));
                    }}
                    showSearch
                    reload
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Mã hành chính" name="administrativeCode">
                  <Input placeholder="Mã hành chính" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Cấp hành chính" name="level">
                  <Input type="number" placeholder="Cấp hành chính (3: Phường, 4: Xã)" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Thứ tự sắp xếp" name="sortOrder">
                  <Input type="number" placeholder="Thứ tự sắp xếp" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nội dung" name="description">
                  <Input.TextArea rows={4} placeholder="Nội dung" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Tài liệu đính kèm" name="attachments">
                  <FileUpload
                    fileList={attachments}
                    onChange={(e) => setAttachments(e.fileList)}
                    multiple={true}
                    URL={`${API_URL}/api/v1/attachments/public`}
                    isReadOnly={dataModal?.readOnly ?? false}
                    isUseAliyunOSS
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!dataModal?.readOnly && (
          <div className="d-flex justify-content-center align-items-center">
            <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={onFinish} disabled={buttonLoading}>
              <i className="fa-regular fa-floppy-disk"></i>
              {id ? 'Lưu' : 'Tạo mới'}
            </Button>
          </div>
        )}
        <div className="d-flex justify-content-center align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
