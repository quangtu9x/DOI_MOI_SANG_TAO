import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, Select, Switch, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IProjectDecision, DecisionType } from '@/models';
import { HeaderTitle, TDSelect, FileUpload } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { handleFiles, handleImage } from '@/utils/utils';
import { requestPOST, requestPUT, API_URL } from '@/utils/baseAPI';
import { IResult } from '@/models/response';
import { getProjectDecisionById } from '@/services/projectDecision.service';
import { searchProjects } from '@/services/project.service';

type ProjectDecisionWithUiFlags = IProjectDecision & {
  readOnly?: boolean;
};

type ProjectDecisionFormValues = Omit<IProjectDecision, 'decisionDate' | 'approvedDate'> & {
  decisionDate?: Dayjs;
  approvedDate?: Dayjs;
};

export const QuyetDinhChuTruongDauTuModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModalCapBon
  ) as ProjectDecisionWithUiFlags | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleCapBon);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ProjectDecisionFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [attachments, setAttachments] = useState<TDUploadFile[]>([]);

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

            // Load file list từ attachments string
            setAttachments(handleImage(decision.attachments ?? ''));
          }
        } else {
          form.resetFields();
          setAttachments([]);
          // Set default type if provided
          if (dataModal?.type !== undefined) {
            form.setFieldsValue({ type: dataModal.type });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, form, dataModal?.type]);

  const handleCancel = () => {
    form.resetFields();
    setAttachments([]);
    dispatch(actionsModal.setModalVisibleCapBon(false));
  };

  const onFinish = async () => {
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

      const attachmentPaths = handleFiles(attachments ?? []);
      const attachmentString = attachmentPaths.join('##');

      const formData: any = {
        ...(id && { id }),
        projectId: extractValue(values.projectId) as string,
        type: values.type as DecisionType,
        decisionNumber: values.decisionNumber,
        decisionDate: values.decisionDate
          ? (values.decisionDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        decisionMaker: values.decisionMaker,
        content: values.content,
        attachments: attachmentString,
        isApproved: values.isApproved,
        approvedDate: values.approvedDate
          ? (values.approvedDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        note: values.note,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`projectdecisions/${id}`, formData)
        : await requestPOST<IResult<string>>(`projectdecisions`, formData);
      if (response?.data?.succeeded) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo: any) {
      const errorMessage =
        errorInfo?.response?.data?.message || errorInfo?.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
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
        <Modal.Title className="text-white">
          {dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} quyết định chủ trương đầu tư
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
          <Form<ProjectDecisionFormValues>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin quyết định" />
            <div className="row">
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
                  label="Loại quyết định"
                  name="type"
                  rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <Select placeholder="Chọn loại quyết định" style={{ width: '100%' }} disabled={true}>
                    <Select.Option value={DecisionType.InvestmentPolicy}>
                      Quyết định chủ trương đầu tư
                    </Select.Option>
                    <Select.Option value={DecisionType.InvestmentDecision}>Quyết định đầu tư</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Số quyết định" name="decisionNumber">
                  <Input placeholder="Số quyết định" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày quyết định" name="decisionDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Người/Đơn vị ra quyết định" name="decisionMaker">
                  <Input placeholder="Người/Đơn vị ra quyết định" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Đã phê duyệt" name="isApproved" valuePropName="checked">
                  <Switch checkedChildren="Có" unCheckedChildren="Chưa" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              {form.getFieldValue('isApproved') && (
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Ngày phê duyệt" name="approvedDate">
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={dataModal?.readOnly} />
                  </Form.Item>
                </div>
              )}
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nội dung quyết định" name="content">
                  <Input.TextArea rows={4} placeholder="Nội dung quyết định" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Tài liệu đính kèm" name="attachments">
                  <FileUpload
                    fileList={attachments}
                    onChange={(e) => setAttachments(e.fileList)}
                    multiple={true}
                    URL={`${API_URL}/api/v1/attachments/public`}
                    disabled={dataModal?.readOnly ?? false}
                    isUseAliyunOSS
                  />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={3} placeholder="Ghi chú" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!dataModal?.readOnly && (
          <div className="d-flex justify-content-end align-items-center">
            <Button variant="secondary" className="btn-sm rounded-1 p-2 me-2" onClick={handleCancel}>
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
            <Button variant="secondary" className="btn-sm rounded-1 p-2" onClick={handleCancel}>
              <i className="fa fa-times me-2" />
              Đóng
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};
