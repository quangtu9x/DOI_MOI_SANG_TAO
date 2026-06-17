import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, Spin, Table } from 'antd';
import { TableProps } from 'antd/es/table';
import { Modal, Button } from 'react-bootstrap';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IGiayChungNhanSangKien, IHoSoSangKien, IPaginationResponse, IResult, TrangThaiHoSoSangKien } from '@/models';
import { requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { toSaveDate, toViewDate } from '@/utils/utils';
import { TRANG_THAI_HO_SO_SANG_KIEN } from '@/data/sang-kien';

type GiayChungNhanSangKienFormValues = Omit<IGiayChungNhanSangKien, 'hoSoSangKiens'>;

export const GiayChungNhanSangKienDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IGiayChungNhanSangKien | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<GiayChungNhanSangKienFormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const [hoSoLoading, setHoSoLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [hoSoData, setHoSoData] = useState<IHoSoSangKien[]>([]);
  const [selectedHoSoIds, setSelectedHoSoIds] = useState<React.Key[]>([]);
  const [selectedHoSos, setSelectedHoSos] = useState<IHoSoSangKien[]>([]);

  const mergeHoSos = (selected: IHoSoSangKien[], fetched: IHoSoSangKien[]) =>
    [...selected, ...fetched].filter((item, index, array) => array.findIndex(x => x.id === item.id) === index);

  const fetchHoSoData = async (keyword: string | null = null, selected: IHoSoSangKien[] = selectedHoSos) => {
    try {
      setHoSoLoading(true);
      const response = await requestPOST<IPaginationResponse<IHoSoSangKien[]>>('HoSoSangKiens/search', {
        pageNumber: 1,
        pageSize: 1000,
        keyword,
        chuaCoGiayChungNhanSangKien: true,
        trangThai: TrangThaiHoSoSangKien.DuocCongNhan,
      });
      setHoSoData(mergeHoSos(selected, response.data?.data ?? []));
    } catch (error) {
      console.error('Error fetching dossiers:', error);
      toast.error('Không thể tải danh sách hồ sơ sáng kiến.');
    } finally {
      setHoSoLoading(false);
    }
  };

  const debouncedSearchHoSo = debounce((keyword: string) => {
    fetchHoSoData(keyword);
  }, 400);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        if (id) {
          const response = await requestGET<IResult<IGiayChungNhanSangKien>>(`GiayChungNhanSangKiens/${id}`);
          const data = response?.data?.data;
          if (data) {
            const hoSos = data.hoSoSangKiens ?? [];
            setSelectedHoSos(hoSos);
            setSelectedHoSoIds(hoSos.map(item => item.id));
            form.setFieldsValue({
              ...data,
              ngayCongNhan: toViewDate(data.ngayCongNhan),
            } as any);
            await fetchHoSoData(null, hoSos);
          }
        } else {
          form.setFieldsValue({ ngayCongNhan: dayjs() });
          await fetchHoSoData();
        }
      } catch (error) {
        console.error('Error fetching certificate:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    if (modalVisible) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible, id]);

  const handleCancel = () => {
    form.resetFields();
    setHoSoData([]);
    setSelectedHoSoIds([]);
    setSelectedHoSos([]);
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const hoSoSangKienIds = selectedHoSoIds.map(String);
      if (!hoSoSangKienIds.length) {
        toast.warning('Vui lòng chọn ít nhất một hồ sơ sáng kiến!');
        return;
      }

      const values = form.getFieldsValue(true);
      const formData: IGiayChungNhanSangKien = {
        ...values,
        ...(id && { id }),
        ngayCongNhan: toSaveDate(values.ngayCongNhan),
        hoSoSangKienIds,
        hoSoSangKienId: hoSoSangKienIds[0] ?? null,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`GiayChungNhanSangKiens/${id}`, formData)
        : await requestPOST<IResult<string>>('GiayChungNhanSangKiens', formData);

      if (response?.status === 200) {
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

  const hoSoColumns: TableProps<IHoSoSangKien>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      className: 'text-center',
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Tên sáng kiến',
      dataIndex: 'ten',
      key: 'ten',
    },
    {
      title: 'Đợt xét',
      dataIndex: 'dotXetSangKienTen',
      key: 'dotXetSangKienTen',
      width: '18%',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'donViDuocYeuCauTen',
      key: 'donViDuocYeuCauTen',
      width: '20%',
    },
    {
      title: 'Điểm TB',
      dataIndex: 'diemTrungBinh',
      key: 'diemTrungBinh',
      className: 'text-center',
      width: 100,
      render: value => value ?? '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      className: 'text-center',
      width: 140,
      render: value => {
        const trangThai = TRANG_THAI_HO_SO_SANG_KIEN.find(item => item.id === value);
        return <span className={trangThai ? trangThai.className : 'badge badge-light-secondary'}>{trangThai ? trangThai.name : 'Chưa xác định'}</span>;
      },
    },
  ];

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard scrollable onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : id ? 'Chỉnh sửa giấy chứng nhận' : 'Thêm giấy chứng nhận'}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<GiayChungNhanSangKienFormValues> form={form} layout="vertical" autoComplete="off" disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Số giấy chứng nhận" name="soGCN" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Ngày công nhận" name="ngayCongNhan" initialValue={dayjs()} rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
              </div>
            </Form>
          )}
          <div className="mt-2">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-bold text-header-td">Danh sách hồ sơ sáng kiến</div>
              <div className="btn-group w-300px">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm"
                  disabled={dataModal?.readOnly ?? false}
                  onChange={e => debouncedSearchHoSo(e.target.value)}
                />
              </div>
            </div>
            <Table<IHoSoSangKien>
              dataSource={hoSoData}
              columns={hoSoColumns}
              rowKey="id"
              size="small"
              bordered
              loading={hoSoLoading}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              rowSelection={
                dataModal?.readOnly
                  ? undefined
                  : {
                      selectedRowKeys: selectedHoSoIds,
                      preserveSelectedRowKeys: true,
                      onChange: (keys, rows) => {
                        setSelectedHoSoIds(keys);
                        setSelectedHoSos(rows);
                      },
                    }
              }
            />
          </div>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!dataModal?.readOnly && (
          <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={onFinish} disabled={buttonLoading}>
            <i className="fa-regular fa-floppy-disk"></i>
            {id ? 'Lưu cập nhật' : 'Lưu giấy chứng nhận'}
          </Button>
        )}
        <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel} disabled={buttonLoading}>
          <i className="fa-regular fa-xmark"></i>Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
