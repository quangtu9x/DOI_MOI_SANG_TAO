import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Card, Button as ButtonAntd, Col, Form, Input, Row, Spin, Checkbox } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IAppConfig, IResult } from '@/models';
import { requestGET, requestPOST } from '@/utils/baseAPI';




export const AppConfigDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props

  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IAppConfig | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IAppConfig>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IAppConfig>>(`appconfigs/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          form.setFieldsValue({
            ..._data,
            data: [_data]
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

      const formData: IAppConfig = {
        ...values,
        ...(id && { id }),
      };
      const response = await requestPOST<IResult<string>>(`appconfigs/createall`, {
        data: formData.data
      })
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
            <Form<IAppConfig> form={form}
              initialValues={{
                data: [{
                  key: '',
                  value: '',
                  description: '',
                  isActivePortal: false,
                }]
              }}
              layout="vertical" autoComplete="off" disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <div className="col-xl-12 col-lg-12">
                    <Form.List name="data">
                      {(fields, { add, remove }) => (
                        <div
                          style={{
                            display: "flex",
                            rowGap: 16,
                            flexDirection: "column",
                          }}
                        >
                          {fields.map((field) => (
                            <Card
                              size="small"
                              title={`Cấu hình hệ thống ${field.name + 1}`}
                              key={field.key}
                              extra={
                                field.name > 0 &&
                                <ButtonAntd
                                  iconPosition="end"
                                  type="link"
                                  onClick={() => remove(field.name)}
                                >
                                  <i className="fa-solid fa-xmark" />
                                </ButtonAntd>
                              }
                            >
                              <div className="row">
                                <div className="col-xl-6 col-lg-6">
                                  <Form.Item
                                    label="Key"
                                    name={[field.name, "key"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Không được để trống!",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="" />
                                  </Form.Item>
                                </div>
                                <div className="col-xl-6 col-lg-6">
                                  <Form.Item
                                    label="Value"
                                    name={[field.name, "value"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Không được để trống!",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="" />
                                  </Form.Item>
                                </div>
                                <div className="col-xl-6 col-lg-6">
                                  <Form.Item
                                    label="Mô tả"
                                    name={[field.name, "description"]}
                                  >
                                    <Input.TextArea rows={4} placeholder="" />
                                  </Form.Item>
                                </div>
                                <div className="col-xl-6 col-lg-6">
                                  <Form.Item
                                    label=" "
                                    name={[field.name, "isActivePortal"]}
                                    valuePropName="checked"
                                  >
                                    <Checkbox>Dùng cho cổng</Checkbox>
                                  </Form.Item>
                                </div>
                              </div>
                            </Card>
                          ))}
                          <div className="col-xl-4 col-lg-4">
                            <ButtonAntd type="dashed" onClick={() => add()}>
                              + Thêm
                            </ButtonAntd>
                          </div>
                        </div>
                      )}
                    </Form.List>
                  </div>
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

