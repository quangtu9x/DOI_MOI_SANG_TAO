import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, Spin, Select } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  ICreateOrganizationUnitRequest,
  IUpdateOrganizationUnitRequest,
} from '@/models/ke-hoach-von';
import { OrganizationUnitType } from '@/models/catalogs';

import { requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { HeaderTitle, TDSelect } from '@/app/components';
import {
  getOrganizationUnitById,
  searchOrganizationUnits,
} from '@/services/organizationUnit.service';
import { IOrganizationUnit } from '@/models';

export const OrganizationUnitDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IOrganizationUnit | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IOrganizationUnit>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      if (!id) {
        form.resetFields();
        return;
      }

      try {
        setIsLoading(true);
        const response = await getOrganizationUnitById(id);
        if (response) {
          // Load thông tin đơn vị cha để hiển thị tên
          let parentValue: any = null;
          if (response.parentId) {
            try {
              const parentResponse = await requestGET<IResult<IOrganizationUnit>>(`OrganizationUnits/${response.parentId}`);
              if (parentResponse?.data?.data) {
                parentValue = {
                  value: parentResponse.data.data.id,
                  label: `${parentResponse.data.data.code || ''} - ${parentResponse.data.data.name || ''}`,
                };
              }
            } catch (error) {
              // Silent fail
            }
          }

          form.setFieldsValue({
            ...response,
            parentId: parentValue as any,
          });
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, form]);

  const handleCancel = (): void => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async (): Promise<void> => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const formData: ICreateOrganizationUnitRequest | IUpdateOrganizationUnitRequest = {
        ...(id && { id }),
        parentId: values.parentId?.value || values.parentId,
        name: values.name,
        code: values.code,
        organizationUnitType: values.organizationUnitType,
        description: values.description,
        sortOrder: values.sortOrder,
        isActive: values.isActive ?? true,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`OrganizationUnits/${id}`, formData)
        : await requestPOST<IResult<string>>(`OrganizationUnits`, formData);

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
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} cơ quan đơn vị</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form<IOrganizationUnit>
            form={form}
            layout="vertical"
            autoComplete="off"
            disabled={dataModal?.readOnly ?? false}
          >
            <HeaderTitle title="Thông tin chung" />
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Mã"
                  name="code"
                >
                  <Input placeholder="Mã cơ quan đơn vị" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Tên"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên cơ quan đơn vị' }]}
                >
                  <Input placeholder="Tên cơ quan đơn vị" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Đơn vị cha" name="parentId">
                  <TDSelect
                    placeholder="Chọn đơn vị cha"
                    fetchOptions={async keyword => {
                      const res = await searchOrganizationUnits({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      const filtered = res.data ?? [];
                      // Loại bỏ chính nó nếu đang edit
                      const filteredData = id ? filtered.filter(item => item.id !== id) : filtered;
                      return filteredData.map(item => ({
                        ...item,
                        label: `${item.code || ''} - ${item.name || ''}`,
                        value: item.id,
                      }));
                    }}
                    showSearch
                    reload
                    allowClear
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Loại đơn vị" name="organizationUnitType">
                  <Select
                    placeholder="Chọn loại đơn vị"
                    options={[
                      { label: 'Tổ chức', value: OrganizationUnitType.organization },
                      { label: 'Phòng ban', value: OrganizationUnitType.department },
                      { label: 'Đội nhóm', value: OrganizationUnitType.team },
                    ]}
                    allowClear
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Thứ tự sắp xếp" name="sortOrder">
                  <Input type="number" placeholder="Thứ tự sắp xếp" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Nội dung" name="description">
                  <Input.TextArea rows={4} placeholder="Nội dung" />
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
