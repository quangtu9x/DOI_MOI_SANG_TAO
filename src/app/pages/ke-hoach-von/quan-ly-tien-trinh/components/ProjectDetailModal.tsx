import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, InputNumber, DatePicker, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs, { Dayjs } from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IPaginationResponse, IResult } from '@/models';
import { IProject, ProjectStatus, ProjectPhase } from '@/models/ke-hoach-von';
import { requestPOST } from '@/utils/baseAPI';
import { HeaderTitle, TDSelect, OrganizationUnitTreeSelect } from '@/app/components';
import { createProject, updateProject, getProjectById } from '@/services/project.service';

type ProjectFormValues = Omit<IProject, 'startDate' | 'expectedEndDate' | 'actualEndDate'> & {
  startDate?: Dayjs;
  expectedEndDate?: Dayjs;
  actualEndDate?: Dayjs;
};

export const ProjectDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IProject | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ProjectFormValues>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        if (id) {
          const _data = await getProjectById(id);
          if (_data) {
            const { startDate, expectedEndDate, actualEndDate, ...restData } = _data;
            
            const formValues: any = {
              ...restData,
              startDate: startDate ? dayjs(startDate) : undefined,
              expectedEndDate: expectedEndDate ? dayjs(expectedEndDate) : undefined,
              actualEndDate: actualEndDate ? dayjs(actualEndDate) : undefined,
            };

            // Convert enum fields thành object format cho TDSelect
            if (_data.status !== undefined && _data.status !== null) {
              const statusLabel =
                _data.status === ProjectStatus.Draft
                  ? 'Nháp'
                  : _data.status === ProjectStatus.Planning
                  ? 'Đang lập kế hoạch'
                  : _data.status === ProjectStatus.Approved
                  ? 'Đã phê duyệt'
                  : _data.status === ProjectStatus.Executing
                  ? 'Đang thực hiện'
                  : _data.status === ProjectStatus.Suspended
                  ? 'Tạm dừng'
                  : _data.status === ProjectStatus.Completed
                  ? 'Hoàn thành'
                  : 'Hủy bỏ';
              formValues.status = { label: statusLabel, value: _data.status };
            }

            if (_data.currentPhase !== undefined && _data.currentPhase !== null) {
              const phaseLabel =
                _data.currentPhase === ProjectPhase.Preparation
                  ? 'Chuẩn bị đầu tư'
                  : _data.currentPhase === ProjectPhase.Implementation
                  ? 'Thực hiện đầu tư'
                  : _data.currentPhase === ProjectPhase.Completion
                  ? 'Kết thúc đầu tư'
                  : 'Sau đầu tư';
              formValues.currentPhase = { label: phaseLabel, value: _data.currentPhase };
            }

            // Fetch các ID fields để lấy label (fetch tất cả cùng lúc)
            const fetchPromises: Promise<any>[] = [];

            if (_data.projectTypeId) {
              fetchPromises.push(
                requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                  pageNumber: 1,
                  pageSize: 10000,
                  categoryGroupCode: 'LOAI_DU_AN',
                })
                  .then(res => {
                    const item = res.data?.data?.find(d => d.id === _data.projectTypeId);
                    return item ? { key: 'projectTypeId', label: item.name, value: item.id } : null;
                  })
                  .catch(() => null)
              );
            }

            if (_data.projectGroupId) {
              fetchPromises.push(
                requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                  pageNumber: 1,
                  pageSize: 10000,
                  categoryGroupCode: 'NHOM_DU_AN',
                })
                  .then(res => {
                    const item = res.data?.data?.find(d => d.id === _data.projectGroupId);
                    return item ? { key: 'projectGroupId', label: item.name, value: item.id } : null;
                  })
                  .catch(() => null)
              );
            }

            if (_data.investorId) {
              fetchPromises.push(
                requestPOST<IPaginationResponse<any[]>>(`investors/search`, {
                  pageNumber: 1,
                  pageSize: 10000,
                })
                  .then(res => {
                    const item = res.data?.data?.find(d => d.id === _data.investorId);
                    return item ? { key: 'investorId', label: item.name, value: item.id } : null;
                  })
                  .catch(() => null)
              );
            }

            if (_data.organizationUnitId) {
              fetchPromises.push(
                requestPOST<IPaginationResponse<any[]>>(`organizationunits/search`, {
                  pageNumber: 1,
                  pageSize: 10000,
                })
                  .then(res => {
                    const item = res.data?.data?.find(d => d.id === _data.organizationUnitId);
                    return item ? { key: 'organizationUnitId', label: item.name, value: item.id } : null;
                  })
                  .catch(() => null)
              );
            }

            if (_data.contractorId) {
              fetchPromises.push(
                requestPOST<IPaginationResponse<any[]>>(`contractors/search`, {
                  pageNumber: 1,
                  pageSize: 10000,
                })
                  .then(res => {
                    const item = res.data?.data?.find(d => d.id === _data.contractorId);
                    return item ? { key: 'contractorId', label: item.name, value: item.id } : null;
                  })
                  .catch(() => null)
              );
            }

            if (_data.investmentCapitalSourceId) {
              fetchPromises.push(
                requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                  pageNumber: 1,
                  pageSize: 10000,
                  categoryGroupCode: 'NGUON_VON_DAU_TU',
                })
                  .then(res => {
                    const item = res.data?.data?.find(d => d.id === _data.investmentCapitalSourceId);
                    return item ? { key: 'investmentCapitalSourceId', label: item.name, value: item.id } : null;
                  })
                  .catch(() => null)
              );
            }

            // Chuẩn hoá giá trị Tỉnh/Thành phố để TDSelect hiển thị name thay vì id
            if (_data.provinceId) {
              fetchPromises.push(
                requestPOST<IPaginationResponse<any[]>>(`ProvinceCities/search`, {
                  pageNumber: 1,
                  pageSize: 10000,
                  keyword: '',
                })
                  .then(res => {
                    const item = res.data?.data?.find(d => d.id === _data.provinceId);
                    return item ? { key: 'provinceId', label: item.name, value: item.id } : null;
                  })
                  .catch(() => null)
              );
            }

            if (_data.wardId) {
              fetchPromises.push(
                requestPOST<IPaginationResponse<any[]>>(`WardCommunes/search`, {
                  pageNumber: 1,
                  pageSize: 10000,
                  provinceId: _data.provinceId,
                })
                  .then(res => {
                    const item = res.data?.data?.find(d => d.id === _data.wardId);
                    return item ? { key: 'wardId', label: item.name, value: item.id } : null;
                  })
                  .catch(() => null)
              );
            }

            // Fetch tất cả cùng lúc và set vào formValues
            const results = await Promise.allSettled(fetchPromises);
            results.forEach(result => {
              if (result.status === 'fulfilled' && result.value) {
                const { key, label, value } = result.value;
                formValues[key] = { label, value };
              }
            });

            form.setFieldsValue(formValues as ProjectFormValues);
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
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      // Extract value từ các TDSelect fields (có thể là object {label, value} hoặc string/number)
      const extractValue = (field: any): string | number | undefined => {
        if (!field) return undefined;
        if (typeof field === 'object' && field.value !== undefined) {
          return field.value;
        }
        return field;
      };

      const formData: IProject = {
        ...values,
        ...(id && { id }),
        // Extract ID values từ TDSelect objects
        projectTypeId: extractValue(values.projectTypeId) as string | undefined,
        projectGroupId: extractValue(values.projectGroupId) as string | undefined,
        investorId: extractValue(values.investorId) as string | undefined,
        organizationUnitId: extractValue(values.organizationUnitId) as string | undefined,
        contractorId: extractValue(values.contractorId) as string | undefined,
        investmentCapitalSourceId: extractValue(
          values.investmentCapitalSourceId
        ) as string | undefined,
        provinceId: extractValue(values.provinceId) as string | undefined,
        wardId: extractValue(values.wardId) as string | undefined,
        // Extract enum values từ TDSelect objects
        status: extractValue(values.status) as ProjectStatus | undefined,
        currentPhase: extractValue(values.currentPhase) as ProjectPhase | undefined,
        // Format dates
        startDate: values.startDate ? (values.startDate as Dayjs).format('YYYY-MM-DD') : undefined,
        expectedEndDate: values.expectedEndDate
          ? (values.expectedEndDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        actualEndDate: values.actualEndDate
          ? (values.actualEndDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
      };

      if (id) {
        await updateProject(id, formData as any);
        toast.success('Cập nhật thành công!');
      } else {
        await createProject(formData as any);
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
          {dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} dự án
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
          <Form<ProjectFormValues>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin chung" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Mã dự án"
                  name="code"
                  rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <Input placeholder="Mã dự án" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Tên dự án"
                  name="name"
                  rules={[{ required: true, message: 'Không được để trống!' }]}
                >
                  <Input placeholder="Tên dự án" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Chủ đầu tư" name="investorId">
                  <TDSelect
                    placeholder="Chọn chủ đầu tư"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(
                        `investors/search`,
                        {
                          pageNumber: 1,
                          pageSize: 10000,
                          keyword: keyword,
                        }
                      );
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Đơn vị quản lý" name="organizationUnitId">
                  <OrganizationUnitTreeSelect
                    placeholder="Chọn đơn vị quản lý"
                    useCurrentUserDefault={false}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Nhà thầu" name="contractorId">
                  <TDSelect
                    placeholder="Chọn nhà thầu"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(
                        `contractors/search`,
                        {
                          pageNumber: 1,
                          pageSize: 10000,
                          keyword: keyword,
                        }
                      );
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                  />
                </Form.Item>
              </div>
              {/* <div className="col-xl-6 col-lg-6">
                <Form.Item label="Nguồn vốn đầu tư" name="investmentCapitalSourceId">
                  <TDSelect
                    placeholder="Chọn nguồn vốn đầu tư"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(
                        `categories/search`,
                        {
                          pageNumber: 1,
                          pageSize: 10000,
                          keyword: keyword,
                          categoryGroupCode: 'NGUON_VON_DAU_TU',
                        }
                      );
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                  />
                </Form.Item>
              </div> */}
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Địa chỉ" name="address">
                  <Input.TextArea rows={2} placeholder="Địa chỉ chi tiết" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Tỉnh/Thành phố" name="provinceId">
                  <TDSelect
                    placeholder="Chọn tỉnh/thành phố"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(
                        `ProvinceCities/search`,
                        {
                          pageNumber: 1,
                          pageSize: 10000,
                          keyword: keyword,
                        }
                      );
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Phường/Xã" name="wardId">
                  <TDSelect
                    placeholder="Chọn phường/xã"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(`WardCommunes/search`, {
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword,
                        provinceId: form.getFieldValue('provinceId'),
                      });
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                  />
                </Form.Item>
              </div>
            </div>

            <HeaderTitle title="Thông tin vốn đầu tư" />
            <div className="row">
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Tổng mức đầu tư (VNĐ)" name="totalInvestment">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                    placeholder="Tổng mức đầu tư"
                  />
                </Form.Item>
              </div>
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Vốn đã phân bổ (VNĐ)" name="allocatedCapital">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                    placeholder="Vốn đã phân bổ"
                  />
                </Form.Item>
              </div>
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Vốn đã giải ngân (VNĐ)" name="disbursedCapital">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                    placeholder="Vốn đã giải ngân"
                  />
                </Form.Item>
              </div>
            </div>

            <HeaderTitle title="Thông tin thời gian" />
            <div className="row">
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Ngày bắt đầu" name="startDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </div>
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Ngày kết thúc dự kiến" name="expectedEndDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </div>
              <div className="col-xl-4 col-lg-4">
                <Form.Item label="Ngày kết thúc thực tế" name="actualEndDate">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </div>
            </div>

            <HeaderTitle title="Trạng thái và giai đoạn" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Trạng thái" name="status">
                  <TDSelect
                    placeholder="Chọn trạng thái"
                    fetchOptions={async () => {
                      return Object.values(ProjectStatus)
                        .filter(v => typeof v === 'number')
                        .map(status => ({
                          label:
                            status === ProjectStatus.Draft
                              ? 'Nháp'
                              : status === ProjectStatus.Planning
                              ? 'Đang lập kế hoạch'
                              : status === ProjectStatus.Approved
                              ? 'Đã phê duyệt'
                              : status === ProjectStatus.Executing
                              ? 'Đang thực hiện'
                              : status === ProjectStatus.Suspended
                              ? 'Tạm dừng'
                              : status === ProjectStatus.Completed
                              ? 'Hoàn thành'
                              : 'Hủy bỏ',
                          value: status,
                        }));
                    }}
                    reload
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Giai đoạn hiện tại" name="currentPhase">
                  <TDSelect
                    placeholder="Chọn giai đoạn"
                    fetchOptions={async () => {
                      return Object.values(ProjectPhase)
                        .filter(v => typeof v === 'number')
                        .map(phase => ({
                          label:
                            phase === ProjectPhase.Preparation
                              ? 'Chuẩn bị đầu tư'
                              : phase === ProjectPhase.Implementation
                              ? 'Thực hiện đầu tư'
                              : phase === ProjectPhase.Completion
                              ? 'Kết thúc đầu tư'
                              : 'Sau đầu tư',
                          value: phase,
                        }));
                    }}
                    reload
                  />
                </Form.Item>
              </div>
            </div>

            <HeaderTitle title="Mô tả chi tiết" />
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea rows={3} placeholder="Mô tả dự án" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Mục tiêu" name="objectives">
                  <Input.TextArea rows={3} placeholder="Mục tiêu dự án" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Phạm vi" name="scope">
                  <Input.TextArea rows={3} placeholder="Phạm vi dự án" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nội dung" name="content">
                  <Input.TextArea rows={3} placeholder="Nội dung dự án" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Kết quả mong đợi" name="expectedResults">
                  <Input.TextArea rows={3} placeholder="Kết quả mong đợi" />
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
          <div className="d-flex justify-content-center align-items-center">
            <Button
              className="btn-sm btn-primary rounded-1 p-2 ms-2"
              onClick={onFinish}
              disabled={buttonLoading}
            >
              <i className="fa-regular fa-floppy-disk"></i>
              {id ? 'Lưu' : 'Tạo mới'}
            </Button>
          </div>
        )}
        <div className="d-flex justify-content-center align-items-center">
          <Button
            className="btn-sm btn-secondary rounded-1 p-2 ms-2"
            onClick={handleCancel}
            disabled={buttonLoading}
          >
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
