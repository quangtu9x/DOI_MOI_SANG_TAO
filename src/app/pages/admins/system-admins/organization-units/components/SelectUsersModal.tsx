import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, DatePicker, Form, Input, InputNumber, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'dayjs/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';

import { RootState } from '@/redux/RootReducer';
import { requestPOST, requestPUT } from '@/utils/baseAPI';
import { IPaginationResponse, IPosition, IResult } from '@/models';

import * as actionsOrganizationUnit from '@/redux/organization-unit/Actions';
import * as actionsGlobal from '@/redux/global/Actions';

import { AppDispatch } from '@/redux/Store';
import { TDSelect, TDTable, HeaderTitle } from '@/app/components';
import { SearchData } from '@/types/commons';
import { SelectUsersTable } from './SelectUsersTable';

export const SelectUsersModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const currentOrganizationUnit = useSelector((state: RootState) => state.organizationUnit.selectedOrganizationUnit);
  const modalSelectUsersVisible = useSelector((state: RootState) => state.organizationUnit.selectUsersModalVisible);
  const organizationUnitId = currentOrganizationUnit?.id ?? null;

  const [form] = Form.useForm();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState<SearchData>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsOrganizationUnit.setSelectUsersModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {

      const response = await requestPUT<IResult<string>>(`users/organization-unit`, {
        organizationUnitId: organizationUnitId,
        userIds: selectedRowKeys as string[],
      }, 'neutral');
      if (response?.status == 200) {
        toast.success('Cập nhật thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
      toast.error('Thao tác thất bại, vui lòng thử lại!');
    } finally {
      setButtonLoading(false);
    }
  };

  const onFinishFailed = (error: any) => {
    console.log(error);
  };

  return (
    <Modal
      show={modalSelectUsersVisible}
      fullscreen={'lg-down'}
      size="xl"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">{'Lựa chọn người dùng vào đơn vị'}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Form form={form} layout="horizontal" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
          <div className="row">
            <div className="col-xl-6 col-lg-6">
              <div className="btn-group me-2 w-100">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm"
                  onChange={e => {
                    setSearchData({
                      ...searchData,
                      keyword: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">

              <Form.Item label="" name="position">
                <TDSelect
                  notFoundContent="Không tìm thấy dữ liệu"
                  showSearch
                  placeholder="Lựa chọn chức vụ"
                  fetchOptions={async keyword => {
                    const res = await requestPOST<IPaginationResponse<IPosition[]>>(`positions/search`, {
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
                      setSearchData({
                        ...searchData,
                        positionId: current?.id
                      });
                    } else {
                      setSearchData({
                        ...searchData,
                        positionId: null
                      });
                    }
                  }}
                />
              </Form.Item>
            </div>
          </div>
        </Form>

        <HeaderTitle title={'Danh sách người dùng'} />
        <div className="mt-0">
          <SelectUsersTable searchData={searchData} selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys} />
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish} active={!buttonLoading}>
            <i className="fa fa-save me-2" />
            Lưu
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa fa-times me-2" />
            Huỷ
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
