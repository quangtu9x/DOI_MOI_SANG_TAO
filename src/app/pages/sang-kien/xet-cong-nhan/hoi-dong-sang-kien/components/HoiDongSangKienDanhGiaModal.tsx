import { useEffect, useMemo, useState } from 'react';
import { Form, Spin, Table, Tag } from 'antd';
import { TableProps } from 'antd/es/table';
import { DefaultOptionType } from 'antd/lib/select';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { TDSelect } from '@/app/components';
import {
  IHoiDongSangKien,
  IHoiDongSangKienThanhVienDanhGia,
  IHoSoSangKien,
  IPaginationResponse,
  IResult,
  IThanhVienDanhGiaHoiDongSangKien,
  TrangThaiHoSoSangKien,
} from '@/models';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { toViewDateString } from '@/utils/utils';

interface HoiDongSangKienDanhGiaModalProps {
  hoiDong: IHoiDongSangKien;
  show: boolean;
  onClose: () => void;
}

export const HoiDongSangKienDanhGiaModal: React.FC<HoiDongSangKienDanhGiaModalProps> = ({ hoiDong, show, onClose }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHoSoId, setSelectedHoSoId] = useState<string | null>(null);
  const [data, setData] = useState<IThanhVienDanhGiaHoiDongSangKien[]>([]);

  const daDanhGia = useMemo(() => data.filter(item => item.daDanhGia), [data]);
  const chuaDanhGia = useMemo(() => data.filter(item => !item.daDanhGia), [data]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedHoSoId) {
        setData([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IHoiDongSangKienThanhVienDanhGia>>(
          `HoiDongDanhGias/${hoiDong.id}/thanh-vien-danh-gia?hoSoSangKienId=${selectedHoSoId}`
        );
        setData(response?.data?.data?.thanhViens ?? []);
      } catch (error) {
        console.error('Error fetching council evaluation members:', error);
        toast.error('Không thể tải danh sách thành viên đánh giá. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hoiDong.id, selectedHoSoId]);

  const handleCancel = () => {
    form.resetFields();
    setSelectedHoSoId(null);
    setData([]);
    onClose();
  };

  const columns: TableProps<IThanhVienDanhGiaHoiDongSangKien>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (_text, _record, index) => <div>{index + 1}</div>,
    },
    {
      title: 'Thành viên hội đồng',
      dataIndex: 'chuyenGiaHoTen',
      key: 'chuyenGiaHoTen',
    },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      width: '20%',
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'ngayLapPhieu',
      key: 'ngayLapPhieu',
      width: 140,
      className: 'text-center',
      render: data => toViewDateString(data),
    },
    {
      title: 'Tổng điểm',
      dataIndex: 'tongDiem',
      key: 'tongDiem',
      width: 100,
      className: 'text-center',
    },
  ];

  return (
    <Modal show={show} fullscreen={'lg-down'} size="xl" keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Theo dõi đánh giá sáng kiến</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical" autoComplete="off">
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <Form.Item label="Hồ sơ sáng kiến" name="hoSoSangKien" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <TDSelect
                    notFoundContent="Không tìm thấy dữ liệu"
                    reload
                    showSearch
                    placeholder="Chọn hồ sơ sáng kiến"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<IHoSoSangKien[]>>(`hososangkiens/search`, {
                        pageNumber: 1,
                        pageSize: 1000,
                        keyword,
                        hoiDongDanhGiaId: hoiDong.id,
                        trangThais: [TrangThaiHoSoSangKien.DangThamDinh, TrangThaiHoSoSangKien.DuocCongNhan, TrangThaiHoSoSangKien.KhongCongNhan],
                      });
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.ten,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    onChange={(value, current?: DefaultOptionType | DefaultOptionType[]) => {
                      const currentOption = Array.isArray(current) ? current[0] : current;
                      const currentId = typeof currentOption?.id === 'string' ? currentOption.id : null;
                      setSelectedHoSoId(value ? currentId : null);
                    }}
                  />
                </Form.Item>
              </div>
            </div>

            <div className="d-flex gap-2 flex-wrap mb-3">
              <Tag color="success">Đã đánh giá: {daDanhGia.length}</Tag>
              <Tag color="warning">Chưa đánh giá: {chuaDanhGia.length}</Tag>
            </div>

            <div className="card-dashboard-body table-responsive mb-4">
              <h5 className="fs-6 fw-bold mb-2">Danh sách Thành viên hội đồng đã đánh giá</h5>
              <Table dataSource={daDanhGia} pagination={false} rowKey="id" size="small" bordered columns={columns} />
            </div>

            <div className="card-dashboard-body table-responsive">
              <h5 className="fs-6 fw-bold mb-2">Danh sách Thành viên hội đồng chưa đánh giá</h5>
              <Table dataSource={chuaDanhGia} pagination={false} rowKey="id" size="small" bordered columns={columns} />
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
