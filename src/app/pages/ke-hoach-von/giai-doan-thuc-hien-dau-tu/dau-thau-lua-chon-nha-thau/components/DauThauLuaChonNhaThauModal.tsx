import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, Select, Switch, Spin, Button } from 'antd';
import { Modal } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import { IPaginationResponse } from '@/models';
import { API_URL, requestPOST } from '@/utils/baseAPI';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import {
  IProjectProcessStepExecution,
  WorkItemStatus,
  IProjectStepDocument,
  StepType,
  ProjectPhase,
} from '@/models/ke-hoach-von';
import { HeaderTitle, TDSelect } from '@/app/components';
import FileUpload from '@/app/components/file-upload';
import {
  updateProjectProcessStepExecution,
  getProjectProcessStepExecutionById,
  createProjectProcessStepExecution,
} from '@/services/projectProcessStepExecution.service';
import { searchProjectProcessExecutions } from '@/services/projectProcessExecution.service';
import { searchProjectProcesses } from '@/services/projectProcess.service';
import { searchProjectProcessSteps } from '@/services/projectProcessStep.service';
import {
  searchProjectStepDocuments,
  createProjectStepDocument,
  updateProjectStepDocument,
  deleteProjectStepDocument,
} from '@/services/projectStepDocument.service';
import { getProjectProcessStepById } from '@/services/projectProcessStep.service';

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
  assignedDate?: Dayjs;
  projectProcessExecutionId?: string;
  projectProcessStepId?: string;
  assignedUserId?: string;
  assignedBy?: string;
};

export const DauThauLuaChonNhaThauModal = () => {
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
              assignedDate: stepExecution.assignedDate ? dayjs(stepExecution.assignedDate) : undefined,
            };

            // Fetch projectProcessExecution để tạo object với label cho TDSelect
            if (stepExecution.projectProcessExecutionId) {
              try {
                const executionRes = await searchProjectProcessExecutions({
                  pageNumber: 1,
                  pageSize: 10000,
                });
                const execution = executionRes.data?.find(e => e.id === stepExecution.projectProcessExecutionId);
                if (execution) {
                  // Lấy thông tin ProjectProcess để tạo label
                  const projectProcessIds = [...new Set([execution.projectProcessId].filter(Boolean))];
                  let processMap = new Map<string, { name?: string; code?: string }>();
                  if (projectProcessIds.length > 0) {
                    try {
                      const processesRes = await searchProjectProcesses({
                        pageNumber: 1,
                        pageSize: 10000,
                      });
                      processesRes.data?.forEach(process => {
                        if (process.id) {
                          processMap.set(process.id, {
                            name: process.name,
                            code: process.code,
                          });
                        }
                      });
                    } catch (error) {
                      // Ignore error
                    }
                  }
                  
                  const processInfo = execution.projectProcessId ? processMap.get(execution.projectProcessId) : null;
                  const projectProcessName = processInfo?.name || execution.projectProcessName;
                  const projectProcessCode = processInfo?.code || execution.projectProcessCode;
                  
                  const label = projectProcessName 
                    ? (projectProcessCode 
                        ? `${projectProcessCode} - ${projectProcessName}` 
                        : projectProcessName)
                    : projectProcessCode || 'Không có tên';
                  
                  formValues.projectProcessExecutionId = {
                    label,
                    value: execution.id,
                  };
                } else {
                  formValues.projectProcessExecutionId = stepExecution.projectProcessExecutionId;
                }
              } catch (error) {
                formValues.projectProcessExecutionId = stepExecution.projectProcessExecutionId;
              }
            }

            // Fetch projectProcessStep để tạo object với label cho TDSelect
            if (stepExecution.projectProcessStepId) {
              try {
                const stepRes = await searchProjectProcessSteps({
                  pageNumber: 1,
                  pageSize: 10000,
                  stepType: StepType.BiddingContractorSelection,
                });
                const step = stepRes.data?.find(s => s.id === stepExecution.projectProcessStepId);
                if (step) {
                  const label = `${step.code || ''} - ${step.name || ''}`;
                  formValues.projectProcessStepId = {
                    label,
                    value: step.id,
                  };
                } else {
                  formValues.projectProcessStepId = stepExecution.projectProcessStepId;
                }
              } catch (error) {
                formValues.projectProcessStepId = stepExecution.projectProcessStepId;
              }
            }

            // Fetch user để tạo object với label cho TDSelect
            if (stepExecution.assignedUserId) {
              try {
                const userRes = await requestPOST<IPaginationResponse<any[]>>('users/search', {
                  pageNumber: 1,
                  pageSize: 10000,
                }, 'neutral');
                const user = userRes.data?.data?.find(u => u.id === stepExecution.assignedUserId);
                if (user) {
                  formValues.assignedUserId = {
                    label: `${user.userName || ''} - ${user.fullName || ''}`,
                    value: user.id,
                  };
                } else {
                  formValues.assignedUserId = stepExecution.assignedUserId;
                }
              } catch (error) {
                formValues.assignedUserId = stepExecution.assignedUserId;
              }
            }

            // Fetch assignedBy user để tạo object với label cho TDSelect
            if (stepExecution.assignedBy) {
              try {
                const userRes = await requestPOST<IPaginationResponse<any[]>>('users/search', {
                  pageNumber: 1,
                  pageSize: 10000,
                }, 'neutral');
                const user = userRes.data?.data?.find(u => u.id === stepExecution.assignedBy);
                if (user) {
                  formValues.assignedBy = {
                    label: `${user.userName || ''} - ${user.fullName || ''}`,
                    value: user.id,
                  };
                } else {
                  formValues.assignedBy = stepExecution.assignedBy;
                }
              } catch (error) {
                formValues.assignedBy = stepExecution.assignedBy;
              }
            }

            form.setFieldsValue(formValues);

            if (stepExecution.documents && stepExecution.documents.length > 0) {
              const processedDocuments = stepExecution.documents.map(doc => {
                if (doc.attachments && !doc.attachmentList) {
                  // Convert "path1##path2" thành array
                  doc.attachmentList = doc.attachments.split('##').filter(Boolean);
                }
                return doc;
              });
              
              setDocuments(processedDocuments);

              // Load file lists for documents từ response
              const fileLists: Record<number, any[]> = {};
              processedDocuments.forEach((doc, index) => {
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
            } else {
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
          }
        } else {
          form.resetFields();
          setDocuments([]);
          setDocumentFileLists({});
        }
      } catch (error) {
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
    // NOTE: Không gọi API riêng nữa, chỉ cập nhật local state
    // Documents sẽ được lưu khi click "Lưu" chính (onFinish)
    toast.info('Thành phần hồ sơ sẽ được lưu khi bạn click nút "Lưu" ở dưới cùng');
  
  };

  const handleDeleteDocument = async (docId: string, index: number): Promise<void> => {
    // Xóa mềm: chỉ xóa khỏi local state, không gọi API
    // Document sẽ được xóa thực sự khi click "Lưu" (onFinish)
    const updatedDocs = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocs);
    
    // Cập nhật lại fileLists sau khi xóa - map lại index cho các fileLists còn lại
    const updatedFileLists: Record<number, any[]> = {};
    updatedDocs.forEach((doc, newIndex) => {
      // Tìm index cũ của document này trong mảng documents ban đầu
      // newIndex < index: giữ nguyên index cũ
      // newIndex >= index: index cũ = newIndex + 1 (vì đã xóa 1 phần tử ở trước)
      const oldIndex = newIndex < index ? newIndex : newIndex + 1;
      if (documentFileLists[oldIndex]) {
        updatedFileLists[newIndex] = documentFileLists[oldIndex];
      }
    });
    setDocumentFileLists(updatedFileLists);
    
    toast.success('Đã xóa thành phần hồ sơ khỏi danh sách. Click "Lưu" để lưu thay đổi.');
  };

  // Hàm helper để tự động tạo documents từ ProjectProcessStep
  const createDocumentsFromStep = async (
    stepExecutionId: string,
    projectProcessStepId: string
  ): Promise<number> => {
    try {
      // Lấy thông tin ProjectProcessStep
      const step = await getProjectProcessStepById(projectProcessStepId);
      
      if (!step) {
        return 0;
      }

      // Kiểm tra xem step có documents trong response không
      if (step.documents && Array.isArray(step.documents) && step.documents.length > 0) {
        // Tạo các documents từ step cho execution
        const createdDocIds: string[] = [];
        for (const stepDoc of step.documents) {
          try {
            const newDocId = await createProjectStepDocument({
              projectProcessStepExecutionId: stepExecutionId,
              name: stepDoc.name || '',
              code: stepDoc.code,
              description: stepDoc.description,
              attachments: [],
              sortOrder: stepDoc.sortOrder || 0,
              isRequired: stepDoc.isRequired || false,
              isCompleted: false, // Mặc định chưa hoàn thành
            });
            
            if (newDocId) {
              createdDocIds.push(newDocId);
            }
          } catch (error) {
            // Ignore error
          }
        }

        if (createdDocIds.length > 0) {
          return createdDocIds.length;
        } else {
          return 0;
        }
      } else {
        // Nếu step không có documents trong response, thử tìm kiếm documents theo projectProcessStepId
        try {
          // Tìm kiếm documents theo projectProcessStepId (nếu có API này)
          const stepDocsResponse = await searchProjectStepDocuments({
            pageNumber: 1,
            pageSize: 1000,
            // Có thể cần thêm field projectProcessStepId vào search request
            // projectProcessStepId: projectProcessStepId, // Nếu API hỗ trợ
          } as any);
          
          // Lọc documents theo stepId nếu có
          const stepDocuments = stepDocsResponse.data?.filter((doc: any) => 
            doc.projectProcessStepId === projectProcessStepId
          ) || [];
          
          if (stepDocuments.length > 0) {
            // Tạo các documents từ step cho execution
            const createdDocIds: string[] = [];
            for (const stepDoc of stepDocuments) {
              try {
                const newDocId = await createProjectStepDocument({
                  projectProcessStepExecutionId: stepExecutionId,
                  name: stepDoc.name || '',
                  code: stepDoc.code,
                  description: stepDoc.description,
                  attachments: [],
                  sortOrder: stepDoc.sortOrder || 0,
                  isRequired: stepDoc.isRequired || false,
                  isCompleted: false,
                });
                
                if (newDocId) {
                  createdDocIds.push(newDocId);
                }
              } catch (error) {
                // Ignore error
              }
            }
            
            if (createdDocIds.length > 0) {
              return createdDocIds.length;
            }
          }
        } catch (searchError) {
          // Ignore error
        }
        
        return 0;
      }
    } catch (error) {
      throw error; // Throw để caller có thể xử lý
    }
  };

  // Hàm helper để lấy ID từ TDSelect value (có thể là string hoặc object)
  const getValueId = (value: any): string | undefined => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.value) return value.value;
    return undefined;
  };

  // Hàm helper để lấy URL string từ file object
  const getFileUrl = (file: any): string | null => {
    if (!file) return null;
    
    // Ưu tiên: response.data[0].url (sau khi upload thành công)
    if (file.response?.data?.[0]?.url && typeof file.response.data[0].url === 'string') {
      return file.response.data[0].url;
    }
    
    // Nếu response.data là array và có url
    if (Array.isArray(file.response?.data) && file.response.data.length > 0) {
      const firstItem = file.response.data[0];
      if (firstItem?.url && typeof firstItem.url === 'string') {
        return firstItem.url;
      }
    }
    
    // Nếu response.data là object có url
    if (file.response?.data?.url && typeof file.response.data.url === 'string') {
      return file.response.data.url;
    }
    
    // Fallback: path hoặc url trực tiếp
    if (file.path && typeof file.path === 'string') {
      return file.path;
    }
    
    if (file.url && typeof file.url === 'string') {
      return file.url;
    }
    
    return null;
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      if (id) {
        // Chuẩn bị documents từ UI để truyền vào request
        const documentsToSend: IProjectStepDocument[] = [];
        
        for (let index = 0; index < documents.length; index++) {
          const doc = documents[index];
          // Gửi tất cả documents có name (có id là update, không có id là tạo mới)
          if (doc.name && doc.name.trim() !== '') {
            const fileList = documentFileLists[index] || [];
            // Lấy URL string từ mỗi file object
            const attachments = fileList
              .map((f: any) => getFileUrl(f))
              .filter((url): url is string => url !== null && typeof url === 'string');
            
            const docToSend: IProjectStepDocument = {
              id: doc.id, // Có id là update, không có id là tạo mới
              name: doc.name,
              code: doc.code,
              description: doc.description,
              attachments: attachments.length > 0 ? attachments.join('##') : undefined,
              sortOrder: doc.sortOrder || index,
              isRequired: doc.isRequired || false,
              isCompleted: doc.isCompleted || false,
            };
            
            documentsToSend.push(docToSend);
          }
        }

        // Cập nhật
        const formData: any = {
          id,
          projectProcessExecutionId: getValueId(values.projectProcessExecutionId),
          projectProcessStepId: getValueId(values.projectProcessStepId),
          assignedUserId: getValueId(values.assignedUserId),
          assignedBy: getValueId(values.assignedBy),
          assignedDate: values.assignedDate ? (values.assignedDate as Dayjs).format('YYYY-MM-DD') : undefined,
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
          documents: documentsToSend.length > 0 ? documentsToSend : undefined,
        };

        const updatedStepExecution = await updateProjectProcessStepExecution(id, formData);
        if (updatedStepExecution) {
          // Sử dụng documents từ response
          if (updatedStepExecution.documents && updatedStepExecution.documents.length > 0) {
            const processedDocuments = updatedStepExecution.documents.map(doc => {
              if (doc.attachments && !doc.attachmentList) {
                doc.attachmentList = doc.attachments.split('##').filter(Boolean);
              }
              return doc;
            });
            
            setDocuments(processedDocuments);
            
            const fileLists: Record<number, any[]> = {};
            processedDocuments.forEach((doc, index) => {
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
          } else {
            // Reload documents nếu response chưa có
            const docsResponse = await searchProjectStepDocuments({
              pageNumber: 1,
              pageSize: 1000,
              projectProcessStepExecutionId: id,
            });
            
            const processedDocuments = (docsResponse.data || []).map(doc => {
              if (doc.attachments && !doc.attachmentList) {
                doc.attachmentList = doc.attachments.split('##').filter(Boolean);
              }
              return doc;
            });
            
            setDocuments(processedDocuments);
            
            const fileLists: Record<number, any[]> = {};
            processedDocuments.forEach((doc, index) => {
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
        }
        toast.success('Cập nhật thành công!');
      } else {
        // Tạo mới
        const projectProcessExecutionId = getValueId(values.projectProcessExecutionId);
        const projectProcessStepId = getValueId(values.projectProcessStepId);
        
        if (!projectProcessExecutionId || !projectProcessStepId) {
          toast.error('Vui lòng chọn quy trình và bước quy trình!');
          return;
        }

        // Chuẩn bị documents từ UI để truyền vào request
        const documentsToSend: IProjectStepDocument[] = [];
        
        for (let index = 0; index < documents.length; index++) {
          const doc = documents[index];
          // Chỉ gửi documents có name (bỏ qua documents trống)
          if (doc.name && doc.name.trim() !== '') {
            const fileList = documentFileLists[index] || [];
            // Lấy URL string từ mỗi file object
            const attachments = fileList
              .map((f: any) => getFileUrl(f))
              .filter((url): url is string => url !== null && typeof url === 'string');
            
            const docToSend: IProjectStepDocument = {
              name: doc.name,
              code: doc.code,
              description: doc.description,
              attachments: attachments.length > 0 ? attachments.join('##') : undefined,
              sortOrder: doc.sortOrder || index,
              isRequired: doc.isRequired || false,
              isCompleted: doc.isCompleted || false,
            };
            
            documentsToSend.push(docToSend);
          }
        }

        // Nếu không có documents từ user, thử lấy từ ProjectProcessStep
        if (documentsToSend.length === 0 && projectProcessStepId) {
          try {
            const step = await getProjectProcessStepById(projectProcessStepId);
            
            if (step?.documents && Array.isArray(step.documents) && step.documents.length > 0) {
              documentsToSend.push(...step.documents.map(doc => ({
                name: doc.name || '',
                code: doc.code,
                description: doc.description,
                attachments: undefined,
                sortOrder: doc.sortOrder || 0,
                isRequired: doc.isRequired || false,
                isCompleted: false,
              })));
            }
          } catch (error) {
            // Ignore error
          }
        }

        const createData: any = {
          projectProcessExecutionId,
          projectProcessStepId,
          assignedUserId: getValueId(values.assignedUserId),
          assignedBy: getValueId(values.assignedBy),
          assignedDate: values.assignedDate ? (values.assignedDate as Dayjs).format('YYYY-MM-DD') : undefined,
          startDate: values.startDate ? (values.startDate as Dayjs).format('YYYY-MM-DD') : undefined,
          expectedEndDate: values.expectedEndDate
            ? (values.expectedEndDate as Dayjs).format('YYYY-MM-DD')
            : undefined,
          note: values.note,
          documents: documentsToSend.length > 0 ? documentsToSend : undefined,
        };

        const newStepExecution = await createProjectProcessStepExecution(createData);
        if (newStepExecution && newStepExecution.id) {
          toast.success('Tạo mới thành công!');
          // Response mới trả về DTO đầy đủ với documents, cập nhật state
          
          // Cập nhật form với dữ liệu từ response
          const { startDate, expectedEndDate, actualEndDate, ...restData } = newStepExecution;
          const formValues: any = {
            ...restData,
            projectProcessExecutionId: newStepExecution.projectProcessExecutionId,
            projectProcessStepId: newStepExecution.projectProcessStepId,
            assignedUserId: newStepExecution.assignedUserId,
            assignedBy: newStepExecution.assignedBy,
            startDate: startDate ? dayjs(startDate) : undefined,
            expectedEndDate: expectedEndDate ? dayjs(expectedEndDate) : undefined,
            actualEndDate: actualEndDate ? dayjs(actualEndDate) : undefined,
            assignedDate: newStepExecution.assignedDate ? dayjs(newStepExecution.assignedDate) : undefined,
          };
          form.setFieldsValue(formValues);

          // Sử dụng documents từ response
          if (newStepExecution.documents && newStepExecution.documents.length > 0) {
            const processedDocuments = newStepExecution.documents.map(doc => {
              if (doc.attachments && !doc.attachmentList) {
                doc.attachmentList = doc.attachments.split('##').filter(Boolean);
              }
              return doc;
            });
            
            setDocuments(processedDocuments);
            
            // Load file lists
            const fileLists: Record<number, any[]> = {};
            processedDocuments.forEach((doc, index) => {
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
          } else {
            // Reload documents nếu response chưa có
            const docsResponse = await searchProjectStepDocuments({
              pageNumber: 1,
              pageSize: 1000,
              projectProcessStepExecutionId: newStepExecution.id,
            });

            const processedDocuments = (docsResponse.data || []).map(doc => {
              if (doc.attachments && !doc.attachmentList) {
                doc.attachmentList = doc.attachments.split('##').filter(Boolean);
              }
              return doc;
            });
            
            setDocuments(processedDocuments);
            
            const fileLists: Record<number, any[]> = {};
            processedDocuments.forEach((doc, index) => {
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

          // Cập nhật modal với ID mới để có thể thêm thành phần hồ sơ
          dispatch(actionsModal.setDataModalCapBa({ ...dataModal, id: newStepExecution.id }));
        }
      }
      dispatch(actionsGlobal.setRandom());
      if (id) {
        handleCancel();
      }
    } catch (errorInfo) {
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
          {dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} đấu thầu, lựa chọn nhà thầu
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
              {/* Thông tin quy trình - chỉ hiển thị khi tạo mới hoặc có thể chỉnh sửa */}
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Quy trình đã áp dụng"
                  name="projectProcessExecutionId"
                  rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <TDSelect
                    placeholder="Chọn quy trình đã áp dụng"
                    fetchOptions={async keyword => {
                      const res = await searchProjectProcessExecutions({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      // Lấy danh sách projectProcessId unique từ executions
                      const projectProcessIds = [...new Set(
                        res.data?.map(item => item.projectProcessId).filter(Boolean) || []
                      )];
                      // Fetch tất cả ProjectProcess để lấy name và code
                      let processMap = new Map<string, { name?: string; code?: string }>();
                      if (projectProcessIds.length > 0) {
                        try {
                          const processesRes = await searchProjectProcesses({
                            pageNumber: 1,
                            pageSize: 10000,
                          });
                          // Tạo map để lookup nhanh
                          processesRes.data?.forEach(process => {
                            if (process.id) {
                              processMap.set(process.id, {
                                name: process.name,
                                code: process.code,
                              });
                            }
                          });
                        } catch (error) {
                          // Ignore error
                        }
                      }
                      
                      // Map lại data với projectProcessName và projectProcessCode từ ProjectProcess
                      const mappedItems = res.data?.map(item => {
                        const processInfo = item.projectProcessId ? processMap.get(item.projectProcessId) : null;
                        const projectProcessName = processInfo?.name || item.projectProcessName;
                        const projectProcessCode = processInfo?.code || item.projectProcessCode;
                        
                        const label = projectProcessName 
                          ? (projectProcessCode 
                              ? `${projectProcessCode} - ${projectProcessName}` 
                              : projectProcessName)
                          : projectProcessCode || 'Không có tên';
                        
                        return {
                          ...item,
                          projectProcessName,
                          projectProcessCode,
                          label,
                          value: item.id,
                        };
                      }) ?? [];
                      
                      return mappedItems;
                    }}
                    showSearch
                    reload
                    allowClear
                    disabled={dataModal?.readOnly}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Bước quy trình"
                  name="projectProcessStepId"
                  rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <TDSelect
                    placeholder="Chọn bước quy trình"
                    fetchOptions={async keyword => {
                      const res = await searchProjectProcessSteps({
                        pageNumber: 1,
                        pageSize: 10000,
                        stepType: StepType.BiddingContractorSelection,
                      });
                      const mappedItems = res.data?.map(item => {
                        const label = `${item.code || ''} - ${item.name || ''}`;
                        
                        return {
                          ...item,
                          label,
                          value: item.id,
                        };
                      }) ?? [];
                      
                      return mappedItems;
                    }}
                    showSearch
                    reload
                    allowClear
                    disabled={dataModal?.readOnly}
                  />
                </Form.Item>
              </div>

              {/* Hiển thị thông tin bước khi đã có id */}
              {id && dataModal && (
                <>
                  {(dataModal.stepName || dataModal.projectProcessStepName) && (
                    <div className="col-xl-6 col-lg-6">
                      <Form.Item label="Tên bước quy trình">
                        <Input value={dataModal.stepName || dataModal.projectProcessStepName} disabled />
                      </Form.Item>
                    </div>
                  )}
                  {(dataModal.stepCode || dataModal.projectProcessStepCode) && (
                    <div className="col-xl-6 col-lg-6">
                      <Form.Item label="Mã bước quy trình">
                        <Input value={dataModal.stepCode || dataModal.projectProcessStepCode} disabled />
                      </Form.Item>
                    </div>
                  )}
                  {dataModal.stepOrder !== undefined && (
                    <div className="col-xl-6 col-lg-6">
                      <Form.Item label="Thứ tự bước">
                        <Input value={dataModal.stepOrder} disabled />
                      </Form.Item>
                    </div>
                  )}
                  {dataModal.stepTypeName && (
                    <div className="col-xl-6 col-lg-6">
                      <Form.Item label="Loại bước thực hiện">
                        <Input value={dataModal.stepTypeName} disabled />
                      </Form.Item>
                    </div>
                  )}
                  {dataModal.phaseName && (
                    <div className="col-xl-6 col-lg-6">
                      <Form.Item label="Giai đoạn dự án">
                        <Input value={dataModal.phaseName} disabled />
                      </Form.Item>
                    </div>
                  )}
                </>
              )}

              {/* Thông tin phân công */}
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Người được phân công"
                  name="assignedUserId"
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
                    disabled={dataModal?.readOnly}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Người phân công"
                  name="assignedBy"
                >
                  <TDSelect
                    placeholder="Chọn người phân công"
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
                    disabled={dataModal?.readOnly}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Ngày phân công" name="assignedDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div>
              {id && dataModal?.assignedByName && (
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tên người phân công">
                    <Input value={dataModal.assignedByName} disabled />
                  </Form.Item>
                </div>
              )}
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
              {/* <div className="col-xl-6 col-lg-6">
                <Form.Item label="Hoàn thành" name="isCompleted" valuePropName="checked">
                  <Switch checkedChildren="Có" unCheckedChildren="Chưa" disabled={dataModal?.readOnly} />
                </Form.Item>
              </div> */}
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
                            <Button
                              type="link"
                              size="small"
                              onClick={() => handleSaveDocument(doc, index)}
                              className="me-2"
                            >
                              <i className="fa-regular fa-save"></i>
                            </Button>
                            {doc.id && (
                              <Button
                                type="link"
                                size="small"
                                danger
                                onClick={() => handleDeleteDocument(doc.id!, index)}
                              >
                                <i className="fa-regular fa-trash"></i>
                              </Button>
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
                          type="primary"
                          className="btn btn-sm btn-primary"
                          onClick={async () => {
                            try {
                              // Lấy projectProcessStepId từ form
                              const projectProcessStepId = form.getFieldValue('projectProcessStepId');
                              
                              if (!projectProcessStepId) {
                                toast.error('Vui lòng chọn bước quy trình trước!');
                                return;
                              }

                              // Lấy ID thực tế nếu là object từ TDSelect
                              const stepId = typeof projectProcessStepId === 'string' 
                                ? projectProcessStepId 
                                : projectProcessStepId?.value;

                              if (!stepId) {
                                toast.error('Không tìm thấy bước quy trình!');
                                return;
                              }

                              // Gọi API ProjectProcessStep để lấy thông tin step và documents
                              const step = await getProjectProcessStepById(stepId);
                              
                              if (!step) {
                                toast.error('Không tìm thấy thông tin bước quy trình!');
                                return;
                              }

                              // Kiểm tra xem step có documents không
                              // Nếu có documents trong response, tạo documents tương ứng
                              if (step.documents && Array.isArray(step.documents) && step.documents.length > 0) {
                                // Tạo documents từ step cho execution
                                const newDocuments: IProjectStepDocument[] = step.documents.map((doc, index) => ({
                                  name: doc.name,
                                  code: doc.code,
                                  description: doc.description,
                                  sortOrder: doc.sortOrder || (documents.length + index),
                                  isRequired: doc.isRequired || false,
                                  isCompleted: false, // Mặc định chưa hoàn thành
                                }));

                                setDocuments([...documents, ...newDocuments]);
                                toast.success(`Đã thêm ${newDocuments.length} thành phần hồ sơ từ bước quy trình!`);
                              } else {
                                // Nếu step không có documents, thêm document trống
                                setDocuments([...documents, {} as IProjectStepDocument]);
                              }
                            } catch (error) {
                              toast.error('Không thể tải thành phần hồ sơ từ bước quy trình. Thêm thành phần hồ sơ trống.');
                              setDocuments([...documents, {} as IProjectStepDocument]);
                            }
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
              type="default"
              className="btn-sm rounded-1 p-2 me-2"
              onClick={handleCancel}
            >
              <i className="fa fa-times me-2" />
              Đóng
            </Button>
            <Button
              type="primary"
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
            <Button type="default" className="btn-sm rounded-1 p-2" onClick={handleCancel}>
              <i className="fa fa-times me-2" />
              Đóng
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};
