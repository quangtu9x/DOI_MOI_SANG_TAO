import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, Spin, Select } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IProjectProcessExecution } from '@/models/ke-hoach-von';
import { HeaderTitle, TDSelect } from '@/app/components';
import { SearchData } from '@/types';
import { ProjectProcessStepExecutionFilterSection } from './ProjectProcessStepExecutionFilterSection';
import { ProjectProcessStepExecutionTable } from './ProjectProcessStepExecutionTable';
import {
  createProjectProcessExecution,
  updateProjectProcessExecution,
  getProjectProcessExecutionById,
  applyProjectProcessExecution,
  inheritProjectProcessExecution,
} from '@/services/projectProcessExecution.service';
import { searchProjects } from '@/services/project.service';
import { searchProjectProcesses } from '@/services/projectProcess.service';

type ProjectProcessExecutionWithUiFlags = IProjectProcessExecution & {
  mode?: 'manual' | 'apply' | 'inherit';
};

type ProjectProcessExecutionFormValues = Omit<
  ProjectProcessExecutionWithUiFlags,
  'startDate' | 'expectedEndDate' | 'actualEndDate'
> & {
  startDate?: Dayjs;
  expectedEndDate?: Dayjs;
  actualEndDate?: Dayjs;
};

export const ProjectProcessExecutionDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModalCapHai
    // mở rộng kiểu để chứa mode phục vụ UI (manual/apply/inherit)
  ) as ProjectProcessExecutionWithUiFlags | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleCapHai);
  const id = dataModal?.id ?? null;
  const isReadOnly = dataModal?.readOnly ?? false;
  const isCreateMode = !id;

  const [form] = Form.useForm<ProjectProcessExecutionFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [mode, setMode] = useState<'manual' | 'apply' | 'inherit'>(
    (dataModal?.mode as 'manual' | 'apply' | 'inherit') || 'manual'
  );
  const [stepSearchData, setStepSearchData] = useState<SearchData | undefined>(undefined);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        if (id) {
          const _data = await getProjectProcessExecutionById(id);
          if (_data) {
            const { startDate, expectedEndDate, actualEndDate, ...restData } = _data;

            const formValues: any = {
              ...restData,
              startDate: startDate ? dayjs(startDate) : undefined,
              expectedEndDate: expectedEndDate ? dayjs(expectedEndDate) : undefined,
              actualEndDate: actualEndDate ? dayjs(actualEndDate) : undefined,
            };

            // Fetch projectId
            if (_data.projectId) {
              const projectRes = await searchProjects({
                pageNumber: 1,
                pageSize: 10000,
              });
              const project = projectRes.data?.find(p => p.id === _data.projectId);
              if (project) {
                formValues.projectId = { label: `${project.code || ''} - ${project.name || ''}`, value: project.id };
              }
            }

            // Fetch projectProcessId
            if (_data.projectProcessId) {
              const processRes = await searchProjectProcesses({
                pageNumber: 1,
                pageSize: 10000,
              });
              const process = processRes.data?.find(p => p.id === _data.projectProcessId);
              if (process) {
                formValues.projectProcessId = { label: process.name, value: process.id };
              }
            }

            // Fetch sourceProjectId
            if (_data.sourceProjectId) {
              const sourceProjectRes = await searchProjects({
                pageNumber: 1,
                pageSize: 10000,
              });
              const sourceProject = sourceProjectRes.data?.find(p => p.id === _data.sourceProjectId);
              if (sourceProject) {
                formValues.sourceProjectId = {
                  label: `${sourceProject.code || ''} - ${sourceProject.name || ''}`,
                  value: sourceProject.id,
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

  useEffect(() => {
    setMode((dataModal?.mode as 'manual' | 'apply' | 'inherit') || 'manual');
  }, [dataModal]);

  useEffect(() => {
    if (id) {
      setStepSearchData(prev => ({
        ...prev,
        projectProcessExecutionId: id,
      }));
    }
  }, [id]);

  useEffect(() => {
    form.setFieldsValue({ mode });
  }, [mode, form]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisibleCapHai(false));
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
        projectId: extractValue(values.projectId) as string,
        projectProcessId: extractValue(values.projectProcessId) as string,
        sourceProjectId: extractValue(values.sourceProjectId) as string | undefined,
        startDate: values.startDate ? (values.startDate as Dayjs).format('YYYY-MM-DD') : undefined,
        expectedEndDate: values.expectedEndDate
          ? (values.expectedEndDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        actualEndDate: values.actualEndDate
          ? (values.actualEndDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        isCompleted: values.isCompleted,
        note: values.note,
      };

      if (id) {
        await updateProjectProcessExecution(id, formData);
        toast.success('Cập nhật thành công!');
      } else if (mode === 'apply') {
        await applyProjectProcessExecution({
          projectId: formData.projectId,
          projectProcessId: formData.projectProcessId,
          startDate: formData.startDate,
          expectedEndDate: formData.expectedEndDate,
          note: formData.note,
        });
        toast.success('Áp dụng quy trình thành công!');
      } else if (mode === 'inherit') {
        await inheritProjectProcessExecution({
          projectId: formData.projectId,
          sourceProjectId: formData.sourceProjectId,
          startDate: formData.startDate,
          expectedEndDate: formData.expectedEndDate,
          note: formData.note,
        });
        toast.success('Kế thừa quy trình thành công!');
      } else {
        await createProjectProcessExecution(formData);
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

  const handleStepFilterChange = (field: string, value: any): void => {
    setStepSearchData(prev => ({
      ...prev,
      [field]: value,
    }));
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
          {isReadOnly
            ? 'Chi tiết'
            : isCreateMode
            ? mode === 'apply'
              ? 'Áp dụng quy trình'
              : mode === 'inherit'
              ? 'Kế thừa quy trình'
              : 'Tạo mới áp dụng quy trình'
            : 'Chỉnh sửa áp dụng quy trình'}
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
          <Form<ProjectProcessExecutionFormValues>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={isReadOnly}
          >
            <HeaderTitle title="Thông tin áp dụng quy trình" />
            <div className="row">
              {isCreateMode && (
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Hình thức" name="mode">
                    <Select
                      value={mode}
                      onChange={value => setMode(value as 'manual' | 'apply' | 'inherit')}
                      disabled={!isCreateMode}
                    >
                      <Select.Option value="apply">Áp dụng quy trình mẫu</Select.Option>
                      <Select.Option value="inherit">Kế thừa từ dự án khác</Select.Option>
                      <Select.Option value="manual">Tạo thủ công</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              )}
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Dự án"
                  name="projectId"
                  rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <TDSelect
                    placeholder="Chọn dự án"
                    fetchOptions={async keyword => {
                      const res = await searchProjects({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.map(item => ({
                          ...item,
                          label: `${item.code || ''} - ${item.name || ''}`,
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
                  label="Quy trình"
                  name="projectProcessId"
                  rules={
                    mode === 'inherit'
                      ? []
                      : [
                          {
                            required: true,
                            message: 'Không được để trống!',
                          },
                        ]
                  }
                >
                  <TDSelect
                    placeholder="Chọn quy trình"
                    disabled={mode === 'inherit'}
                    fetchOptions={async keyword => {
                      const res = await searchProjectProcesses({
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
                  label="Dự án nguồn (kế thừa)"
                  name="sourceProjectId"
                  rules={
                    mode === 'inherit'
                      ? [{ required: true, message: 'Chọn dự án nguồn để kế thừa!' }]
                      : []
                  }
                >
                  <TDSelect
                    placeholder="Chọn dự án nguồn để kế thừa quy trình"
                    disabled={mode !== 'inherit'}
                    fetchOptions={async keyword => {
                      const res = await searchProjects({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.map(item => ({
                          ...item,
                          label: `${item.code || ''} - ${item.name || ''}`,
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
                <Form.Item label="Ngày bắt đầu" name="startDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày kết thúc dự kiến" name="expectedEndDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày kết thúc thực tế" name="actualEndDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={4} placeholder="Ghi chú" />
                </Form.Item>
              </div>
            </div>
          </Form>

          {id && (
            <>
              <HeaderTitle title="Danh sách bước thực hiện" />
              <ProjectProcessStepExecutionTable searchData={stepSearchData} />
            </>
          )}
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
