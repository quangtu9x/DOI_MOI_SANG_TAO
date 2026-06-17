import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, Form, Input, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IUserGuide, IPaginationResponse, IResult } from '@/models';
import { removeAccents } from '@/utils/utils';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { TDSelect, TDJsonEditor } from '@/app/components';



export const UserGuideDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount, categoryGroupId } = props

  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IUserGuide | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IUserGuide>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IUserGuide>>(`userguides/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          // Backend trả về definitionJson là object (JsonElement)
          // Cần convert sang string để TDJsonEditorEditable xử lý
          const formValues = {
            ..._data,
            definitionJson: typeof _data.definitionJson === 'object'
              ? JSON.stringify(_data.definitionJson, null, 2)
              : _data.definitionJson
          };
          form.setFieldsValue(formValues);
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
    console.log('Form values:', form.getFieldsValue());
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      // Convert definitionJson từ string sang object trước khi gửi lên backend
      const formData: IUserGuide = {
        ...values,
        ...(id && { id }),
        definitionJson: typeof values.definitionJson === 'string'
          ? JSON.parse(values.definitionJson)
          : values.definitionJson
      };

      const response = id
        ? await requestPUT<IResult<string>>(`userguides/${id}`, formData)
        : await requestPOST<IResult<string>>(`userguides`, formData);

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
            <Form<IUserGuide> form={form}
              initialValues={{ sortOrder: totalCount + 1, isActive: true }}
              layout="vertical" autoComplete="off" disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <Input placeholder=""
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Loại" name="type" rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <Input placeholder=""
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Phiên bản" name="version" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item name="isPublished" valuePropName="checked" >
                    <Checkbox>Công bố</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-12">
                  <Form.Item
                    label="Định nghĩa JSON"
                    name="definitionJson"
                    rules={[
                      { required: true, message: 'Không được để trống!' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          try {
                            // Nếu là object thì đã hợp lệ
                            if (typeof value === 'object') {
                              return Promise.resolve();
                            }
                            // Nếu là string thì parse để kiểm tra
                            JSON.parse(value);
                            return Promise.resolve();
                          } catch {
                            return Promise.reject(new Error('JSON không hợp lệ!'));
                          }
                        }
                      }
                    ]}
                  >
                    <TDJsonEditor
                      height={400}
                      indentWidth={2}
                      theme="light"
                      showEditor={false}
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

