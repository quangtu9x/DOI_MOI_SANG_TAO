import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, Select, Switch, Spin, Button as AntdButton } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import { API_URL } from '@/utils/baseAPI';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IProjectProcessStepExecution, WorkItemStatus, IProjectStepDocument } from '@/models/ke-hoach-von';
import { HeaderTitle, TDSelect } from '@/app/components';
import FileUpload from '@/app/components/file-upload';
import {
  updateProjectProcessStepExecution,
  getProjectProcessStepExecutionById,
} from '@/services/projectProcessStepExecution.service';
import {
  searchProjectStepDocuments,
  createProjectStepDocument,
  updateProjectStepDocument,
  deleteProjectStepDocument,
} from '@/services/projectStepDocument.service';

type StepExecutionWithUiFlags = IProjectProcessStepExecution & {
  readOnly?: boolean;
};

type StepExecutionFormValues = Omit<
  IProjectProcessStepExecution,
  'startDate' | 'expectedEndDate' | 'actualEndDate'
> & {
  startDate?: Dayjs;
  expectedEndDate?: Dayjs;
  actualEndDate?: Dayjs;
};

export const StepExecutionDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModalCapBa
  ) as StepExecutionWithUiFlags | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleCapBa);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<StepExecutionFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [documents, setDocuments] = useState<IProjectStepDocument[]>([]);
  const [documentFileLists, setDocumentFileLists] = useState<Record<number, any[]>>({});

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        if (id) {
          const stepExecution = await getProjectProcessStepExecutionById(id);
          if (stepExecution) {
            const { startDate, expectedEndDate, actualEndDate, ...restData } = stepExecution;

            const formValues: any = {
              ...restData,
              startDate: startDate ? dayjs(startDate) : undefined,
              expectedEndDate: expectedEndDate ? dayjs(expectedEndDate) : undefined,
              actualEndDate: actualEndDate ? dayjs(actualEndDate) : undefined,
            };

            form.setFieldsValue(formValues);

            // Load documents
            const docsResponse = await searchProjectStepDocuments({
              pageNumber: 1,
              pageSize: 1000,
              projectProcessStepExecutionId: id,
            });
            setDocuments(docsResponse.data || []);

            // Load file lists for documents
            const fileLists: Record<number, any[]> = {};
            docsResponse.data?.forEach((doc, index) => {
              if (doc.attachmentList && doc.attachmentList.length > 0) {
                fileLists[index] = doc.attachmentList.map((url: string) => ({
                  uid: url,
                  name: url.split('/').pop() || 'file',
                  status: 'done',
                  url: url,
                }));
              }
            });
            setDocumentFileLists(fileLists);
          }
        } else {
          form.resetFields();
          setDocuments([]);
          setDocumentFileLists({});
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
    setDocuments([]);
    setDocumentFileLists({});
    dispatch(actionsModal.setModalVisibleCapBa(false));
  };

  const handleSaveDocument = async (doc: IProjectStepDocument, index: number): Promise<void> => {
    try {
      if (doc.id) {
        await updateProjectStepDocument(doc.id, {
          id: doc.id,
          name: doc.name,
          code: doc.code,
          description: doc.description,
          attachments: documentFileLists[index]?.map((f: any) => f.url || f.response?.data).filter(Boolean) || [],
          sortOrder: doc.sortOrder,
          isRequired: doc.isRequired,
          isCompleted: doc.isCompleted,
        });
        toast.success('Cập nhật thành phần hồ sơ thành công!');
      } else {
        if (!id) {
          toast.error('Vui lòng lưu bước thực hiện trước!');
          return;
        }
        const newDocId = await createProjectStepDocument({
          projectProcessStepExecutionId: id,
          name: doc.name || '',
          code: doc.code,
          description: doc.description,
          attachments: documentFileLists[index]?.map((f: any) => f.url || f.response?.data).filter(Boolean) || [],
          sortOrder: doc.sortOrder || index,
          isRequired: doc.isRequired,
          isCompleted: doc.isCompleted,
        });
        if (newDocId) {
          const updatedDocs = [...documents];
          updatedDocs[index] = { ...updatedDocs[index], id: newDocId };
          setDocuments(updatedDocs);
          toast.success('Thêm thành phần hồ sơ thành công!');
        }
      }
      dispatch(actionsGlobal.setRandom());
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Có lỗi xảy ra khi lưu thành phần hồ sơ!');
    }
  };

  const handleDeleteDocument = async (docId: string, index: number): Promise<void> => {
    try {
      await deleteProjectStepDocument(docId);
      const updatedDocs = documents.filter((_, i) => i !== index);
      setDocuments(updatedDocs);
      const updatedFileLists = { ...documentFileLists };
      delete updatedFileLists[index];
      setDocumentFileLists(updatedFileLists);
      toast.success('Xóa thành phần hồ sơ thành công!');
      dispatch(actionsGlobal.setRandom());
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Có lỗi xảy ra khi xóa thành phần hồ sơ!');
    }
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      if (!id) {
        toast.error('Vui lòng chọn bước thực hiện!');
        return;
      }

      const formData: any = {
        id,
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

      await updateProjectProcessStepExecution(id, formData);
      toast.success('Cập nhật thành công!');
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
          {dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} thực hiện bước
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
          <Form<StepExecutionFormValues>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin thực hiện bước" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Bước quy trình" name="projectProcessStepName">
                  <Input disabled />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Người được phân công" name="assignedUserFullName">
                  <Input disabled />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày bắt đầu" name="startDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày kết thúc dự kiến" name="expectedEndDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày kết thúc thực tế" name="actualEndDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Trạng thái" name="status">
                  <Select placeholder="Chọn trạng thái" style={{ width: '100%' }} disabled={dataModal?.readOnly}>
                    <Select.Option value={WorkItemStatus.Pending}>Chờ xử lý</Select.Option>
                    <Select.Option value={WorkItemStatus.InProgress}>Đang xử lý</Select.Option>
                    <Select.Option value={WorkItemStatus.Completed}>Hoàn thành</Select.Option>
                    <Select.Option value={WorkItemStatus.Cancelled}>Hủy bỏ</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Hoàn thành" name="isCompleted" valuePropName="checked">
                  <Switch checkedChildren="Có" unCheckedChildren="Chưa" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Kết quả" name="result">
                  <Input.TextArea rows={3} placeholder="Kết quả thực hiện" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={4} placeholder="Ghi chú" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
            </div>

            {/* Thành phần hồ sơ */}
            <HeaderTitle title="Thành phần hồ sơ" />
            <div className="table-responsive">
              <table className="table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
                <thead>
                  <tr className="fw-bolder text-muted">
                    <th className="min-w-150px">Tên thành phần hồ sơ</th>
                    <th className="min-w-100px">Mã</th>
                    <th className="min-w-200px">Mô tả</th>
                    <th className="min-w-150px">Đính kèm</th>
                    <th className="min-w-100px">Bắt buộc</th>
                    <th className="min-w-100px">Hoàn thành</th>
                    <th className="min-w-100px text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr key={doc.id || index}>
                      <td>
                        <Input
                          value={doc.name}
                          onChange={(e) => {
                            const updatedDocs = [...documents];
                            updatedDocs[index] = { ...updatedDocs[index], name: e.target.value };
                            setDocuments(updatedDocs);
                          }}
                          disabled={dataModal?.readOnly}
                          placeholder="Tên thành phần hồ sơ"
                        />
                      </td>
                      <td>
                        <Input
                          value={doc.code}
                          onChange={(e) => {
                            const updatedDocs = [...documents];
                            updatedDocs[index] = { ...updatedDocs[index], code: e.target.value };
                            setDocuments(updatedDocs);
                          }}
                          disabled={dataModal?.readOnly}
                          placeholder="Mã"
                        />
                      </td>
                      <td>
                        <Input
                          value={doc.description}
                          onChange={(e) => {
                            const updatedDocs = [...documents];
                            updatedDocs[index] = { ...updatedDocs[index], description: e.target.value };
                            setDocuments(updatedDocs);
                          }}
                          disabled={dataModal?.readOnly}
                          placeholder="Mô tả"
                        />
                      </td>
                      <td>
                        <FileUpload
                          accept={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png']}
                          multiple={true}
                          URL={`${API_URL}/api/v1/attachments/public`}
                          maxCount={10}
                          fileList={documentFileLists[index] || []}
                          onChange={(e) => {
                            setDocumentFileLists({
                              ...documentFileLists,
                              [index]: e.fileList,
                            });
                          }}
                          isUseAliyunOSS
                          disabled={dataModal?.readOnly}
                        />
                      </td>
                      <td className="text-center">
                        <Switch
                          checked={doc.isRequired}
                          onChange={(checked) => {
                            const updatedDocs = [...documents];
                            updatedDocs[index] = { ...updatedDocs[index], isRequired: checked };
                            setDocuments(updatedDocs);
                          }}
                          disabled={dataModal?.readOnly}
                        />
                      </td>
                      <td className="text-center">
                        <Switch
                          checked={doc.isCompleted}
                          onChange={(checked) => {
                            const updatedDocs = [...documents];
                            updatedDocs[index] = { ...updatedDocs[index], isCompleted: checked };
                            setDocuments(updatedDocs);
                          }}
                          disabled={dataModal?.readOnly}
                        />
                      </td>
                      <td className="text-center">
                        {!dataModal?.readOnly && (
                          <>
                            <AntdButton
                              type="link"
                              size="small"
                              onClick={() => handleSaveDocument(doc, index)}
                              className="me-2"
                            >
                              <i className="fa-regular fa-save"></i>
                            </AntdButton>
                            {doc.id && (
                              <AntdButton
                                type="link"
                                size="small"
                                danger
                                onClick={() => handleDeleteDocument(doc.id!, index)}
                              >
                                <i className="fa-regular fa-trash"></i>
                              </AntdButton>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-secondary">
                  <tr>
                    <td colSpan={7} className="text-left py-3">
                      {!dataModal?.readOnly && (
                        <Button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setDocuments([...documents, {} as IProjectStepDocument]);
                          }}
                        >
                          <i className="fa-regular fa-plus me-2"></i>
                          Thêm thành phần hồ sơ
                        </Button>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
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
