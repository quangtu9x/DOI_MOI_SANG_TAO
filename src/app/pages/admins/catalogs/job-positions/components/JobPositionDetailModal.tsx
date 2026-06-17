import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, Form, Input, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { ICategory, ICategoryGroup, IPaginationResponse, IResult } from '@/models';
import { removeAccents } from '@/utils/utils';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { TDSelect } from '@/app/components';



export const JobPositionDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount, categoryGroupId } = props

  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as ICategory | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ICategory>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<ICategory>>(`categories/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          _data.categoryGroup = _data?.categoryGroupId
            ? {
              value: _data?.categoryGroupId,
              label: _data?.categoryGroupName,
            }
            : null;

          form.setFieldsValue(_data);
        }
      } catch (error) {
        console.error('Error fetching organization unit:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<ICategoryGroup>>(`categorygroups/${categoryGroupId}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          form.setFieldsValue({
            categoryGroup: {
              value: _data?.id,
              label: _data?.name,
            }
          });
        }
      } catch (error) {
        console.error('Error fetching organization unit:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!id && categoryGroupId) {
      fetchData();
    }
    return () => { };
  }, [categoryGroupId])

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const formData: ICategory = {
        ...values,
        ...(id && { id }),
        categoryGroupId: values?.categoryGroup?.value ?? categoryGroupId,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`categories/${id}`, formData)
        : await requestPOST<IResult<string>>(`categories`, formData);

      if (response?.status == 200) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
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
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : (id ? 'Chỉnh sửa' : 'Tạo mới')}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<ICategory> form={form}
              initialValues={{ sortOrder: totalCount + 1, isActive: true }}
              layout="vertical" autoComplete="off" disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <Input placeholder=""
                      onInput={async e => {
                        form.setFieldValue('code', removeAccents((e.target as HTMLInputElement).value));
                      }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Mã" name="code" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div hidden className="col-xl-6 col-lg-6">
                  <Form.Item label="Nhóm danh mục" name="categoryGroup" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      showSearch
                      placeholder="Lựa chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<ICategoryGroup[]>>(`categorygroups/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                        });
                        return (
                          res.data?.data?.map(item => ({
                            ...item,
                            label: item?.name,
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                      onChange={(value, current: any) => {
                        if (value) {
                          form.setFieldValue('categoryGroupId', current?.id);
                        } else {
                          form.setFieldValue('categoryGroupId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Mức độ ưu tiên" name="sortOrder" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Ghi chú" name="description">
                    <Input.TextArea rows={4} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item name="isActive" valuePropName="checked" >
                    <Checkbox>Sử dụng</Checkbox>
                  </Form.Item>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!dataModal?.readOnly && (
          <div className="d-flex justify-content-center  align-items-center">
            <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish} disabled={buttonLoading}>
            <i className="fa-regular fa-floppy-disk"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
          </div>
        )}
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

