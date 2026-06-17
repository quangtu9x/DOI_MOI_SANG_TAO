import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, Spin, Table } from 'antd';
import { TableProps } from 'antd/es/table';
import { Modal, Button } from 'react-bootstrap';
import dayjs from 'dayjs';

import * as actionsGlobal from '@/redux/global/Actions';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import { IHoSoSangKien, IKetQuaSangKien, IPaginationResponse, IResult, TrangThaiHoSoSangKien } from '@/models';
import { API_URL, requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { TRANG_THAI_HO_SO_SANG_KIEN } from '@/data/sang-kien';
import debounce from 'lodash/debounce';
import { FileUpload } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';

type KetQuaSangKienFormValues = Omit<IKetQuaSangKien, 'hoSoSangKiens'>;

interface Props {
  visible: boolean;
  record?: IKetQuaSangKien | null;
  initialHoSoIds?: string[];
  initialHoSos?: IHoSoSangKien[];
  onClose: () => void;
}

export const KetQuaSangKienDetailModal = ({ visible, record, initialHoSoIds = [], initialHoSos = [], onClose }: Props) => {
  const dispatch: AppDispatch = useDispatch();
  const [form] = Form.useForm<KetQuaSangKienFormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const [hoSoLoading, setHoSoLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [hoSoData, setHoSoData] = useState<IHoSoSangKien[]>([]);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [selectedHoSoIds, setSelectedHoSoIds] = useState<React.Key[]>([]);
  const [selectedHoSos, setSelectedHoSos] = useState<IHoSoSangKien[]>([]);

  const id = record?.id ?? null;

  const mergeHoSos = (selected: IHoSoSangKien[], fetched: IHoSoSangKien[]) =>
    [...selected, ...fetched].filter((item, index, array) => array.findIndex(x => x.id === item.id) === index);

  const fetchHoSoData = async (keyword: string | null = null, selected: IHoSoSangKien[] = selectedHoSos) => {
    try {
      setHoSoLoading(true);
      const response = await requestPOST<IPaginationResponse<IHoSoSangKien[]>>('HoSoSangKiens/search', {
        pageNumber: 1,
        pageSize: 1000,
        keyword,
        chuaCoKetQua: true,
        trangThais: [TrangThaiHoSoSangKien.DangThamDinh, TrangThaiHoSoSangKien.DuocCongNhan, TrangThaiHoSoSangKien.KhongCongNhan],
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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (id) {
          const response = await requestGET<IResult<IKetQuaSangKien>>(`KetQuaSangKiens/${id}`);
          const data = response?.data?.data;
          if (data) {
            const hoSos = data.hoSoSangKiens ?? [];
            setSelectedHoSos(hoSos);
            setSelectedHoSoIds(hoSos.map(item => item.id));
            setDinhKem(handleImage(data?.dinhKem ?? ''));
            form.setFieldsValue({
              ...data,
              ngayRaKetQua: toViewDate(data.ngayRaKetQua),
            } as any);
            await fetchHoSoData(null, hoSos);
          }
        } else {
          let hoSos = initialHoSos;
          if (!hoSos.length && initialHoSoIds.length) {
            const response = await requestPOST<IPaginationResponse<IHoSoSangKien[]>>('HoSoSangKiens/search', {
              pageNumber: 1,
              pageSize: 1000,
              ids: initialHoSoIds,
            });
            hoSos = response.data?.data ?? [];
          }
          setSelectedHoSos(hoSos);
          setSelectedHoSoIds(hoSos.map(item => item.id));
          form.setFieldsValue({
            ngayRaKetQua: dayjs(),
          });
          await fetchHoSoData(null, hoSos);
        }
      } catch (error) {
        console.error('Error fetching result:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    if (visible) {
      fetchData();
    }
  }, [visible, id, form, initialHoSoIds, initialHoSos]);

  const handleCancel = () => {
    form.resetFields();
    setHoSoData([]);
    setSelectedHoSoIds([]);
    setSelectedHoSos([]);
    onClose();
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);
      const hoSoSangKienIds = selectedHoSoIds.map(String);
      if (!hoSoSangKienIds.length) {
        toast.warning('Vui lòng chọn ít nhất một hồ sơ sáng kiến!');
        return;
      }

      const formData: IKetQuaSangKien = {
        ...values,
        ...(id && { id }),
        ngayRaKetQua: toSaveDate(values.ngayRaKetQua),
        hoSoSangKienIds,
        hoSoSangKienId: hoSoSangKienIds[0] ?? null,
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`KetQuaSangKiens/${id}`, formData)
        : await requestPOST<IResult<string>>('KetQuaSangKiens', formData);

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
      setDinhKem([]);
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
    <Modal show={visible} fullscreen={'lg-down'} size="xl" keyboard scrollable onEscapeKeyDown={handleCancel} onExited={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">{id ? 'Chỉnh sửa kết quả sáng kiến' : 'Thêm kết quả sáng kiến'}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form form={form} layout="vertical" autoComplete="off">
              <div className="row">
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Số quyết định" name="soQuyetDinh" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ngày quyết định" name="ngayRaKetQua" initialValue={dayjs()} rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Đơn vị ban hành" name="donViBanHanh" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Nhận xét chung" name="nhanXetChung">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Đính kèm" name="dinhKem">
                    <FileUpload
                      accept={['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc']}
                      multiple={false}
                      URL={`${API_URL}/api/v1/attachments/public`}
                      maxCount={2}
                      fileList={dinhKem}
                      onChange={e => {
                        setDinhKem(e.fileList);
                      }}
                    />
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
              rowSelection={{
                selectedRowKeys: selectedHoSoIds,
                preserveSelectedRowKeys: true,
                onChange: (keys, rows) => {
                  setSelectedHoSoIds(keys);
                  setSelectedHoSos(rows);
                },
              }}
            />
          </div>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={onFinish} disabled={buttonLoading}>
          <i className="fa-regular fa-floppy-disk"></i>
          {id ? 'Lưu cập nhật' : 'Lưu kết quả'}
        </Button>
        <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel} disabled={buttonLoading}>
          <i className="fa-regular fa-xmark"></i>Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
