import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, DatePicker, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import {
  IProjectDifficulty,
  DifficultyType,
  DifficultyLevel,
  ResolutionStatus,
  IProject,
  IResolveProjectDifficultyRequest,
} from '@/models/ke-hoach-von';
import { HeaderTitle, TDSelect, FileUpload } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { handleFiles, handleImage } from '@/utils/utils';
import { API_URL } from '@/utils/baseAPI';
import {
  getProjectDifficultyById,
  createProjectDifficulty,
  updateProjectDifficulty,
  resolveProjectDifficulty,
} from '@/services/projectDifficulty.service';
import { searchProjects } from '@/services/project.service';

type ProjectDifficultyWithUiFlags = IProjectDifficulty & {
  readOnly?: boolean;
  mode?: 'list' | 'resolve';
};

type ProjectDifficultyFormValues = Omit<IProjectDifficulty, 'occurredDate' | 'resolvedDate'> & {
  occurredDate?: Dayjs;
  resolvedDate?: Dayjs;
};

export const ProjectDifficultyModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector(
    (state: RootState) => state.modal.dataModalCapMot
  ) as ProjectDifficultyWithUiFlags | null;
  const modalVisible = useSelector(
    (state: RootState) => state.modal.modalVisibleCapMot
  );
  const id = dataModal?.id ?? null;
  const mode = dataModal?.mode ?? 'list';

  const [form] = Form.useForm<ProjectDifficultyFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [attachments, setAttachments] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      // comment: load dữ liệu khó khăn, vướng mắc khi mở modal
      try {
        setIsLoading(true);
        if (id) {
          const difficulty = await getProjectDifficultyById(id);
          if (difficulty) {
            const { occurredDate, resolvedDate, ...restData } = difficulty;

            const formValues: any = {
              ...restData,
              occurredDate: occurredDate ? dayjs(occurredDate) : undefined,
              resolvedDate: resolvedDate ? dayjs(resolvedDate) : undefined,
            };

            if (difficulty.projectId) {
              const projectRes = await searchProjects({
                pageNumber: 1,
                pageSize: 10000,
                keyword: '',
              });
              const project = projectRes.data?.find(
                (p: IProject) => p.id === difficulty.projectId
              );
              if (project) {
                formValues.projectId = {
                  label: `${project.code || ''} - ${project.name || ''}`,
                  value: project.id,
                };
              }
            }

            form.setFieldsValue(formValues);

            // set danh sách file đính kèm từ chuỗi attachments
            setAttachments(handleImage(difficulty.attachments ?? ''));
          }
        } else {
          form.resetFields();
          setAttachments([]);
        }
      } catch (error) {
        console.error('Error fetching project difficulty data:', error);
        toast.error('Không thể tải dữ liệu khó khăn, vướng mắc. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    if (modalVisible) {
      fetchData();
    }
  }, [id, modalVisible, form]);

  const handleCancel = (): void => {
    // comment: đóng modal khó khăn, vướng mắc
    form.resetFields();
    setAttachments([]);
    dispatch(actionsModal.setModalVisibleCapMot(false));
  };

  const onFinish = async (): Promise<void> => {
    // comment: lưu thông tin (thêm/sửa) khó khăn, vướng mắc
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

      if (mode === 'resolve' && id) {
        const resolveRequest: IResolveProjectDifficultyRequest = {
          id,
          resolutionResult: values.resolutionResult,
          resolvedDate: values.resolvedDate
            ? (values.resolvedDate as Dayjs).format('YYYY-MM-DD')
            : undefined,
          resolutionStatus: values.resolutionStatus,
        };
        await resolveProjectDifficulty(resolveRequest);
        toast.success('Cập nhật kết quả xử lý thành công!');
      } else {
        const formData: any = {
          ...(id && { id }),
          projectId: extractValue(values.projectId),
          title: values.title,
          content: values.content,
          type: values.type,
          level: values.level,
          occurredDate: values.occurredDate
            ? (values.occurredDate as Dayjs).format('YYYY-MM-DD')
            : undefined,
          attachments: handleFiles(attachments ?? []).join('##'),
          note: values.note,
        };

        if (id) {
          await updateProjectDifficulty(id, formData);
          toast.success('Cập nhật khó khăn, vướng mắc thành công!');
        } else {
          await createProjectDifficulty(formData);
          toast.success('Thêm mới khó khăn, vướng mắc thành công!');
        }
      }

      dispatch(actionsGlobal.setRandom());
      handleCancel();
    } catch (errorInfo) {
      console.error('Failed to submit project difficulty:', errorInfo);
      toast.error('Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setButtonLoading(false);
    }
  };

  const isResolveMode = mode === 'resolve';

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
            : isResolveMode
            ? 'Cập nhật kết quả xử lý khó khăn, vướng mắc'
            : id
            ? 'Chỉnh sửa khó khăn, vướng mắc'
            : 'Thêm mới khó khăn, vướng mắc'}
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
          <Form<ProjectDifficultyFormValues>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            {!isResolveMode && (
              <>
                <HeaderTitle title="Thông tin khó khăn, vướng mắc" />
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
                    <Form.Item
                      label="Tiêu đề"
                      name="title"
                      rules={[{ required: true, message: 'Không được để trống!' }]}
                    >
                      <Input placeholder="Nhập tiêu đề khó khăn, vướng mắc" />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Loại khó khăn" name="type">
                      <Select
                        placeholder="Chọn loại"
                        style={{ width: '100%' }}
                      >
                        <Select.Option value={DifficultyType.Technical}>
                          Kỹ thuật
                        </Select.Option>
                        <Select.Option value={DifficultyType.Financial}>
                          Tài chính
                        </Select.Option>
                        <Select.Option value={DifficultyType.Legal}>
                          Pháp lý
                        </Select.Option>
                        <Select.Option value={DifficultyType.Other}>
                          Khác
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Mức độ" name="level">
                      <Select
                        placeholder="Chọn mức độ"
                        style={{ width: '100%' }}
                      >
                        <Select.Option value={DifficultyLevel.Low}>Thấp</Select.Option>
                        <Select.Option value={DifficultyLevel.Medium}>
                          Trung bình
                        </Select.Option>
                        <Select.Option value={DifficultyLevel.High}>Cao</Select.Option>
                        <Select.Option value={DifficultyLevel.Critical}>
                          Nghiêm trọng
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Ngày phát sinh" name="occurredDate">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-xl-12 col-lg-12">
                    <Form.Item label="Nội dung" name="content">
                      <Input.TextArea
                        rows={4}
                        placeholder="Mô tả chi tiết khó khăn, vướng mắc"
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
              </>
            )}

            {isResolveMode && (
              <>
                <HeaderTitle title="Kết quả xử lý khó khăn, vướng mắc" />
                <div className="row">
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Kết quả xử lý" name="resolutionResult">
                      <Input.TextArea
                        rows={4}
                        placeholder="Mô tả kết quả xử lý"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Ngày xử lý" name="resolvedDate">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item
                      label="Trạng thái xử lý"
                      name="resolutionStatus"
                    >
                      <Select
                        placeholder="Chọn trạng thái"
                        style={{ width: '100%' }}
                      >
                        <Select.Option value={ResolutionStatus.Pending}>
                          Chờ xử lý
                        </Select.Option>
                        <Select.Option value={ResolutionStatus.InProgress}>
                          Đang xử lý
                        </Select.Option>
                        <Select.Option value={ResolutionStatus.Resolved}>
                          Đã xử lý
                        </Select.Option>
                        <Select.Option value={ResolutionStatus.Unresolved}>
                          Không thể xử lý
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </>
            )}
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

