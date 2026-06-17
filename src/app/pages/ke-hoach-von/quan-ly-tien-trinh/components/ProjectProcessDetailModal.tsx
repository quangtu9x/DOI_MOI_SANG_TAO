import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, InputNumber, Switch, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IProjectProcess } from '@/models/ke-hoach-von';
import { HeaderTitle, TDSelect } from '@/app/components';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse } from '@/models';
import {
  createProjectProcess,
  updateProjectProcess,
  getProjectProcessById,
} from '@/services/projectProcess.service';

export const ProjectProcessDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModalCapBon) as IProjectProcess | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleCapBon);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IProjectProcess>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        if (id) {
          const _data = await getProjectProcessById(id);
          if (_data) {
            const formValues: any = {
              ..._data,
            };

            // Fetch các ID fields để lấy label
            const fetchPromises: Promise<any>[] = [];

            if (_data.projectTypeId) {
              fetchPromises.push(
                requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                  pageNumber: 1,
                  pageSize: 10000,
                  categoryGroupCode: 'LOAI_DU_AN',
                })
                  .then(res => {
                    const item = res.data?.data?.find(d => d.id === _data.projectTypeId);
                    return item ? { key: 'projectTypeId', label: item.name, value: item.id } : null;
                  })
                  .catch(() => null)
              );
            }

            if (_data.projectGroupId) {
              fetchPromises.push(
                requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                  pageNumber: 1,
                  pageSize: 10000,
                  categoryGroupCode: 'NHOM_DU_AN',
                })
                  .then(res => {
                    const item = res.data?.data?.find(d => d.id === _data.projectGroupId);
                    return item ? { key: 'projectGroupId', label: item.name, value: item.id } : null;
                  })
                  .catch(() => null)
              );
            }

            if (fetchPromises.length > 0) {
              const results = await Promise.allSettled(fetchPromises);
              results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                  const { key, label, value } = result.value;
                  formValues[key] = { label, value };
                }
              });
            }

            form.setFieldsValue(formValues);
          }
        } else {
          form.resetFields();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (modalVisible) {
      fetchData();
    }
  }, [id, modalVisible, form]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisibleCapBon(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      // Extract value từ các TDSelect fields
      const extractValue = (field: any): string | number | undefined => {
        if (!field) return undefined;
        if (typeof field === 'object' && field.value !== undefined) {
          return field.value;
        }
        return field;
      };

      const formData: any = {
        ...(id && { id }),
        name: values.name,
        code: values.code,
        projectTypeId: extractValue(values.projectTypeId) as string | undefined,
        projectGroupId: extractValue(values.projectGroupId) as string | undefined,
        description: values.description,
        isActive: values.isActive,
        sortOrder: values.sortOrder,
      };

      if (id) {
        await updateProjectProcess(id, formData);
        toast.success('Cập nhật thành công!');
      } else {
        await createProjectProcess(formData);
        toast.success('Tạo mới thành công!');
      }
      dispatch(actionsGlobal.setRandom());
      handleCancel();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
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
          {dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} quy trình
        </Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form<IProjectProcess>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin quy trình" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Mã quy trình"
                  name="code"
                >
                  <Input placeholder="Mã quy trình" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Tên quy trình"
                  name="name"
                >
                  <Input placeholder="Tên quy trình" />
                </Form.Item>
              </div>
              {/* <div className="col-xl-6 col-lg-6">
                <Form.Item label="Loại dự án" name="projectTypeId">
                  <TDSelect
                    placeholder="Chọn loại dự án"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(
                        `categories/search`,
                        {
                          pageNumber: 1,
                          pageSize: 10000,
                          keyword: keyword,
                          categoryGroupCode: 'LOAI_DU_AN',
                        }
                      );
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                    allowClear
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Nhóm dự án" name="projectGroupId">
                  <TDSelect
                    placeholder="Chọn nhóm dự án"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(
                        `categories/search`,
                        {
                          pageNumber: 1,
                          pageSize: 10000,
                          keyword: keyword,
                          categoryGroupCode: 'NHOM_DU_AN',
                        }
                      );
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                    allowClear
                  />
                </Form.Item>
              </div> */}
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Thứ tự" name="sortOrder">
                  <InputNumber placeholder="Thứ tự" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea rows={4} placeholder="Mô tả quy trình" />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!dataModal?.readOnly && (
          <div className="d-flex justify-content-end align-items-center">
            <Button
              variant="secondary"
              className="btn-sm rounded-1 p-2 me-2"
              onClick={handleCancel}
            >
              <i className="fa fa-times me-2" />
              Đóng
            </Button>
            <Button
              variant="primary"
              className="btn-sm rounded-1 p-2"
              onClick={onFinish}
              disabled={buttonLoading}
            >
              {buttonLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fa fa-save me-2" />
                  Lưu
                </>
              )}
            </Button>
          </div>
        )}
        {dataModal?.readOnly && (
          <div className="d-flex justify-content-end align-items-center">
            <Button
              variant="secondary"
              className="btn-sm rounded-1 p-2"
              onClick={handleCancel}
            >
              <i className="fa fa-times me-2" />
              Đóng
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};
