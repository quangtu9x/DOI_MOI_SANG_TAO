import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, InputNumber, Spin, Table, TableProps } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IPaginationResponse, IResult, IKeHoach } from '@/models';
import { IAnnualCapitalPlan, CapitalPlanStatus } from '@/models/ke-hoach-von';
import { handleFiles, handleImage, formatNumber } from '@/utils/utils';
import { requestGET, requestPOST, requestPUT, API_URL } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { KeHoachSelectionModal } from './KeHoachSelectionModal';
import { LOAI_BANGS, TRANG_THAIS } from '@/data';

export const AnnualCaptialPlanDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IAnnualCapitalPlan | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IAnnualCapitalPlan>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [attachments, setAttachments] = useState<TDUploadFile[]>([]);
  const [selectedKeHoachs, setSelectedKeHoachs] = useState<IKeHoach[]>([]);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IAnnualCapitalPlan>>(`annualcapitalplans/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          // Chuẩn hóa lại giá trị cơ quan đơn vị để TDSelect hiển thị tên thay vì id
          let organizationUnitValue: any = _data.organizationUnitId ?? null;

          if (_data.organizationUnitId) {
            try {
              const orgResponse = await requestGET<IResult<any>>(
                `organizationunits/${_data.organizationUnitId}`
              );

              if (orgResponse?.data?.data) {
                organizationUnitValue = {
                  value: orgResponse.data.data.id,
                  label: orgResponse.data.data.name,
                };
              }
            } catch (error) {
              // Silent fail, giữ nguyên id nếu không lấy được thông tin đơn vị
            }
          }
          setSelectedKeHoachs(_data.keHoachs ?? []);
          setAttachments(handleImage(_data?.attachments ?? ''));
          form.setFieldsValue({
            ..._data,
            organizationUnitId: organizationUnitValue as any,
            keHoachs: _data.keHoachs ?? [],
            keHoachIds: _data.keHoachIds ?? [],
          });

          // Fetch associated KeHoachs
          // const keHoachResponse = await requestPOST<IPaginationResponse<IKeHoach[]>>('KeHoachs/search', {
          //   pageSize: 1000,
          //   annualCapitalPlanId: id,
          // });
          // if (keHoachResponse?.data?.data) {
          //   setSelectedKeHoachs(keHoachResponse.data.data);
          // }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchData();
    } else {
      form.resetFields();
      setAttachments([]);
      setSelectedKeHoachs([]);
    }
  }, [id, form]);

  useEffect(() => {
    if (selectedKeHoachs.length > 0) {
      const totalCapital = selectedKeHoachs.reduce((total, item) => total + (item.nhuCauKinhPhi || 0), 0);
      form.setFieldsValue({ totalCapital });
    }
    else {
      form.setFieldsValue({ totalCapital: 0 });
    }
  }, [selectedKeHoachs]);

  const handleCancel = () => {
    form.resetFields();
    setAttachments([]);
    setSelectedKeHoachs([]);
    dispatch(actionsModal.setModalVisible(false));
  };


  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const formData: IAnnualCapitalPlan = {
        ...values,
        organizationUnitId: (values.organizationUnitId as any)?.value ?? values.organizationUnitId,
        ...(id && { id }),
        status: id ? (dataModal?.status ?? CapitalPlanStatus.Draft) : CapitalPlanStatus.Draft,
        attachments: handleFiles(attachments ?? []).join('##'),
        keHoachIds: selectedKeHoachs.map(item => item.id),
        totalCapital: selectedKeHoachs.reduce((total, item) => total + (item.nhuCauKinhPhi || 0), 0),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`annualcapitalplans/${id}`, formData)
        : await requestPOST<IResult<string>>(`annualcapitalplans`, formData);

      if (response?.data?.succeeded) {
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

  const handleKeHoachSelectionSuccess = async (selectedKeys: React.Key[]) => {
    try {
      setIsLoading(true);
      const response = await requestPOST<IPaginationResponse<IKeHoach[]>>('KeHoachs/search', {
        pageSize: 1000,
        ids: selectedKeys,
      });
      if (response?.data?.data) {
        setSelectedKeHoachs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching selected projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: TableProps<IKeHoach>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text: any, record: any, index: number) => <div>{index + 1}</div>,
    },
    {
      title: 'Tên',
      dataIndex: 'ten',
      key: 'ten',
    },
    {
      title: 'Thời gian thực hiện',
      dataIndex: 'thoiGianThucHien',
      key: 'thoiGianThucHien',
      className: 'text-center',
    },
    {
      title: 'Phân loại',
      dataIndex: 'phanLoai',
      key: 'phanLoai',
      render: (text, record) => LOAI_BANGS.find(item => item.id === record.phanLoai)?.name || ''
    },

    {
      title: 'Nhu cầu kinh phí (VNĐ)',
      dataIndex: 'nhuCauKinhPhi',
      key: 'nhuCauKinhPhi',
      className: 'text-center',
      render: data => formatNumber(data),
    },

    {
      title: 'Dự toán được duyệt (VNĐ)',
      dataIndex: 'duToanDuocDuyet',
      key: 'duToanDuocDuyet',
      className: 'text-center',
      render: data => formatNumber(data),
    },

    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      className: 'text-center',
      render: (text, record) => {
        const trangThai = TRANG_THAIS.find(item => item.id === record.trangThai);
        return (
          <span className={trangThai ? trangThai.className : 'badge badge-light-secondary'}>
            {trangThai ? trangThai.name : 'Chưa xác định'}
          </span>
        );
      }
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      className: 'text-center',
      width: '',
      render: (text: any, record: IKeHoach) => {
        return (
          <div>
            <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá"
              onClick={() => setSelectedKeHoachs(prev => prev.filter(item => item.id !== record.id))}>
              <i className="fa-regular fa-trash"></i>
            </a>
          </div >
        );
      },
    },
  ].filter(Boolean) as TableProps<IKeHoach>['columns'];

  return (
    <>
      <Modal
        show={modalVisible}
        fullscreen={true}
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
            <Form<IAnnualCapitalPlan>
              form={form}
              layout="vertical"
              autoComplete="off"
              initialValues={{ year: new Date().getFullYear() }}
              disabled={dataModal?.readOnly ?? false}
            >
              <HeaderTitle title={"Thông tin chung"} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tên kế hoạch" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="Tên kế hoạch" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Năm" name="year" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <InputNumber min={2000} max={2100} style={{ width: '100%' }} placeholder="Năm" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Mã kế hoạch" name="code">
                    <Input placeholder="Mã kế hoạch" />
                  </Form.Item>
                </div>

                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Tổng vốn (VNĐ)" name="totalCapital">
                    <InputNumber
                      disabled
                      placeholder=""
                      className='input-with-addon'
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value = '') => value.replace(/\$\s?|(,*)/g, "")}
                      style={{ width: "100%" }}
                      addonAfter="VND"
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={4} placeholder="Mô tả" />
                  </Form.Item>
                </div>
                {/* <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Vốn đã phân bổ" name="allocatedCapital">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                      placeholder="Vốn đã phân bổ"
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Vốn còn lại" name="remainingCapital">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                      placeholder="Vốn còn lại"
                    />
                  </Form.Item>
                </div> */}
                <div className="col-xl-6 col-lg-6">
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

              <div className="d-flex align-items-center justify-content-between mb-3 mt-5">
                <HeaderTitle title={"Danh sách dự án xin vốn đã duyệt"} />
                {!dataModal?.readOnly && (
                  <Button variant="primary" className="btn-sm" onClick={() => setSelectionModalVisible(true)}>
                    <i className="fa-regular fa-plus me-1"></i> Thêm dự án
                  </Button>
                )}
              </div>
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={selectedKeHoachs}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  bordered
                />
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

      {selectionModalVisible && (
        <KeHoachSelectionModal
          visible={selectionModalVisible}
          onClose={() => setSelectionModalVisible(false)}
          onSuccess={handleKeHoachSelectionSuccess}
          initialSelectedKeys={selectedKeHoachs.map(item => item.id)}
        />
      )}
    </>
  );
};