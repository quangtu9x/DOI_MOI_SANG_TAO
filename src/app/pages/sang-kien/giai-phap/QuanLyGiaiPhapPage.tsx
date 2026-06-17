import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Modal, Descriptions, Input, Select, Badge, Empty, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { Content } from '@/_metronic/layout/components/content';

enum TrangThaiGiaiPhap {
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
  [TrangThaiGiaiPhap.DangSoanThao]: { label: 'Đang soạn thảo', color: 'default' },
  [TrangThaiGiaiPhap.ChoDuyetLan1]: { label: 'Chờ duyệt lần 1', color: 'processing' },
  [TrangThaiGiaiPhap.TraLaiSoaThao]: { label: 'Trả lại soạn thảo', color: 'warning' },
  [TrangThaiGiaiPhap.DaDuyetLan1]: { label: 'Đã duyệt lần 1', color: 'success' },
  [TrangThaiGiaiPhap.ChoDuyetLan2]: { label: 'Chờ duyệt lần 2', color: 'processing' },
  [TrangThaiGiaiPhap.TraLaiLan2]: { label: 'Trả lại lần 2', color: 'warning' },
  [TrangThaiGiaiPhap.DaDuyetLan2]: { label: 'Đã duyệt lần 2', color: 'success' },
  [TrangThaiGiaiPhap.DuocCongNhan]: { label: 'Được công nhận', color: 'success' },
  [TrangThaiGiaiPhap.KhongDuocCongNhan]: { label: 'Không được công nhận', color: 'error' },
};

interface IGiaiPhap {
  id: string;
  ma: string;
  tenGiaiPhap: string;
  linhVuc: string;
  moTa: string;
  laiSuatKyVong: number;
  noiDungGiaiPhap: string;
  canBoQuanLy: string;
  canBoQuanLyTen?: string;
  ngayTao?: string;
  trangThai: TrangThaiGiaiPhap;
  fileCount?: number;
  hoSoSangKienId?: string;
}

// Mock data
const MOCK_GIAI_PHAP_DATA: IGiaiPhap[] = [
  {
    id: '1',
    ma: 'GP-240617001',
    tenGiaiPhap: 'Blockchain cho cấp phép điện tử',
    linhVuc: 'Công nghệ blockchain',
    moTa: 'Giải pháp sử dụng blockchain để tự động hóa quy trình cấp phép',
    laiSuatKyVong: 75,
    noiDungGiaiPhap: 'Ứng dụng smart contracts tự động xử lý yêu cầu cấp phép',
    canBoQuanLy: 'nva',
    canBoQuanLyTen: 'Nguyễn Văn A',
    ngayTao: '2024-06-17',
    trangThai: TrangThaiGiaiPhap.DangSoanThao,
    fileCount: 2,
    hoSoSangKienId: 'SK-001',
  },
  {
    id: '2',
    ma: 'GP-240616001',
    tenGiaiPhap: 'Ứng dụng mobile tích hợp',
    linhVuc: 'Phát triển mobile',
    moTa: 'App mobile tích hợp tất cả dịch vụ công',
    laiSuatKyVong: 85,
    noiDungGiaiPhap: 'Phát triển native app cho iOS và Android',
    canBoQuanLy: 'ttb',
    canBoQuanLyTen: 'Trần Thị B',
    ngayTao: '2024-06-16',
    trangThai: TrangThaiGiaiPhap.ChoDuyetLan1,
    fileCount: 3,
    hoSoSangKienId: 'SK-002',
  },
  {
    id: '3',
    ma: 'GP-240615001',
    tenGiaiPhap: 'Hệ thống quản lý AI',
    linhVuc: 'Trí tuệ nhân tạo',
    moTa: 'Hệ thống AI tự động phân loại và xử lý tài liệu',
    laiSuatKyVong: 90,
    noiDungGiaiPhap: 'Sử dụng machine learning để phân loại tài liệu tự động',
    canBoQuanLy: 'lvc',
    canBoQuanLyTen: 'Lê Văn C',
    ngayTao: '2024-06-15',
    trangThai: TrangThaiGiaiPhap.DaDuyetLan1,
    fileCount: 1,
    hoSoSangKienId: 'SK-003',
  },
  {
    id: '4',
    ma: 'GP-240614001',
    tenGiaiPhap: 'Nâng cấp hạ tầng 5G',
    linhVuc: 'Công nghệ thông tin',
    moTa: 'Nâng cấp toàn bộ hạ tầng mạng lên 5G',
    laiSuatKyVong: 95,
    noiDungGiaiPhap: 'Thay thế cáp đồng bằng cáp quang và 5G',
    canBoQuanLy: 'nva',
    canBoQuanLyTen: 'Nguyễn Văn A',
    ngayTao: '2024-06-14',
    trangThai: TrangThaiGiaiPhap.DuocCongNhan,
    fileCount: 2,
    hoSoSangKienId: 'SK-004',
  },
];

export const QuanLyGiaiPhapPage = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TrangThaiGiaiPhap | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [detailRecord, setDetailRecord] = useState<IGiaiPhap | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const fields = [...new Set(MOCK_GIAI_PHAP_DATA.map(r => r.linhVuc))];

  const filteredData = useMemo(() => {
    return MOCK_GIAI_PHAP_DATA.filter(record => {
      const matchSearch = record.tenGiaiPhap.toLowerCase().includes(searchText.toLowerCase()) ||
        record.ma.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !selectedStatus || record.trangThai === selectedStatus;
      const matchField = !selectedField || record.linhVuc === selectedField;
      return matchSearch && matchStatus && matchField;
    });
  }, [searchText, selectedStatus, selectedField]);

  const handleShowDetail = (record: IGiaiPhap) => {
    setDetailRecord(record);
    setDetailVisible(true);
  };

  const handleChangeStatus = (status: string) => {
    if (detailRecord) {
      const newRecord = {
        ...detailRecord,
        trangThai: parseInt(status) as TrangThaiGiaiPhap,
      };
      setDetailRecord(newRecord);
    }
  };

  const columns = [
    {
      title: 'Mã giải pháp',
      dataIndex: 'ma',
      key: 'ma',
      width: 120,
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Tên giải pháp',
      dataIndex: 'tenGiaiPhap',
      key: 'tenGiaiPhap',
      width: '25%',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Lĩnh vực',
      dataIndex: 'linhVuc',
      key: 'linhVuc',
      width: 140,
    },
    {
      title: 'Lợi suất kỳ vọng',
      dataIndex: 'laiSuatKyVong',
      key: 'laiSuatKyVong',
      width: 110,
      render: (value: number) => (
        <span className={value >= 85 ? 'text-success font-semibold' : 'text-warning font-semibold'}>
          {value}%
        </span>
      ),
    },
    {
      title: 'Cán bộ quản lý',
      dataIndex: 'canBoQuanLyTen',
      key: 'canBoQuanLyTen',
      width: 140,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 110,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 150,
      render: (status: TrangThaiGiaiPhap) => {
        const display = TRANG_THAI_DISPLAY[status];
        return <Tag color={display.color}>{display.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, record: IGiaiPhap) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleShowDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="link" size="small" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Tooltip>
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
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">Quản lý giải pháp</h3>
            <Button type="primary" size="large">
              + Thêm giải pháp mới
            </Button>
          </div>

          <div className="card-body">
            {/* Filters */}
            <div className="mb-4 d-flex gap-2 flex-wrap align-items-end">
              <div style={{ minWidth: '250px' }}>
                <label className="form-label small mb-2">Tìm kiếm theo mã hoặc tên</label>
                <Input
                  placeholder="GP-240617001 hoặc Blockchain..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </div>
              <div style={{ minWidth: '200px' }}>
                <label className="form-label small mb-2">Lĩnh vực</label>
                <Select
                  placeholder="Chọn lĩnh vực"
                  allowClear
                  value={selectedField}
                  onChange={setSelectedField}
                  options={fields.map(f => ({ label: f, value: f }))}
                />
              </div>
              <div style={{ minWidth: '200px' }}>
                <label className="form-label small mb-2">Trạng thái</label>
                <Select
                  placeholder="Chọn trạng thái"
                  allowClear
                  options={statusOptions}
                  onChange={(value) => setSelectedStatus(value ? parseInt(value) : null)}
                />
              </div>
            </div>

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
                  size="middle"
                />
              </div>
            )}

            {/* Statistics */}
            <div className="mt-4 row g-3">
              <div className="col-md-3">
                <div className="card bg-light-info">
                  <div className="card-body text-center p-3">
                    <h6 className="mb-2">Tổng số giải pháp</h6>
                    <h3 className="mb-0 text-info">{MOCK_GIAI_PHAP_DATA.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-light-success">
                  <div className="card-body text-center p-3">
                    <h6 className="mb-2">Được công nhận</h6>
                    <h3 className="mb-0 text-success">
                      {MOCK_GIAI_PHAP_DATA.filter(r => r.trangThai === TrangThaiGiaiPhap.DuocCongNhan).length}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-light-warning">
                  <div className="card-body text-center p-3">
                    <h6 className="mb-2">Lợi suất trung bình</h6>
                    <h3 className="mb-0 text-warning">
                      {Math.round(MOCK_GIAI_PHAP_DATA.reduce((a, b) => a + b.laiSuatKyVong, 0) / MOCK_GIAI_PHAP_DATA.length)}%
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-light-danger">
                  <div className="card-body text-center p-3">
                    <h6 className="mb-2">Đang xử lý</h6>
                    <h3 className="mb-0 text-danger">
                      {MOCK_GIAI_PHAP_DATA.filter(r => [2, 5].includes(r.trangThai)).length}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Content>

      <Modal
        title={`Chi tiết giải pháp: ${detailRecord?.ma}`}
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {detailRecord && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="Mã giải pháp">
                <span className="font-semibold">{detailRecord.ma}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Tên giải pháp">
                {detailRecord.tenGiaiPhap}
              </Descriptions.Item>
              <Descriptions.Item label="Lĩnh vực">
                <Tag>{detailRecord.linhVuc}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Lợi suất kỳ vọng">
                <span className="font-semibold">{detailRecord.laiSuatKyVong}%</span>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                <div className="whitespace-pre-wrap">{detailRecord.moTa}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung giải pháp" span={2}>
                <div className="whitespace-pre-wrap">{detailRecord.noiDungGiaiPhap}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Cán bộ quản lý">
                {detailRecord.canBoQuanLyTen}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {detailRecord.ngayTao}
              </Descriptions.Item>
              <Descriptions.Item label="Tập tin đính kèm">
                <Badge count={detailRecord.fileCount} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
              <Descriptions.Item label="Hồ sơ sáng kiến">
                {detailRecord.hoSoSangKienId}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                <Select
                  style={{ width: '250px' }}
                  value={String(detailRecord.trangThai)}
                  options={statusOptions}
                  onChange={handleChangeStatus}
                />
              </Descriptions.Item>
            </Descriptions>

            <div className="p-3 bg-info-light rounded">
              <p className="text-sm mb-0">
                <FileTextOutlined /> Ghi chú: Giải pháp này liên kết với hồ sơ sáng kiến {detailRecord.hoSoSangKienId}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
