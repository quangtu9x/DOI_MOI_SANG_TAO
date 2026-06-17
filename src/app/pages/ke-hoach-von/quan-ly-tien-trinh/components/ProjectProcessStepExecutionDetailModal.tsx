import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, Select, Switch, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse } from '@/models';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IProjectProcessStepExecution, WorkItemStatus } from '@/models/ke-hoach-von';
import { HeaderTitle, TDSelect } from '@/app/components';
import {
  createProjectProcessStepExecution,
  updateProjectProcessStepExecution,
  getProjectProcessStepExecutionById,
  assignProjectProcessStepExecution,
} from '@/services/projectProcessStepExecution.service';
import { searchProjectProcessExecutions } from '@/services/projectProcessExecution.service';
import { searchProjectProcessSteps } from '@/services/projectProcessStep.service';

type ProjectProcessStepExecutionWithUiFlags = IProjectProcessStepExecution & {
  assignMode?: boolean;
};

type ProjectProcessStepExecutionFormValues = Omit<
  IProjectProcessStepExecution,
  'startDate' | 'expectedEndDate' | 'actualEndDate' | 'assignedDate'
> & {
  startDate?: Dayjs;
  expectedEndDate?: Dayjs;
  actualEndDate?: Dayjs;
  assignedDate?: Dayjs;
};

export const ProjectProcessStepExecutionDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModalCapBa
    // thêm kiểu mở rộng để chứa cờ UI như assignMode, readOnly
  ) as ProjectProcessStepExecutionWithUiFlags | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleCapBa);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ProjectProcessStepExecutionFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const isAssignMode = !!dataModal?.assignMode;

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        if (id) {
          const _data = await getProjectProcessStepExecutionById(id);
          if (_data) {
            const {
              startDate,
              expectedEndDate,
              actualEndDate,
              assignedDate,
              ...restData
            } = _data;

            const formValues: any = {
              ...restData,
              startDate: startDate ? dayjs(startDate) : undefined,
              expectedEndDate: expectedEndDate ? dayjs(expectedEndDate) : undefined,
              actualEndDate: actualEndDate ? dayjs(actualEndDate) : undefined,
              assignedDate: assignedDate ? dayjs(assignedDate) : undefined,
            };

            // Fetch projectProcessExecutionId
            if (_data.projectProcessExecutionId) {
              const executionRes = await searchProjectProcessExecutions({
                pageNumber: 1,
                pageSize: 10000,
              });
              const execution = executionRes.data?.find(e => e.id === _data.projectProcessExecutionId);
              if (execution) {
                formValues.projectProcessExecutionId = {
                  label: `${execution.projectName || ''} - ${execution.projectProcessName || ''}`,
                  value: execution.id,
                };
              }
            }

            // Fetch projectProcessStepId
            if (_data.projectProcessStepId) {
              const stepRes = await searchProjectProcessSteps({
                pageNumber: 1,
                pageSize: 10000,
              });
              const step = stepRes.data?.find(s => s.id === _data.projectProcessStepId);
              if (step) {
                formValues.projectProcessStepId = { label: step.name, value: step.id };
              }
            }

            if (_data.assignedUserId) {
              const userRes = await requestPOST<IPaginationResponse<any[]>>('users/search', {
                pageNumber: 1,
                pageSize: 10000,
              }, 'neutral');
              const user = userRes.data?.data?.find(u => u.id === _data.assignedUserId);
              if (user) {
                formValues.assignedUserId = {
                  label: `${user.userName || ''} - ${user.fullName || ''}`,
                  value: user.id,
                };
              }
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
    dispatch(actionsModal.setModalVisibleCapBa(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      // Extract value từ các TDSelect fields
      const extractValue = (field: any): string | undefined => {
        if (!field) return undefined;
        if (typeof field === 'object' && field.value !== undefined) {
          return field.value;
        }
        return field;
      };

      const formData: any = {
        ...(id && { id }),
        projectProcessExecutionId: extractValue(values.projectProcessExecutionId) as string,
        projectProcessStepId: extractValue(values.projectProcessStepId) as string,
        assignedUserId: extractValue(values.assignedUserId) as string | undefined,
        assignedBy: extractValue(values.assignedBy) as string | undefined,
        assignedDate: values.assignedDate
          ? (values.assignedDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        startDate: values.startDate ? (values.startDate as Dayjs).format('YYYY-MM-DD') : undefined,
        expectedEndDate: values.expectedEndDate
          ? (values.expectedEndDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        actualEndDate: values.actualEndDate
          ? (values.actualEndDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        status: values.status,
        note: values.note,
        result: values.result,
        isCompleted: values.isCompleted,
      };

      if (isAssignMode && id) {
        await assignProjectProcessStepExecution(id, {
          id,
          assignedUserId: formData.assignedUserId,
          assignedDate: formData.assignedDate,
          note: formData.note,
        });
        toast.success('Phân công thành công!');
      } else if (id) {
        await updateProjectProcessStepExecution(id, formData);
        toast.success('Cập nhật thành công!');
      } else {
        await createProjectProcessStepExecution(formData);
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
          {dataModal?.readOnly
            ? 'Chi tiết'
            : isAssignMode
            ? 'Phân công cán bộ'
            : id
            ? 'Chỉnh sửa'
            : 'Tạo mới'}{' '}
          thực hiện bước
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
          <Form<ProjectProcessStepExecutionFormValues>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle
              title={isAssignMode ? 'Phân công cán bộ thực hiện bước' : 'Thông tin thực hiện bước'}
            />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Áp dụng quy trình"
                  name="projectProcessExecutionId"
                  rules={isAssignMode ? [] : [{ required: true, message: 'Không được để trống!' }]}
                >
                  <TDSelect
                    placeholder="Chọn áp dụng quy trình"
                    disabled={isAssignMode}
                    fetchOptions={async keyword => {
                      const res = await searchProjectProcessExecutions({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.map(item => ({
                          ...item,
                          label: `${item.projectName || ''} - ${item.projectProcessName || ''}`,
                          value: item.id,
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
                <Form.Item
                  label="Bước quy trình"
                  name="projectProcessStepId"
                  rules={isAssignMode ? [] : [{ required: true, message: 'Không được để trống!' }]}
                >
                  <TDSelect
                    placeholder="Chọn bước quy trình"
                    disabled={isAssignMode}
                    fetchOptions={async keyword => {
                      const res = await searchProjectProcessSteps({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.map(item => ({
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
                <Form.Item
                  label="Người được phân công"
                  name="assignedUserId"
                  rules={isAssignMode ? [{ required: true, message: 'Chọn người được phân công' }] : []}
                >
                  <TDSelect
                    placeholder="Chọn người được phân công"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>('users/search', {
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      }, 'neutral');
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: `${item.userName || ''} - ${item.fullName || ''}`,
                          value: item.id,
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
                <Form.Item label="Ngày phân công" name="assignedDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày bắt đầu" name="startDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={isAssignMode} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày kết thúc dự kiến" name="expectedEndDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={isAssignMode} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày kết thúc thực tế" name="actualEndDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={isAssignMode} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Trạng thái" name="status">
                  <Select placeholder="Chọn trạng thái" style={{ width: '100%' }} disabled={isAssignMode}>
                    <Select.Option value={WorkItemStatus.Pending}>Chờ xử lý</Select.Option>
                    <Select.Option value={WorkItemStatus.InProgress}>Đang xử lý</Select.Option>
                    <Select.Option value={WorkItemStatus.Completed}>Hoàn thành</Select.Option>
                    <Select.Option value={WorkItemStatus.Cancelled}>Hủy bỏ</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Hoàn thành" name="isCompleted" valuePropName="checked">
                  <Switch checkedChildren="Có" unCheckedChildren="Chưa" disabled={isAssignMode} />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Kết quả" name="result">
                  <Input.TextArea rows={3} placeholder="Kết quả thực hiện" disabled={isAssignMode} />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={4} placeholder="Ghi chú" />
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
