import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Modal, Descriptions, Input, Select, Badge, Tabs, Empty, Tooltip, Card, Row, Col, Statistic, Progress } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { Content } from '@/_metronic/layout/components/content';

enum TrangThaiSangKien {
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
  [TrangThaiSangKien.DangSoanThao]: { label: 'Đang soạn thảo', color: 'default' },
  [TrangThaiSangKien.ChoDuyetLan1]: { label: 'Chờ duyệt lần 1', color: 'processing' },
  [TrangThaiSangKien.TraLaiSoaThao]: { label: 'Trả lại soạn thảo', color: 'warning' },
  [TrangThaiSangKien.DaDuyetLan1]: { label: 'Đã duyệt lần 1', color: 'success' },
  [TrangThaiSangKien.ChoDuyetLan2]: { label: 'Chờ duyệt lần 2', color: 'processing' },
  [TrangThaiSangKien.TraLaiLan2]: { label: 'Trả lại lần 2', color: 'warning' },
  [TrangThaiSangKien.DaDuyetLan2]: { label: 'Đã duyệt lần 2', color: 'success' },
  [TrangThaiSangKien.DuocCongNhan]: { label: 'Được công nhận', color: 'success' },
  [TrangThaiSangKien.KhongDuocCongNhan]: { label: 'Không được công nhận', color: 'error' },
};

interface ISangKien {
  id: string;
  ma: string;
  tenSangKien: string;
  linhVuc: string;
  moTa: string;
  tacGia: string;
  donVi: string;
  ngayNop?: string;
  trangThai: TrangThaiSangKien;
  fileCount?: number;
  giaTriLaiSuat?: number;
  soGiaiPhap?: number;
  nhanXet?: string;
}

// Mock data
const MOCK_SANG_KIEN_DATA: ISangKien[] = [
  {
    id: '1',
    ma: 'SK-240617001',
    tenSangKien: 'Tối ưu hóa quy trình cấp phép',
    linhVuc: 'Cải cách hành chính',
    moTa: 'Giải pháp giảm 80% thời gian xử lý cấp phép',
    tacGia: 'Nguyễn Văn A',
    donVi: 'Phòng Đổi mới',
    ngayNop: '2024-06-17',
    trangThai: TrangThaiSangKien.ChoDuyetLan1,
    fileCount: 2,
    giaTriLaiSuat: 85,
    soGiaiPhap: 1,
  },
  {
    id: '2',
    ma: 'SK-240616001',
    tenSangKien: 'Ứng dụng mobile tích hợp',
    linhVuc: 'Chuyển đổi số',
    moTa: 'Nền tảng mobile tích hợp tất cả dịch vụ công',
    tacGia: 'Trần Thị B',
    donVi: 'Phòng Kỹ thuật',
    ngayNop: '2024-06-16',
    trangThai: TrangThaiSangKien.DaDuyetLan1,
    fileCount: 3,
    giaTriLaiSuat: 90,
    soGiaiPhap: 2,
  },
  {
    id: '3',
    ma: 'SK-240615001',
    tenSangKien: 'Hệ thống quản lý AI',
    linhVuc: 'Trí tuệ nhân tạo',
    moTa: 'Hệ thống AI tự động phân loại và xử lý tài liệu',
    tacGia: 'Lê Văn C',
    donVi: 'Phòng Tổ chức',
    ngayNop: '2024-06-15',
    trangThai: TrangThaiSangKien.DuocCongNhan,
    fileCount: 1,
    giaTriLaiSuat: 95,
    soGiaiPhap: 1,
    nhanXet: 'Giải pháp đổi mới, có giá trị cao',
  },
  {
    id: '4',
    ma: 'SK-240614001',
    tenSangKien: 'Nâng cấp hạ tầng 5G',
    linhVuc: 'Công nghệ thông tin',
    moTa: 'Nâng cấp toàn bộ hạ tầng mạng lên 5G',
    tacGia: 'Nguyễn Văn A',
    donVi: 'Phòng Đổi mới',
    ngayNop: '2024-06-14',
    trangThai: TrangThaiSangKien.KhongDuocCongNhan,
    fileCount: 2,
    giaTriLaiSuat: 75,
    nhanXet: 'Chi phí quá cao, cần xem xét lại phương án',
  },
];

export const QuanLySangKienNangCaoPage = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TrangThaiSangKien | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [detailRecord, setDetailRecord] = useState<ISangKien | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const fields = [...new Set(MOCK_SANG_KIEN_DATA.map(r => r.linhVuc))];

  const filteredData = useMemo(() => {
    return MOCK_SANG_KIEN_DATA.filter(record => {
      const matchSearch = record.tenSangKien.toLowerCase().includes(searchText.toLowerCase()) ||
        record.ma.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !selectedStatus || record.trangThai === selectedStatus;
      const matchField = !selectedField || record.linhVuc === selectedField;

      // Filter by tab
      let matchTab = true;
      if (activeTab === 'pending') matchTab = [2, 5].includes(record.trangThai);
      if (activeTab === 'approved') matchTab = record.trangThai === TrangThaiSangKien.DuocCongNhan;
      if (activeTab === 'rejected') matchTab = record.trangThai === TrangThaiSangKien.KhongDuocCongNhan;

      return matchSearch && matchStatus && matchField && matchTab;
    });
  }, [searchText, selectedStatus, selectedField, activeTab]);

  const handleShowDetail = (record: ISangKien) => {
    setDetailRecord(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'ma',
      key: 'ma',
      width: 120,
      render: (text: string) => <span className="font-semibold text-primary">{text}</span>,
    },
    {
      title: 'Tên sáng kiến',
      dataIndex: 'tenSangKien',
      key: 'tenSangKien',
      width: '30%',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Tác giả',
      dataIndex: 'tacGia',
      key: 'tacGia',
      width: 130,
      render: (text: string) => <span><UserOutlined className="me-2" />{text}</span>,
    },
    {
      title: 'Lĩnh vực',
      dataIndex: 'linhVuc',
      key: 'linhVuc',
      width: 130,
    },
    {
      title: 'Lợi suất',
      dataIndex: 'giaTriLaiSuat',
      key: 'giaTriLaiSuat',
      width: 100,
      render: (value: number) => (
        <span className={value >= 85 ? 'text-success font-semibold' : value >= 75 ? 'text-warning font-semibold' : 'text-danger font-semibold'}>
          {value}%
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 150,
      render: (status: TrangThaiSangKien) => {
        const display = TRANG_THAI_DISPLAY[status];
        return <Tag color={display.color}>{display.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: ISangKien) => (
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
        </Space>
      ),
    },
  ];

  const statusOptions = Object.entries(TRANG_THAI_DISPLAY).map(([key, value]) => ({
    label: value.label,
    value: key,
  }));

  const tabs = [
    { label: 'Tất cả', key: 'all', count: MOCK_SANG_KIEN_DATA.length },
    { label: 'Chờ duyệt', key: 'pending', count: MOCK_SANG_KIEN_DATA.filter(r => [2, 5].includes(r.trangThai)).length },
    { label: 'Được công nhận', key: 'approved', count: MOCK_SANG_KIEN_DATA.filter(r => r.trangThai === TrangThaiSangKien.DuocCongNhan).length },
    { label: 'Từ chối', key: 'rejected', count: MOCK_SANG_KIEN_DATA.filter(r => r.trangThai === TrangThaiSangKien.KhongDuocCongNhan).length },
  ];

  return (
    <>
      <Content>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng sáng kiến"
                value={MOCK_SANG_KIEN_DATA.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Được công nhận"
                value={MOCK_SANG_KIEN_DATA.filter(r => r.trangThai === TrangThaiSangKien.DuocCongNhan).length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chờ duyệt"
                value={MOCK_SANG_KIEN_DATA.filter(r => [2, 5].includes(r.trangThai)).length}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Lợi suất trung bình"
                value={Math.round(MOCK_SANG_KIEN_DATA.reduce((a, b) => a + (b.giaTriLaiSuat || 0), 0) / MOCK_SANG_KIEN_DATA.length)}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Card */}
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">Quản lý sáng kiến</h3>
            <Button type="primary" size="large">
              + Thêm sáng kiến
            </Button>
          </div>

          <div className="card-body">
            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabs.map(tab => ({
                label: `${tab.label} (${tab.count})`,
                key: tab.key,
              }))}
              className="mb-4"
            />

            {/* Filters */}
            <div className="mb-4 d-flex gap-2 flex-wrap align-items-end">
              <div style={{ minWidth: '250px' }}>
                <label className="form-label small mb-2">Tìm kiếm theo mã hoặc tên</label>
                <Input
                  placeholder="SK-240617001 hoặc tối ưu..."
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
                  scroll={{ x: 1200 }}
                />
              </div>
            )}
          </div>
        </div>
      </Content>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết sáng kiến: ${detailRecord?.ma}`}
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {detailRecord && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="Mã hồ sơ">
                <span className="font-semibold">{detailRecord.ma}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Tên sáng kiến">
                {detailRecord.tenSangKien}
              </Descriptions.Item>
              <Descriptions.Item label="Tác giả">
                <UserOutlined className="me-2" />{detailRecord.tacGia}
              </Descriptions.Item>
              <Descriptions.Item label="Đơn vị">
                {detailRecord.donVi}
              </Descriptions.Item>
              <Descriptions.Item label="Lĩnh vực">
                <Tag>{detailRecord.linhVuc}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Lợi suất kỳ vọng">
                <Progress type="circle" percent={detailRecord.giaTriLaiSuat || 0} width={50} />
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                <div className="whitespace-pre-wrap">{detailRecord.moTa}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Số giải pháp">
                <Badge count={detailRecord.soGiaiPhap} style={{ backgroundColor: '#52c41a' }} showZero />
              </Descriptions.Item>
              <Descriptions.Item label="Tập tin đính kèm">
                <Badge count={detailRecord.fileCount} style={{ backgroundColor: '#1890ff' }} />
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nộp">
                <CalendarOutlined className="me-2" />{detailRecord.ngayNop}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {(() => {
                  const display = TRANG_THAI_DISPLAY[detailRecord.trangThai];
                  return <Tag color={display.color}>{display.label}</Tag>;
                })()}
              </Descriptions.Item>
              {detailRecord.nhanXet && (
                <Descriptions.Item label="Nhận xét" span={2}>
                  <div className="p-2 bg-light rounded">
                    {detailRecord.nhanXet}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div className="p-3 bg-info-light rounded">
              <p className="text-sm mb-0">
                <FileTextOutlined /> Sáng kiến này có {detailRecord.soGiaiPhap} giải pháp liên kết
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
