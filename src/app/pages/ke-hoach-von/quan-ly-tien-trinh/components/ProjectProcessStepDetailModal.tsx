import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, InputNumber, Switch, Spin, Select } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IProjectProcessStep, StepType } from '@/models/ke-hoach-von';
import { HeaderTitle, TDSelect } from '@/app/components';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse } from '@/models';
import {
  createProjectProcessStep,
  updateProjectProcessStep,
  getProjectProcessStepById,
  searchProjectProcessSteps,
} from '@/services/projectProcessStep.service';
import { searchProjectProcesses } from '@/services/projectProcess.service';

const stepTypeOptions = [
  { label: 'Báo cáo nghiên cứu tiền khả thi dự án', value: StepType.PreFeasibilityReport },
  { label: 'Báo cáo đề xuất chủ trương đầu tư dự án', value: StepType.InvestmentPolicyProposal },
  { label: 'Quyết định chủ trương đầu tư dự án', value: StepType.InvestmentPolicyDecision },
  { label: 'Nhiệm vụ khảo sát', value: StepType.SurveyTask },
  { label: 'Báo cáo nghiên cứu khả thi dự án', value: StepType.FeasibilityReport },
  { label: 'Hồ sơ thiết kế cơ sở - Lập hồ sơ', value: StepType.BasicDesignPreparation },
  { label: 'Hồ sơ thiết kế cơ sở - Thẩm định', value: StepType.BasicDesignAppraisal },
  { label: 'Báo cáo kinh tế kỹ thuật', value: StepType.TechnicalEconomicReport },
  { label: 'Quyết định đầu tư dự án', value: StepType.InvestmentDecision },
  { label: 'Hồ sơ thiết kế chi tiết và dự toán - Lập hồ sơ', value: StepType.DetailedDesignPreparation },
  { label: 'Hồ sơ thiết kế chi tiết và dự toán - Thẩm định', value: StepType.DetailedDesignAppraisal },
  { label: 'Đấu thầu, lựa chọn nhà thầu', value: StepType.BiddingContractorSelection },
  { label: 'Kiểm thử sản phẩm', value: StepType.ProductTesting },
  { label: 'Vận hành thử sản phẩm', value: StepType.TrialOperation },
  { label: 'Nghiệm thu, bàn giao sản phẩm', value: StepType.AcceptanceHandover },
  { label: 'Thanh toán, quyết toán dự án', value: StepType.PaymentSettlement },
  { label: 'Giám sát, đánh giá sau đầu tư', value: StepType.PostInvestmentMonitoring },
];

export const ProjectProcessStepDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModalCapMot
  ) as IProjectProcessStep | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleCapMot);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IProjectProcessStep>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        if (id) {
          const _data = await getProjectProcessStepById(id);
          if (_data) {
            const formValues: any = {
              ..._data,
            };

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

            // Fetch nextStepId và previousStepId nếu có
            if (_data.nextStepId || _data.previousStepId) {
              const stepRes = await searchProjectProcessSteps({
                pageNumber: 1,
                pageSize: 10000,
                projectProcessId: _data.projectProcessId,
              });
              if (_data.nextStepId) {
                const nextStep = stepRes.data?.find(s => s.id === _data.nextStepId);
                if (nextStep) {
                  formValues.nextStepId = { label: nextStep.name, value: nextStep.id };
                }
              }
              if (_data.previousStepId) {
                const prevStep = stepRes.data?.find(s => s.id === _data.previousStepId);
                if (prevStep) {
                  formValues.previousStepId = { label: prevStep.name, value: prevStep.id };
                }
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
    dispatch(actionsModal.setModalVisibleCapMot(false));
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
        projectProcessId: extractValue(values.projectProcessId) as string,
        name: values.name,
        code: values.code,
        description: values.description,
        stepOrder: values.stepOrder,
        nextStepId: extractValue(values.nextStepId) as string | undefined,
        previousStepId: extractValue(values.previousStepId) as string | undefined,
        isRequired: values.isRequired,
        canSkip: values.canSkip,
        estimatedDays: values.estimatedDays,
        requiredDocuments: values.requiredDocuments,
        responsibleRole: values.responsibleRole,
        isActive: values.isActive,
        stepType: values.stepType,
      };

      if (id) {
        await updateProjectProcessStep(id, formData);
        toast.success('Cập nhật thành công!');
      } else {
        await createProjectProcessStep(formData);
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
          {dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} bước quy trình
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
          <Form<IProjectProcessStep>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin bước quy trình" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Quy trình"
                  name="projectProcessId"
                // rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <TDSelect
                    placeholder="Chọn quy trình"
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
                  label="Mã bước"
                  name="code"
                >
                  <Input placeholder="Mã bước" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Tên bước"
                  name="name"
                  rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <Input placeholder="Tên bước" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Thứ tự" name="stepOrder">
                  <InputNumber placeholder="Thứ tự" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Bước tiếp theo" name="nextStepId">
                  <TDSelect
                    placeholder="Chọn bước tiếp theo"
                    fetchOptions={async keyword => {
                      const processId = form.getFieldValue('projectProcessId');
                      if (!processId) return [];
                      const processIdValue =
                        typeof processId === 'object' ? processId.value : processId;
                      const res = await searchProjectProcessSteps({
                        pageNumber: 1,
                        pageSize: 10000,
                        projectProcessId: processIdValue,
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
                <Form.Item label="Bước trước đó" name="previousStepId">
                  <TDSelect
                    placeholder="Chọn bước trước đó"
                    fetchOptions={async keyword => {
                      const processId = form.getFieldValue('projectProcessId');
                      if (!processId) return [];
                      const processIdValue =
                        typeof processId === 'object' ? processId.value : processId;
                      const res = await searchProjectProcessSteps({
                        pageNumber: 1,
                        pageSize: 10000,
                        projectProcessId: processIdValue,
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
                <Form.Item label="Bắt buộc" name="isRequired" valuePropName="checked">
                  <Switch checkedChildren="Có" unCheckedChildren="Không" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Có thể bỏ qua" name="canSkip" valuePropName="checked">
                  <Switch checkedChildren="Có" unCheckedChildren="Không" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Số ngày dự kiến" name="estimatedDays">
                  <InputNumber placeholder="Số ngày" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Vai trò phụ trách" name="responsibleRole">
                  <Input placeholder="Vai trò phụ trách" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Loại bước thực hiện" name="stepType">
                  <Select placeholder="Chọn loại bước" allowClear>
                    {stepTypeOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Tài liệu yêu cầu" name="requiredDocuments">
                  <Input.TextArea rows={3} placeholder="Danh sách tài liệu yêu cầu" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea rows={4} placeholder="Mô tả bước quy trình" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
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
