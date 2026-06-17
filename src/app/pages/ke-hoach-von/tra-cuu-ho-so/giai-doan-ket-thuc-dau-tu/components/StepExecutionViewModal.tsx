import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, Select, Switch, Spin, Button } from 'antd';
import { Modal } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import { API_URL } from '@/utils/baseAPI';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IProjectProcessStepExecution, WorkItemStatus, IProjectStepDocument } from '@/models/ke-hoach-von';
import { HeaderTitle } from '@/app/components';
import FileUpload from '@/app/components/file-upload';
import { getProjectProcessStepExecutionById } from '@/services/projectProcessStepExecution.service';
import { searchProjectStepDocuments } from '@/services/projectStepDocument.service';

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

export const StepExecutionViewModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModalViewStepExecution
  ) as StepExecutionWithUiFlags | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleViewStepExecution);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<StepExecutionFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    dispatch(actionsModal.setModalVisibleViewStepExecution(false));
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
        <Modal.Title className="text-white">Chi tiết bước thực hiện</Modal.Title>
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
            disabled={true}
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
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày kết thúc dự kiến" name="expectedEndDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày kết thúc thực tế" name="actualEndDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Trạng thái" name="status">
                  <Select placeholder="Chọn trạng thái" style={{ width: '100%' }} disabled>
                    <Select.Option value={WorkItemStatus.Pending}>Chờ xử lý</Select.Option>
                    <Select.Option value={WorkItemStatus.InProgress}>Đang xử lý</Select.Option>
                    <Select.Option value={WorkItemStatus.Completed}>Hoàn thành</Select.Option>
                    <Select.Option value={WorkItemStatus.Cancelled}>Hủy bỏ</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Hoàn thành" name="isCompleted" valuePropName="checked">
                  <Switch checkedChildren="Có" unCheckedChildren="Chưa" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Kết quả" name="result">
                  <Input.TextArea rows={3} placeholder="Kết quả thực hiện" disabled />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={4} placeholder="Ghi chú" disabled />
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
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr key={doc.id || index}>
                      <td>
                        <Input value={doc.name} disabled placeholder="Tên thành phần hồ sơ" />
                      </td>
                      <td>
                        <Input value={doc.code} disabled placeholder="Mã" />
                      </td>
                      <td>
                        <Input value={doc.description} disabled placeholder="Mô tả" />
                      </td>
                      <td>
                        <FileUpload
                          accept={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png']}
                          multiple={true}
                          URL={`${API_URL}/api/v1/attachments/public`}
                          maxCount={10}
                          fileList={documentFileLists[index] || []}
                          onChange={() => {}}
                          isUseAliyunOSS
                          disabled={true}
                        />
                      </td>
                      <td className="text-center">
                        <Switch checked={doc.isRequired} disabled />
                      </td>
                      <td className="text-center">
                        <Switch checked={doc.isCompleted} disabled />
                      </td>
                    </tr>
                  ))}
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        Không có thành phần hồ sơ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-end align-items-center">
          <Button className="btn btn-secondary btn-sm rounded-1 p-2" onClick={handleCancel}>
            <i className="fa fa-times me-2" />
            Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
