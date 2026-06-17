import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, InputNumber, Checkbox, TreeSelect, Radio } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { requestPOST, requestGET, requestPUT } from '@/utils/baseAPI';
import { AppDispatch, RootState } from '@/redux/Store';
import { IOrganizationUnit, IPaginationResponse, IResult, OrganizationUnitType } from '@/models';
import * as actionsOrganizationUnit from '@/redux/organization-unit/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { TDSelect } from '@/app/components';
import { generateUniqueCode } from '@/_metronic/helpers';
import { ORGANIZATION_UNIT_TYPES } from '@/data';


const { TextArea } = Input;

export const OrganizationUnitDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props;
  const [form] = Form.useForm<IOrganizationUnit>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const modalState = useSelector((state: RootState) => state.organizationUnit.modalState);
  const [treeData, setTreeData] = useState<IOrganizationUnit[]>([]);

  const id = modalState?.type === 'edit' ? modalState?.modalData?.id : null;
  const parentId = modalState?.type === 'createChild' ? modalState?.modalData?.id : null;

  const [loadding, setLoadding] = useState(false);

  useEffect(() => {
    const fetchOrganizationUnit = async (): Promise<void> => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IOrganizationUnit>>(`organizationunits/${id}`);

        const _data = response?.data?.data ?? null;
        if (_data) {
          form.setFieldsValue(_data);
        }
      } catch (error) {
        console.error('Error fetching organization unit:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationUnit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchOrganizationUnit = async (): Promise<void> => {
      try {
        const response = await requestPOST<IPaginationResponse<IOrganizationUnit[]>>('organizationunits/search', {
          advancedSearch: {
            fields: ['name', 'code'],
            keyword: null,
          },
          allowParentCodeNull: null,
          allowParentIdNull: null,
          pageNumber: 1,
          pageSize: 100000,
          orderBy: ['name'],
        });

        if (response?.data?.data) {
          const buildTreeSelect = (items, id = null, link = "parentId") =>
            items
              .filter((item) => item[link] === id)
              .map((item) => ({
                ...item,
                title: item.name,
                key: item.code,
                value: item.id,
                children: buildTreeSelect(items, item.id),
              }));
          let treeData = buildTreeSelect(response?.data?.data ?? []);
          setTreeData(treeData);
        }
      } catch (error) {
        console.error('Fetch organization units error:', error);
      } finally {
      }
    }
    fetchOrganizationUnit()
  }, []);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsOrganizationUnit.setModalVisible({ modalVisible: false, type: null, modalData: null }));
  };

  const onFinish = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const formData: IOrganizationUnit = {
        ...values,
        ...(id && { id }),
        ...(parentId && { parentId }),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`organizationunits/${id}`, formData)
        : await requestPOST<IResult<string>>(`organizationunits`, formData);
      if (response?.data?.succeeded) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  return (
    <Modal
      show={modalState?.modalVisible}
      fullscreen={'lg-down'}
      size="xl"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical"
              initialValues={{
                code: generateUniqueCode(10),
                sortOrder: totalCount + 1,
                isActive: true,
                parentId: parentId,
                organizationUnitType: OrganizationUnitType.organization
              }} autoComplete="off">
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    label="Mã"
                    name="code"
                    rules={[
                      { required: true, message: 'Không được để trống!' },
                      {
                        pattern: /^[0-9a-zA-Z-]{1,10}$/,
                        message: 'Mã chỉ gồm 10 ký tự chữ, số và dấu gạch ngang, không chứa ký tự đặc biệt khác!'
                      }
                    ]}
                    normalize={value => value
                      ?.replace(/[^0-9a-zA-Z-]/g, '')
                      .toLowerCase()
                    }
                  >
                    <Input
                      placeholder="Nhập mã hoặc nhấn nút tạo mã mới"
                      disabled={!!id}
                      suffix={
                        !id ? (
                          <a
                            className="cursor-pointer"
                            data-toggle="m-tooltip"
                            title="Tạo mã mới"
                            onClick={() => form.setFieldsValue({ code: generateUniqueCode(10) })}
                          >
                            <i className="fa-solid fa-arrows-rotate"></i>
                          </a>
                        ) : (
                          <span
                            className="text-muted"
                            data-toggle="m-tooltip"
                            title="Không thể tạo mã mới khi chỉnh sửa"
                          >
                            <i className="fa-solid fa-arrows-rotate"></i>
                          </span>
                        )
                      }
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Mức độ ưu tiên" name="sortOrder" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    label="Nhóm cha"
                    name="parentId"
                  >
                    <TreeSelect
                      // disabled={!currentParentId && id}
                      allowClear
                      style={{ width: "100%" }}
                      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                      treeData={treeData}
                      placeholder="Chọn"
                    /* value={value}
                    onChange={onChange} */
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    name="organizationUnitType"
                    label="Loại"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <Radio.Group >
                      {ORGANIZATION_UNIT_TYPES?.map((item, key) => (
                        <Radio.Button
                          key={key}
                          value={item.id}
                        >
                          <span className='user-select-none'>{item.name}</span>
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                </div>

                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Ghi chú" name="description">
                    <TextArea rows={3} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item name="isActive" valuePropName="checked">
                    <Checkbox>Sử dụng</Checkbox>
                  </Form.Item>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish}>
            <i className="fa-regular fa-floppy-disk"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

