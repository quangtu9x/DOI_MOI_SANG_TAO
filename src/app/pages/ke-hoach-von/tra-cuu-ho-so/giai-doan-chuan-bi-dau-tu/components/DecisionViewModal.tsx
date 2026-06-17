import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, Select, Switch, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import { API_URL } from '@/utils/baseAPI';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IProjectDecision, DecisionType } from '@/models';
import { HeaderTitle, TDSelect } from '@/app/components';
import FileUpload from '@/app/components/file-upload';
import { getProjectDecisionById } from '@/services/projectDecision.service';
import { searchProjects } from '@/services/project.service';

type ProjectDecisionWithUiFlags = IProjectDecision & {
  readOnly?: boolean;
};

type ProjectDecisionFormValues = Omit<IProjectDecision, 'decisionDate' | 'approvedDate'> & {
  decisionDate?: Dayjs;
  approvedDate?: Dayjs;
};

export const DecisionViewModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModalViewDecision
  ) as ProjectDecisionWithUiFlags | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleViewDecision);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ProjectDecisionFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        if (id) {
          const decision = await getProjectDecisionById(id);
          if (decision) {
            const { decisionDate, approvedDate, ...restData } = decision;

            const formValues: any = {
              ...restData,
              decisionDate: decisionDate ? dayjs(decisionDate) : undefined,
              approvedDate: approvedDate ? dayjs(approvedDate) : undefined,
            };

            // Set project
            if (decision.projectId) {
              const projectRes = await searchProjects({
                pageNumber: 1,
                pageSize: 10000,
                keyword: '',
              });
              const project = projectRes.data?.find(p => p.id === decision.projectId);
              if (project) {
                formValues.projectId = {
                  label: `${project.code || ''} - ${project.name || ''}`,
                  value: project.id,
                };
              }
            }

            form.setFieldsValue(formValues);

            // Load file list
            if (decision.attachmentList && decision.attachmentList.length > 0) {
              setFileList(
                decision.attachmentList.map((url: string) => ({
                  uid: url,
                  name: url.split('/').pop() || 'file',
                  status: 'done',
                  url: url,
                }))
              );
            } else {
              setFileList([]);
            }
          }
        } else {
          form.resetFields();
          setFileList([]);
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
    setFileList([]);
    dispatch(actionsModal.setModalVisibleViewDecision(false));
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
        <Modal.Title className="text-white">Chi tiết quyết định</Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form<ProjectDecisionFormValues>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={true}
          >
            <HeaderTitle title="Thông tin quyết định" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Dự án" name="projectId">
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
                    disabled
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Loại quyết định" name="type">
                  <Select placeholder="Chọn loại quyết định" style={{ width: '100%' }} disabled>
                    <Select.Option value={DecisionType.InvestmentPolicy}>
                      Quyết định chủ trương đầu tư
                    </Select.Option>
                    <Select.Option value={DecisionType.InvestmentDecision}>Quyết định đầu tư</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Số quyết định" name="decisionNumber">
                  <Input placeholder="Số quyết định" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày quyết định" name="decisionDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Người/Đơn vị ra quyết định" name="decisionMaker">
                  <Input placeholder="Người/Đơn vị ra quyết định" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Đã phê duyệt" name="isApproved" valuePropName="checked">
                  <Switch checkedChildren="Có" unCheckedChildren="Chưa" disabled />
                </Form.Item>
              </div>
              {form.getFieldValue('isApproved') && (
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Ngày phê duyệt" name="approvedDate">
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
                  </Form.Item>
                </div>
              )}
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nội dung quyết định" name="content">
                  <Input.TextArea rows={4} placeholder="Nội dung quyết định" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Đính kèm file">
                  <FileUpload
                    accept={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png']}
                    multiple={true}
                    URL={`${API_URL}/api/v1/attachments/public`}
                    maxCount={10}
                    fileList={fileList}
                    onChange={() => {}}
                    isUseAliyunOSS
                    disabled={true}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={3} placeholder="Ghi chú" disabled />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-end align-items-center">
          <Button variant="secondary" className="btn-sm rounded-1 p-2" onClick={handleCancel}>
            <i className="fa fa-times me-2" />
            Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
