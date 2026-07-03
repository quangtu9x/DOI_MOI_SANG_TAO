import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, Select, Spin, InputNumber, Switch } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IResult } from '@/models';
import { IIdeaFieldConfig } from '@/models/cau-hinh-truong-y-tuong';
import { requestGET, requestPOST } from '@/utils/baseAPI';

const { TextArea } = Input;

const DATA_TYPE_OPTIONS = [
  { label: 'Văn bản (text)',         value: 'text' },
  { label: 'Văn bản dài (textarea)', value: 'textarea' },
  { label: 'Danh sách (select)',     value: 'select' },
  { label: 'Tệp tin (file)',         value: 'file' },
];

export const CauHinhTruongYTuongDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();

  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IIdeaFieldConfig | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IIdeaFieldConfig>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IIdeaFieldConfig>>(`ideafieldconfigs/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          form.setFieldsValue({
            ..._data,
          });
        }
      } catch (error) {
        console.error('Error fetching idea field config:', error);
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

      const formData: IIdeaFieldConfig = {
        ...values,
        ...(id && { id }),
      };

      const response = await requestPOST<IResult<string>>(`ideafieldconfigs/createall`, {
        data: [formData],
      });

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
      size="lg"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">
          {dataModal?.readOnly ? 'Chi tiết cấu hình' : (id ? 'Chỉnh sửa cấu hình' : 'Thêm mới cấu hình')}
        </Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IIdeaFieldConfig>
              form={form}
              layout="vertical"
              autoComplete="off"
              disabled={dataModal?.readOnly ?? false}
              initialValues={{
                fieldCode: '',
                fieldName: '',
                dataType: 'text',
                isRequired: true,
                isActive: true,
                sortOrder: 1,
                description: '',
                placeholder: '',
                maxLength: undefined,
                defaultValue: '',
                options: '',
              }}
            >
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    label="Mã trường"
                    name="fieldCode"
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <Input placeholder="Ví dụ: tenYTuong, linhVuc..." />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    label="Tên trường hiển thị"
                    name="fieldName"
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <Input placeholder="Tên hiển thị trên form..." />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    label="Kiểu dữ liệu"
                    name="dataType"
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <Select options={DATA_TYPE_OPTIONS} placeholder="Chọn kiểu dữ liệu" />
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item label="Bắt buộc" name="isRequired" valuePropName="checked">
                    <Switch checkedChildren="Bắt buộc" unCheckedChildren="Không" />
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
                    <Switch checkedChildren="Có" unCheckedChildren="Không" />
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item
                    label="Thứ tự"
                    name="sortOrder"
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <InputNumber min={1} max={999} style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item label="Độ dài tối đa" name="maxLength">
                    <InputNumber min={0} max={99999} style={{ width: '100%' }} placeholder="Không giới hạn" />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Mô tả / Hướng dẫn" name="description">
                    <TextArea rows={2} placeholder="Mô tả ngắn về mục đích của trường này..." />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Placeholder" name="placeholder">
                    <Input placeholder="Văn bản gợi ý trong ô nhập..." />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Giá trị mặc định" name="defaultValue">
                    <Input placeholder="Giá trị khởi tạo (nếu có)..." />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item
                    label="Tuỳ chọn (dành cho kiểu 'Danh sách')"
                    name="options"
                    extra="Nhập JSON array, ví dụ: [{'label':'Lựa chọn 1','value':'1'},{'label':'Lựa chọn 2','value':'2'}]"
                  >
                    <TextArea rows={3} placeholder="JSON array cho các tuỳ chọn của select..." />
                  </Form.Item>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!dataModal?.readOnly && (
          <div className="d-flex justify-content-center align-items-center">
            <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={onFinish} disabled={buttonLoading}>
              <i className="fa-regular fa-floppy-disk"></i>
              {id ? 'Lưu' : 'Thêm mới'}
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