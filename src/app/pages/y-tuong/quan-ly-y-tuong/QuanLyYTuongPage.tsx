import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Modal, Descriptions, Input, Select, Badge, Empty } from 'antd';
import { Content } from '@/_metronic/layout/components/content';

enum TrangThaiYTuong {
  DangSoanThao = 1,
  ChoDuyetLan1 = 2,
  TraLaiSoaThao = 3,
  DaDuyetLan1 = 4,
  ChoDuyetLan2 = 5,
  TraLaiLan2 = 6,
  DaDuyetLan2 = 7,
  DuocCongNhan = 8,
  KhongDuocCongNhan = 9,
}

const TRANG_THAI_DISPLAY = {
  [TrangThaiYTuong.DangSoanThao]: { label: 'Đang soạn thảo', color: 'default' },
  [TrangThaiYTuong.ChoDuyetLan1]: { label: 'Chờ duyệt lần 1', color: 'processing' },
  [TrangThaiYTuong.TraLaiSoaThao]: { label: 'Trả lại soạn thảo', color: 'warning' },
  [TrangThaiYTuong.DaDuyetLan1]: { label: 'Đã duyệt lần 1', color: 'success' },
  [TrangThaiYTuong.ChoDuyetLan2]: { label: 'Chờ duyệt lần 2', color: 'processing' },
  [TrangThaiYTuong.TraLaiLan2]: { label: 'Trả lại lần 2', color: 'warning' },
  [TrangThaiYTuong.DaDuyetLan2]: { label: 'Đã duyệt lần 2', color: 'success' },
  [TrangThaiYTuong.DuocCongNhan]: { label: 'Được công nhận', color: 'success' },
  [TrangThaiYTuong.KhongDuocCongNhan]: { label: 'Không được công nhận', color: 'error' },
};

interface IYTuong {
  id: string;
  ma: string;
  tenYTuong: string;
  linhVuc: string;
  moTaVanDe: string;
  noiDungDeXuat: string;
  mucTieu: string;
  canBoQuanLy: string;
  canBoQuanLyTen?: string;
  ngayNop?: string;
  trangThai: TrangThaiYTuong;
  tguiYeuCau?: string;
  fileCount?: number;
}

// Mock data
const MOCK_Y_TUONG_DATA: IYTuong[] = [
  {
    id: '1',
    ma: 'YT-240617001',
    tenYTuong: 'Tối ưu hóa quy trình cấp phép hoạt động',
    linhVuc: 'Cải cách hành chính',
    moTaVanDe: 'Quy trình cấp phép hiện tại mất 15 ngày làm việc, rất cồng kềnh',
    noiDungDeXuat: 'Ứng dụng công nghệ blockchain để tự động hóa quy trình cấp phép',
    mucTieu: 'Giảm thời gian cấp phép xuống còn 3 ngày làm việc',
    canBoQuanLy: 'nva',
    canBoQuanLyTen: 'Nguyễn Văn A',
    ngayNop: '2024-06-17',
    trangThai: TrangThaiYTuong.DangSoanThao,
    fileCount: 2,
  },
  {
    id: '2',
    ma: 'YT-240616001',
    tenYTuong: 'Phát triển ứng dụng mobile cho công dân',
    linhVuc: 'Chuyển đổi số',
    moTaVanDe: 'Công dân khó tiếp cận các dịch vụ công trực tuyến',
    noiDungDeXuat: 'Phát triển ứng dụng mobile tích hợp các dịch vụ công phổ biến',
    mucTieu: 'Tăng 50% lượng người dùng dịch vụ công',
    canBoQuanLy: 'ttb',
    canBoQuanLyTen: 'Trần Thị B',
    ngayNop: '2024-06-16',
    trangThai: TrangThaiYTuong.ChoDuyetLan1,
    fileCount: 1,
  },
  {
    id: '3',
    ma: 'YT-240615001',
    tenYTuong: 'Hệ thống quản lý tài liệu thông minh',
    linhVuc: 'Công nghệ thông tin',
    moTaVanDe: 'Quản lý tài liệu thủ công gây lãng phí thời gian',
    noiDungDeXuat: 'Phát triển hệ thống quản lý tài liệu với AI tự động phân loại',
    mucTieu: 'Tiết kiệm 30% thời gian xử lý tài liệu',
    canBoQuanLy: 'lvc',
    canBoQuanLyTen: 'Lê Văn C',
    ngayNop: '2024-06-15',
    trangThai: TrangThaiYTuong.DaDuyetLan1,
    fileCount: 3,
  },
  {
    id: '4',
    ma: 'YT-240614001',
    tenYTuong: 'Nâng cấp hạ tầng mạng công vụ',
    linhVuc: 'Công nghệ thông tin',
    moTaVanDe: 'Hạ tầng mạng hiện tại không đủ bandwidth cho tất cả người dùng',
    noiDungDeXuat: 'Nâng cấp tất cả các tuyến mạng lên 5G và cáp quang',
    mucTieu: 'Tăng tốc độ mạng lên 10x',
    canBoQuanLy: 'nva',
    canBoQuanLyTen: 'Nguyễn Văn A',
    ngayNop: '2024-06-14',
    trangThai: TrangThaiYTuong.DuocCongNhan,
    fileCount: 2,
  },
];

export const QuanLyYTuongPage = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TrangThaiYTuong | null>(null);
  const [detailRecord, setDetailRecord] = useState<IYTuong | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const filteredData = useMemo(() => {
    return MOCK_Y_TUONG_DATA.filter(record => {
      const matchSearch = record.tenYTuong.toLowerCase().includes(searchText.toLowerCase()) ||
        record.ma.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !selectedStatus || record.trangThai === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [searchText, selectedStatus]);

  const handleShowDetail = (record: IYTuong) => {
    setDetailRecord(record);
    setDetailVisible(true);
  };

  const handleChangeStatus = (status: string) => {
    if (detailRecord) {
      const newRecord = {
        ...detailRecord,
        trangThai: parseInt(status) as TrangThaiYTuong,
      };
      setDetailRecord(newRecord);
      // Trong thực tế, sẽ gọi API để cập nhật
    }
  };

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'ma',
      key: 'ma',
      width: 120,
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Tên ý tưởng',
      dataIndex: 'tenYTuong',
      key: 'tenYTuong',
      width: '25%',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Lĩnh vực',
      dataIndex: 'linhVuc',
      key: 'linhVuc',
      width: 120,
    },
    {
      title: 'Cán bộ tiếp nhận',
      dataIndex: 'canBoQuanLyTen',
      key: 'canBoQuanLyTen',
      width: 140,
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'ngayNop',
      key: 'ngayNop',
      width: 110,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 150,
      render: (status: TrangThaiYTuong) => {
        const display = TRANG_THAI_DISPLAY[status];
        return <Tag color={display.color}>{display.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: IYTuong) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleShowDetail(record)}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  const statusOptions = Object.entries(TRANG_THAI_DISPLAY).map(([key, value]) => ({
    label: value.label,
    value: key,
  }));

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">Quản lý ý tưởng</h3>
            <div className="card-toolbar">
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: '250px' }}>
                  <Input
                    placeholder="Tìm kiếm theo mã hoặc tên..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <div style={{ width: '200px' }}>
                  <Select
                    placeholder="Lọc theo trạng thái"
                    allowClear
                    options={statusOptions}
                    onChange={(value) => setSelectedStatus(value ? parseInt(value) : null)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card-body">
            {filteredData.length === 0 ? (
              <Empty description="Không có dữ liệu" />
            ) : (
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  bordered
                />
              </div>
            )}
          </div>
        </div>
      </Content>

      <Modal
        title={`Chi tiết ý tưởng: ${detailRecord?.ma}`}
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {detailRecord && (
          <div>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="Mã hồ sơ">
                <span className="font-semibold">{detailRecord.ma}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Tên ý tưởng">
                {detailRecord.tenYTuong}
              </Descriptions.Item>
              <Descriptions.Item label="Lĩnh vực">
                <Tag>{detailRecord.linhVuc}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả vấn đề">
                <div className="whitespace-pre-wrap">{detailRecord.moTaVanDe}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung ý tưởng">
                <div className="whitespace-pre-wrap">{detailRecord.noiDungDeXuat}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Mục tiêu">
                <div className="whitespace-pre-wrap">{detailRecord.mucTieu}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Cán bộ tiếp nhận">
                {detailRecord.canBoQuanLyTen}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nộp">
                {detailRecord.ngayNop}
              </Descriptions.Item>
              <Descriptions.Item label="Tập tin đính kèm">
                <Badge count={detailRecord.fileCount} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Select
                  style={{ width: '200px' }}
                  value={String(detailRecord.trangThai)}
                  options={statusOptions}
                  onChange={handleChangeStatus}
                />
              </Descriptions.Item>
            </Descriptions>

            <div className="p-3 bg-info-light rounded">
              <p className="text-sm mb-0">
                💬 Ghi chú: Bạn có thể cập nhật trạng thái ý tưởng ở trên và nhấp "Lưu" để cập nhật.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
