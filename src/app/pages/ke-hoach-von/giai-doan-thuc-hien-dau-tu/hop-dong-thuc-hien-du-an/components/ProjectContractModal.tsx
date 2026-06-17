import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, InputNumber, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IProjectContract, ContractStatus, IProject, IContractor } from '@/models/ke-hoach-von';
import { HeaderTitle, TDSelect, FileUpload } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { handleFiles, handleImage } from '@/utils/utils';
import { API_URL } from '@/utils/baseAPI';
import {
  getProjectContractById,
  createProjectContract,
  updateProjectContract,
} from '@/services/projectContract.service';
import { searchProjects } from '@/services/project.service';
import { searchContractors } from '@/services/contractor.service';

type ProjectContractWithUiFlags = IProjectContract & {
  readOnly?: boolean;
};

type ProjectContractFormValues = Omit<
  IProjectContract,
  'contractDate' | 'startDate' | 'expectedEndDate' | 'actualEndDate'
> & {
  contractDate?: Dayjs;
  startDate?: Dayjs;
  expectedEndDate?: Dayjs;
  actualEndDate?: Dayjs;
};

export const ProjectContractModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModalCapHai
  ) as ProjectContractWithUiFlags | null;
  const modalVisible = useSelector(
    (state: RootState) => state.modal.modalVisibleCapHai
  );
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ProjectContractFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [attachments, setAttachments] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      // comment: load dữ liệu hợp đồng khi mở modal
      try {
        setIsLoading(true);
        if (id) {
          const contract = await getProjectContractById(id);
          if (contract) {
            const {
              contractDate,
              startDate,
              expectedEndDate,
              actualEndDate,
              ...restData
            } = contract;

            const formValues: any = {
              ...restData,
              contractDate: contractDate ? dayjs(contractDate) : undefined,
              startDate: startDate ? dayjs(startDate) : undefined,
              expectedEndDate: expectedEndDate ? dayjs(expectedEndDate) : undefined,
              actualEndDate: actualEndDate ? dayjs(actualEndDate) : undefined,
            };

            // set project
            if (contract.projectId) {
              const projectRes = await searchProjects({
                pageNumber: 1,
                pageSize: 10000,
                keyword: '',
              });
              const project = projectRes.data?.find(
                (p: IProject) => p.id === contract.projectId
              );
              if (project) {
                formValues.projectId = {
                  label: `${project.code || ''} - ${project.name || ''}`,
                  value: project.id,
                };
              }
            }

            // set contractor
            if (contract.contractorId) {
              const contractorRes = await searchContractors({
                pageNumber: 1,
                pageSize: 10000,
                keyword: '',
              });
              const contractor = contractorRes.data?.find(
                (c: IContractor) => c.id === contract.contractorId
              );
              if (contractor) {
                formValues.contractorId = {
                  label: `${contractor.code || ''} - ${contractor.name || ''}`,
                  value: contractor.id,
                };
              }
            }

            form.setFieldsValue(formValues);

            // set danh sách file đính kèm từ chuỗi attachments
            setAttachments(handleImage(contract.attachments ?? ''));
          }
        } else {
          form.resetFields();
          setAttachments([]);
        }
      } catch (error) {
        console.error('Error fetching contract data:', error);
        toast.error('Không thể tải dữ liệu hợp đồng. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    if (modalVisible) {
      fetchData();
    }
  }, [id, modalVisible, form]);

  const handleCancel = (): void => {
    // comment: đóng modal hợp đồng
    form.resetFields();
    setAttachments([]);
    dispatch(actionsModal.setModalVisibleCapHai(false));
  };

  const onFinish = async (): Promise<void> => {
    // comment: lưu thông tin hợp đồng
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

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
        contractorId: extractValue(values.contractorId),
        contractNumber: values.contractNumber,
        contractDate: values.contractDate
          ? (values.contractDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        startDate: values.startDate
          ? (values.startDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        expectedEndDate: values.expectedEndDate
          ? (values.expectedEndDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        actualEndDate: values.actualEndDate
          ? (values.actualEndDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        contractValue: values.contractValue,
        content: values.content,
        attachments: handleFiles(attachments ?? []).join('##'),
        status: values.status,
        note: values.note,
      };

      if (id) {
        await updateProjectContract(id, formData);
        toast.success('Cập nhật hợp đồng thành công!');
      } else {
        await createProjectContract(formData);
        toast.success('Tạo mới hợp đồng thành công!');
      }
      dispatch(actionsGlobal.setRandom());
      handleCancel();
    } catch (errorInfo) {
      console.error('Failed to submit contract:', errorInfo);
      toast.error('Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin!');
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
          {dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} hợp đồng thực hiện dự án
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
          <Form<ProjectContractFormValues>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin chung" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Dự án"
                  name="projectId"
                  rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <TDSelect
                    placeholder="Chọn dự án"
                    fetchOptions={async (keyword) => {
                      const res = await searchProjects({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.map((item: IProject) => ({
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
                <Form.Item label="Nhà thầu" name="contractorId">
                  <TDSelect
                    placeholder="Chọn nhà thầu"
                    fetchOptions={async (keyword) => {
                      const res = await searchContractors({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.map((item: IContractor) => ({
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
                <Form.Item label="Số hợp đồng" name="contractNumber">
                  <Input placeholder="Nhập số hợp đồng" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày ký hợp đồng" name="contractDate">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày bắt đầu" name="startDate">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày kết thúc dự kiến" name="expectedEndDate">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày kết thúc thực tế" name="actualEndDate">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Giá trị hợp đồng" name="contractValue">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                    }
                    parser={(value: any) => value.replace(/\./g, '')}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Trạng thái"
                  name="status"
                >
                  <Select
                    placeholder="Chọn trạng thái"
                    style={{ width: '100%' }}
                  >
                    <Select.Option value={ContractStatus.Draft}>Nháp</Select.Option>
                    <Select.Option value={ContractStatus.Signed}>Đã ký</Select.Option>
                    <Select.Option value={ContractStatus.Executing}>
                      Đang thực hiện
                    </Select.Option>
                    <Select.Option value={ContractStatus.Completed}>
                      Đã hoàn thành
                    </Select.Option>
                    <Select.Option value={ContractStatus.Terminated}>
                      Đã chấm dứt
                    </Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nội dung hợp đồng" name="content">
                  <Input.TextArea
                    rows={4}
                    placeholder="Nhập nội dung chính của hợp đồng"
                  />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Đính kèm file">
                  <FileUpload
                    fileList={attachments}
                    onChange={(e) => setAttachments(e.fileList)}
                    multiple={true}
                    URL={`${API_URL}/api/v1/attachments/public`}
                    isUseAliyunOSS
                  />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={3} placeholder="Ghi chú" />
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
                  {id ? 'Lưu' : 'Tạo mới'}
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

