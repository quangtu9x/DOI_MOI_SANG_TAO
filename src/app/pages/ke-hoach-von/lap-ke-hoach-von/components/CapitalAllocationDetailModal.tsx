import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, InputNumber, Spin, DatePicker, Select } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IPaginationResponse, IResult } from '@/models/response';
import {
  ICapitalAllocation,
  CapitalAllocationType,
  IAnnualCapitalPlan,
  ICreateCapitalAllocationRequest,
  IUpdateCapitalAllocationRequest,
} from '@/models/ke-hoach-von';

import { handleFiles, handleImage } from '@/utils/utils';
import { requestGET, requestPOST, requestPUT, API_URL } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import {
  getCapitalAllocationById,
} from '@/services/capitalAllocation.service';
import { searchAnnualCapitalPlans } from '@/services/annualCapitalPlan.service';

export const CapitalAllocationDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as ICapitalAllocation | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ICapitalAllocation>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<TDUploadFile[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<IAnnualCapitalPlan | null>(null);

  /**
   * Load dữ liệu khi mở modal ở chế độ edit hoặc view
   */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      if (!id) {
        form.resetFields();
        setAttachments([]);
        setSelectedPlan(null);
        form.setFieldsValue({
          allocationType: CapitalAllocationType.Initial,
          allocationDate: dayjs(),
        } as any);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getCapitalAllocationById(id);
        if (response) {
          setAttachments(handleImage(response?.attachments ?? ''));

          // Load thông tin kế hoạch vốn và dự án để hiển thị tên
          let annualCapitalPlanValue: any = null;
          let projectValue: any = null;

          if (response.annualCapitalPlanId) {
            try {
              const planResponse = await requestGET<IResult<IAnnualCapitalPlan>>(
                `annualcapitalplans/${response.annualCapitalPlanId}`
              );
              if (planResponse?.data?.data) {
                setSelectedPlan(planResponse.data.data);
                annualCapitalPlanValue = {
                  value: planResponse.data.data.id!,
                  label: `${planResponse.data.data.code || ''} - ${planResponse.data.data.name || ''}`,
                };
              }
            } catch (error) {
              // Silent fail
            }
          }

          if (response.projectId) {
            try {
              const projectResponse = await requestGET<IResult<any>>(`projects/${response.projectId}`);
              if (projectResponse?.data?.data) {
                projectValue = {
                  value: projectResponse.data.data.id,
                  label: `${projectResponse.data.data.code || ''} - ${projectResponse.data.data.name || ''}`,
                };
              }
            } catch (error) {
              // Silent fail
            }
          }

          const formValues = {
            ...response,
            annualCapitalPlanId: annualCapitalPlanValue as any,
            projectId: projectValue as any,
            allocationDate: response.allocationDate ? dayjs(response.allocationDate) : dayjs(),
          };
          form.setFieldsValue(formValues as any);
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, form]);

  /**
   * Xử lý khi thay đổi kế hoạch vốn
   */
  const handlePlanChange = useCallback(async (planId: string | { value: string } | null): Promise<void> => {
    const planIdValue: string | null =
      typeof planId === 'object' && planId?.value ? planId.value : typeof planId === 'string' ? planId : null;

    if (planIdValue) {
      try {
        const planResponse = await requestGET<IResult<IAnnualCapitalPlan>>(`annualcapitalplans/${planIdValue}`);
        if (planResponse?.data?.data) {
          setSelectedPlan(planResponse.data.data);
        }
      } catch (error) {
        // Silent fail
      }
    } else {
      setSelectedPlan(null);
    }
  }, []);

  /**
   * Xử lý khi thay đổi số tiền phân bổ - validate với vốn còn lại
   */
  const handleAmountChange = useCallback((value: number | null): void => {
    if (value && selectedPlan && value > (selectedPlan.remainingCapital || 0)) {
      form.setFields([
        {
          name: 'allocatedAmount',
          errors: ['Số tiền phân bổ không được vượt quá vốn còn lại!'],
        },
      ]);
    } else {
      form.setFields([
        {
          name: 'allocatedAmount',
          errors: [],
        },
      ]);
    }
  }, [form, selectedPlan]);

  /**
   * Xử lý đóng modal
   */
  const handleCancel = (): void => {
    form.resetFields();
    setAttachments([]);
    setSelectedPlan(null);
    dispatch(actionsModal.setModalVisible(false));
  };

  /**
   * Xử lý submit form
   */
  const onFinish = async (): Promise<void> => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const formData: ICreateCapitalAllocationRequest | IUpdateCapitalAllocationRequest = {
        ...(id && { id }),
        annualCapitalPlanId: values.annualCapitalPlanId?.value || values.annualCapitalPlanId,
        projectId: values.projectId?.value || values.projectId,
        allocatedAmount: values.allocatedAmount,
        allocationType: values.allocationType,
        allocationDate: values.allocationDate
          ? dayjs(values.allocationDate).format('YYYY-MM-DDTHH:mm:ss')
          : dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        note: values.note,
        attachments: handleFiles(attachments ?? []).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`capitalallocations/${id}`, formData)
        : await requestPOST<IResult<string>>(`capitalallocations`, formData);

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
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} phân bổ vốn</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form<ICapitalAllocation>
            form={form}
            layout="vertical"
            autoComplete="off"
            initialValues={{
              allocationType: CapitalAllocationType.Initial,
              allocationDate: dayjs(),
            }}
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin chung" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Kế hoạch vốn hàng năm"
                  name="annualCapitalPlanId"
                >
                  <TDSelect
                    placeholder="Chọn kế hoạch vốn hàng năm"
                    fetchOptions={async keyword => {
                      const res = await searchAnnualCapitalPlans({
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
                    onChange={handlePlanChange}
                  />
                </Form.Item>
              </div>
              {selectedPlan && (
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Vốn còn lại của kế hoạch">
                    <InputNumber
                      style={{ width: '100%' }}
                      value={selectedPlan.remainingCapital}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      readOnly
                      className="text-end"
                    />
                  </Form.Item>
                </div>
              )}
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Dự án"
                  name="projectId"
                >
                  <TDSelect
                    placeholder="Chọn dự án"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(`projects/search`, {
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: `${item.code || ''} - ${item.name || ''}`,
                          value: item.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Số tiền phân bổ (VNĐ)"
                  name="allocatedAmount"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => (value?.replace(/\$\s?|(,*)/g, '') || '') as any}
                    placeholder="Số tiền phân bổ"
                    min={0}
                    onChange={handleAmountChange}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Loại phân bổ"
                  name="allocationType"
                >
                  <Select
                    placeholder="Chọn loại phân bổ"
                    options={[
                      { label: 'Phân bổ ban đầu', value: CapitalAllocationType.Initial },
                      { label: 'Điều chỉnh', value: CapitalAllocationType.Adjustment },
                      { label: 'Bổ sung', value: CapitalAllocationType.Supplement },
                    ]}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Ngày phân bổ"
                  name="allocationDate"
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={4} placeholder="Ghi chú" />
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
