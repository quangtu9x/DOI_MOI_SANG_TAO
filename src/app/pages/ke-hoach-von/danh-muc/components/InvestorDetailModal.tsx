import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IInvestor,
  ICreateInvestorRequest,
  IUpdateInvestorRequest,
} from '@/models/ke-hoach-von';

import { handleFiles, handleImage } from '@/utils/utils';
import { requestGET, requestPOST, requestPUT, API_URL } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect, OrganizationUnitTreeSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import {
  getInvestorById,
} from '@/services/investor.service';
import { searchProvinces } from '@/services/province.service';
import { searchWards } from '@/services/ward.service';

export const InvestorDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IInvestor | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IInvestor>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<TDUploadFile[]>([]);

  /**
   * Load dữ liệu khi mở modal ở chế độ edit hoặc view
   */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      if (!id) {
        form.resetFields();
        setAttachments([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getInvestorById(id);
        if (response) {
          setAttachments(handleImage(response?.attachments ?? ''));
          
          // Load thông tin các select để hiển thị tên
          let organizationUnitValue: any = null;
          let provinceCityValue: any = null;
          let wardCommuneValue: any = null;

          if (response.organizationUnitId) {
            try {
              const orgResponse = await requestPOST<IPaginationResponse<any[]>>(`organizationunits/search`, {
                pageNumber: 1,
                pageSize: 1,
                keyword: '',
              });
              const orgItem = orgResponse.data?.data?.find(item => item.id === response.organizationUnitId);
              if (orgItem) {
                organizationUnitValue = {
                  value: orgItem.id,
                  label: orgItem.name,
                };
              }
            } catch (error) {
              // Silent fail
            }
          }

          if (response.provinceCityId) {
            try {
              const provinceResponse = await requestGET<IResult<any>>(`ProvinceCities/${response.provinceCityId}`);
              if (provinceResponse?.data?.data) {
                provinceCityValue = {
                  value: provinceResponse.data.data.id,
                  label: `${provinceResponse.data.data.code || ''} - ${provinceResponse.data.data.name || ''}`,
                };
              }
            } catch (error) {
              // Silent fail
            }
          }

          if (response.wardCommuneId) {
            try {
              const wardResponse = await requestGET<IResult<any>>(`WardCommunes/${response.wardCommuneId}`);
              if (wardResponse?.data?.data) {
                wardCommuneValue = {
                  value: wardResponse.data.data.id,
                  label: `${wardResponse.data.data.code || ''} - ${wardResponse.data.data.name || ''}`,
                };
              }
            } catch (error) {
              // Silent fail
            }
          }

          form.setFieldsValue({
            ...response,
            organizationUnitId: organizationUnitValue as any,
            provinceCityId: provinceCityValue as any,
            wardCommuneId: wardCommuneValue as any,
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

  /**
   * Xử lý đóng modal
   */
  const handleCancel = (): void => {
    form.resetFields();
    setAttachments([]);
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

      const formData: ICreateInvestorRequest | IUpdateInvestorRequest = {
        ...(id && { id }),
        name: values.name,
        code: values.code,
        taxCode: values.taxCode,
        address: values.address,
        phone: values.phone,
        email: values.email,
        representative: values.representative,
        representativePosition: values.representativePosition,
        organizationUnitId: values.organizationUnitId?.value || values.organizationUnitId,
        provinceCityId: values.provinceCityId?.value || values.provinceCityId,
        wardCommuneId: values.wardCommuneId?.value || values.wardCommuneId,
        website: values.website,
        fax: values.fax,
        bankAccount: values.bankAccount,
        bankName: values.bankName,
        description: values.description,
        attachments: handleFiles(attachments ?? []),
        sortOrder: values.sortOrder,
        isActive: values.isActive ?? true,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`Investors/${id}`, formData)
        : await requestPOST<IResult<string>>(`Investors`, formData);

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
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa' : 'Tạo mới'} chủ đầu tư</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form<IInvestor>
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
                  <Input placeholder="Mã chủ đầu tư" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Tên"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên chủ đầu tư' }]}
                >
                  <Input placeholder="Tên chủ đầu tư" />
                </Form.Item>
              </div>
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Địa chỉ" name="address">
                  <Input placeholder="Địa chỉ" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Số điện thoại" name="phone">
                  <Input placeholder="Số điện thoại" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Email" name="email">
                  <Input placeholder="Email" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Người đại diện" name="representative">
                  <Input placeholder="Người đại diện" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Chức vụ người đại diện" name="representativePosition">
                  <Input placeholder="Chức vụ người đại diện" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Mã số thuế" name="taxCode">
                  <Input placeholder="Mã số thuế" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Cơ quan đơn vị" name="organizationUnitId">
                  <OrganizationUnitTreeSelect
                    placeholder="Chọn cơ quan đơn vị"
                    useCurrentUserDefault={false}
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Tỉnh thành phố" name="provinceCityId">
                  <TDSelect
                    placeholder="Chọn tỉnh thành phố"
                    fetchOptions={async keyword => {
                      const res = await searchProvinces({
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
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Phường xã" name="wardCommuneId">
                  <TDSelect
                    placeholder="Chọn phường xã"
                    fetchOptions={async keyword => {
                      const res = await searchWards({
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
                  />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Website" name="website">
                  <Input placeholder="Website" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Fax" name="fax">
                  <Input placeholder="Fax" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Số tài khoản ngân hàng" name="bankAccount">
                  <Input placeholder="Số tài khoản ngân hàng" />
                </Form.Item>
              </div>
              <div className="col-xl-6 col-lg-6">
                <Form.Item label="Tên ngân hàng" name="bankName">
                  <Input placeholder="Tên ngân hàng" />
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
