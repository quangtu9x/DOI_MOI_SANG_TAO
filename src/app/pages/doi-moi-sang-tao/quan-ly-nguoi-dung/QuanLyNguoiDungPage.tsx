import { useState } from 'react';
import { Table, Input, Select, Button, Tag, Avatar, Modal, Form, Switch, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

// ─── Interfaces ───────────────────────────────────────────────────────────────

type VaiTro = 'admin' | 'reviewer' | 'member';
type TrangThaiTK = 'active' | 'inactive';

interface INguoiDung {
  id: string;
  maNV: string;
  hoTen: string;
  email: string;
  donVi: string;
  chucVu: string;
  vaiTro: VaiTro;
  trangThai: TrangThaiTK;
  soYTuong: number;
  soDuocDuyet: number;
  ngayTao: string;
  avatar?: string;
}

// ─── Mock data (Vietnam Airlines) ─────────────────────────────────────────────

const DON_VI_OPTIONS = [
  'Đoàn bay 919',
  'Xí nghiệp Kỹ thuật máy bay A76',
  'Xí nghiệp Kỹ thuật máy bay A75',
  'Ban Khai thác bay',
  'Ban Dịch vụ hành khách',
  'Ban Thương mại',
  'Ban Tài chính - Kế toán',
  'Ban Công nghệ thông tin',
  'Ban Tổ chức nhân sự',
  'Ban An toàn - Chất lượng',
  'Trung tâm Đào tạo bay',
  'Trung tâm Vận tải hàng hóa',
  'Văn phòng Tổng công ty',
];

const MOCK_NGUOI_DUNG: INguoiDung[] = [
  {
    id: '1', maNV: 'VNA-001', hoTen: 'Nguyễn Minh Tuấn', email: 'nmt@vietnamairlines.com',
    donVi: 'Đoàn bay 919', chucVu: 'Cơ trưởng', vaiTro: 'member',
    trangThai: 'active', soYTuong: 6, soDuocDuyet: 4, ngayTao: '01/01/2026',
  },
  {
    id: '2', maNV: 'VNA-002', hoTen: 'Trần Quang Hùng', email: 'tqh@vietnamairlines.com',
    donVi: 'Xí nghiệp Kỹ thuật máy bay A76', chucVu: 'Kỹ sư trưởng', vaiTro: 'reviewer',
    trangThai: 'active', soYTuong: 5, soDuocDuyet: 5, ngayTao: '05/01/2026',
  },
  {
    id: '3', maNV: 'VNA-003', hoTen: 'Phạm Thị Lan', email: 'ptl@vietnamairlines.com',
    donVi: 'Ban Khai thác bay', chucVu: 'Chuyên viên', vaiTro: 'reviewer',
    trangThai: 'active', soYTuong: 4, soDuocDuyet: 3, ngayTao: '10/01/2026',
  },
  {
    id: '4', maNV: 'VNA-004', hoTen: 'Lê Thị Hương', email: 'lth@vietnamairlines.com',
    donVi: 'Ban Dịch vụ hành khách', chucVu: 'Trưởng phòng', vaiTro: 'reviewer',
    trangThai: 'active', soYTuong: 7, soDuocDuyet: 4, ngayTao: '12/01/2026',
  },
  {
    id: '5', maNV: 'VNA-005', hoTen: 'Nguyễn Thành Nam', email: 'ntn@vietnamairlines.com',
    donVi: 'Trung tâm Đào tạo bay', chucVu: 'Huấn luyện viên bay', vaiTro: 'member',
    trangThai: 'active', soYTuong: 4, soDuocDuyet: 3, ngayTao: '15/01/2026',
  },
  {
    id: '6', maNV: 'VNA-006', hoTen: 'Hoàng Văn Đức', email: 'hvd@vietnamairlines.com',
    donVi: 'Ban Công nghệ thông tin', chucVu: 'Trưởng ban', vaiTro: 'admin',
    trangThai: 'active', soYTuong: 3, soDuocDuyet: 2, ngayTao: '20/01/2026',
  },
  {
    id: '7', maNV: 'VNA-007', hoTen: 'Vũ Thị Mai', email: 'vtm@vietnamairlines.com',
    donVi: 'Ban Thương mại', chucVu: 'Chuyên viên', vaiTro: 'member',
    trangThai: 'active', soYTuong: 2, soDuocDuyet: 1, ngayTao: '22/01/2026',
  },
  {
    id: '8', maNV: 'VNA-008', hoTen: 'Đỗ Văn Khoa', email: 'dvk@vietnamairlines.com',
    donVi: 'Ban An toàn - Chất lượng', chucVu: 'Kiểm tra viên an toàn', vaiTro: 'reviewer',
    trangThai: 'active', soYTuong: 5, soDuocDuyet: 4, ngayTao: '25/01/2026',
  },
  {
    id: '9', maNV: 'VNA-009', hoTen: 'Ngô Thị Thu', email: 'ntt@vietnamairlines.com',
    donVi: 'Xí nghiệp Kỹ thuật máy bay A75', chucVu: 'Kỹ thuật viên', vaiTro: 'member',
    trangThai: 'inactive', soYTuong: 1, soDuocDuyet: 0, ngayTao: '01/02/2026',
  },
  {
    id: '10', maNV: 'VNA-010', hoTen: 'Lưu Đình Phong', email: 'ldp@vietnamairlines.com',
    donVi: 'Ban Tài chính - Kế toán', chucVu: 'Kế toán trưởng', vaiTro: 'member',
    trangThai: 'active', soYTuong: 3, soDuocDuyet: 2, ngayTao: '05/02/2026',
  },
  {
    id: '11', maNV: 'VNA-011', hoTen: 'Trịnh Thị Bích', email: 'ttb@vietnamairlines.com',
    donVi: 'Ban Tổ chức nhân sự', chucVu: 'Chuyên viên tuyển dụng', vaiTro: 'member',
    trangThai: 'active', soYTuong: 2, soDuocDuyet: 1, ngayTao: '10/02/2026',
  },
  {
    id: '12', maNV: 'VNA-012', hoTen: 'Phạm Đức Anh', email: 'pda@vietnamairlines.com',
    donVi: 'Trung tâm Vận tải hàng hóa', chucVu: 'Giám sát khai thác', vaiTro: 'member',
    trangThai: 'inactive', soYTuong: 1, soDuocDuyet: 1, ngayTao: '15/02/2026',
  },
];

// ─── Role config ───────────────────────────────────────────────────────────────

const VAI_TRO_DISPLAY: Record<VaiTro, { label: string; color: string }> = {
  admin:    { label: 'Quản trị viên', color: 'red' },
  reviewer: { label: 'Người duyệt',   color: 'blue' },
  member:   { label: 'Thành viên',    color: 'default' },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const QuanLyNguoiDungPage = () => {
  const [data, setData] = useState<INguoiDung[]>(MOCK_NGUOI_DUNG);
  const [search, setSearch] = useState('');
  const [filterDonVi, setFilterDonVi] = useState<string | null>(null);
  const [filterVaiTro, setFilterVaiTro] = useState<VaiTro | null>(null);
  const [filterTrangThai, setFilterTrangThai] = useState<TrangThaiTK | null>(null);
  const [editUser, setEditUser] = useState<INguoiDung | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = data.filter(u => {
    const matchSearch = !search ||
      u.hoTen.toLowerCase().includes(search.toLowerCase()) ||
      u.maNV.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchDonVi    = !filterDonVi    || u.donVi    === filterDonVi;
    const matchVaiTro   = !filterVaiTro   || u.vaiTro   === filterVaiTro;
    const matchTrangThai = !filterTrangThai || u.trangThai === filterTrangThai;
    return matchSearch && matchDonVi && matchVaiTro && matchTrangThai;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleEdit = (user: INguoiDung) => {
    setEditUser(user);
    form.setFieldsValue({ vaiTro: user.vaiTro, trangThai: user.trangThai === 'active' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      setData(prev => prev.map(u =>
        u.id === editUser!.id
          ? { ...u, vaiTro: values.vaiTro, trangThai: values.trangThai ? 'active' : 'inactive' }
          : u
      ));
      setIsModalOpen(false);
      setEditUser(null);
    });
  };

  const handleToggleStatus = (id: string) => {
    setData(prev => prev.map(u =>
      u.id === id ? { ...u, trangThai: u.trangThai === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalActive  = data.filter(u => u.trangThai === 'active').length;
  const totalAdmin   = data.filter(u => u.vaiTro === 'admin').length;
  const totalReview  = data.filter(u => u.vaiTro === 'reviewer').length;
  const totalMember  = data.filter(u => u.vaiTro === 'member').length;

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns: ColumnsType<INguoiDung> = [
    {
      title: 'Nhân viên',
      key: 'hoTen',
      render: (_, r) => (
        <div className="d-flex align-items-center gap-3">
          <Avatar size={38} style={{ background: '#e7f0fa', color: '#0a65cc', fontWeight: 700, fontSize: 14 }}>
            {r.hoTen.split(' ').slice(-1)[0][0]}
          </Avatar>
          <div>
            <div className="fw-semibold text-gray-800 fs-7">{r.hoTen}</div>
            <div className="text-muted fs-8">{r.maNV} · {r.email}</div>
          </div>
        </div>
      ),
      width: 260,
    },
    {
      title: 'Đơn vị / Chức vụ',
      key: 'donVi',
      render: (_, r) => (
        <div>
          <div className="fs-7 fw-medium text-gray-700">{r.donVi}</div>
          <div className="text-muted fs-8">{r.chucVu}</div>
        </div>
      ),
      width: 220,
    },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      render: (v: VaiTro) => (
        <Tag color={VAI_TRO_DISPLAY[v].color}>{VAI_TRO_DISPLAY[v].label}</Tag>
      ),
      width: 130,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (v: TrangThaiTK, r) => (
        <Switch
          checked={v === 'active'}
          checkedChildren="Hoạt động"
          unCheckedChildren="Khoá"
          onChange={() => handleToggleStatus(r.id)}
          size="small"
        />
      ),
      width: 130,
    },
    {
      title: 'Ý tưởng',
      key: 'ytg',
      render: (_, r) => (
        <div className="text-center">
          <div className="fs-7 fw-bold text-primary">{r.soYTuong}</div>
          <div className="text-muted fs-8">{r.soDuocDuyet} duyệt</div>
        </div>
      ),
      width: 90,
      align: 'center',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 110,
      render: v => <span className="text-muted fs-8">{v}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, r) => (
        <Tooltip title="Chỉnh sửa vai trò / trạng thái">
          <Button size="small" type="default" onClick={() => handleEdit(r)}>
            <i className="fa-regular fa-pen-to-square me-1" /> Sửa
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="container-fluid py-6 px-7">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-6">
        <div>
          <h1 className="fs-3 fw-bold text-gray-900 mb-1">Quản lý người dùng</h1>
          <p className="text-muted fs-7">Quản lý tài khoản và phân quyền nhân viên trong hệ thống đổi mới sáng tạo</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="row g-4 mb-6">
        {[
          { label: 'Tổng tài khoản',  value: data.length,    icon: 'fa-users',        color: '#0a65cc', bg: '#e7f0fa' },
          { label: 'Đang hoạt động',  value: totalActive,    icon: 'fa-circle-check', color: '#059669', bg: '#ecfdf5' },
          { label: 'Quản trị viên',   value: totalAdmin,     icon: 'fa-shield-check', color: '#dc2626', bg: '#fef2f2' },
          { label: 'Người duyệt',     value: totalReview,    icon: 'fa-user-check',   color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Thành viên',      value: totalMember,    icon: 'fa-user',         color: '#d97706', bg: '#fffbeb' },
        ].map((s, i) => (
          <div className="col-6 col-md-4 col-xl" key={i}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 p-4">
                <div className="rounded-xl d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 44, height: 44, background: s.bg }}>
                  <i className={`fa-regular ${s.icon} fs-5`} style={{ color: s.color }} />
                </div>
                <div>
                  <div className="fs-4 fw-bold text-gray-900">{s.value}</div>
                  <div className="text-muted fs-8">{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <Input
              placeholder="Tìm theo tên, mã NV, email..."
              prefix={<i className="fa-regular fa-search text-muted" />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 260 }}
              allowClear
            />
            <Select
              placeholder="Đơn vị"
              allowClear
              style={{ width: 220 }}
              value={filterDonVi}
              onChange={v => setFilterDonVi(v ?? null)}
              options={DON_VI_OPTIONS.map(d => ({ value: d, label: d }))}
            />
            <Select
              placeholder="Vai trò"
              allowClear
              style={{ width: 160 }}
              value={filterVaiTro}
              onChange={v => setFilterVaiTro(v ?? null)}
              options={[
                { value: 'admin',    label: 'Quản trị viên' },
                { value: 'reviewer', label: 'Người duyệt' },
                { value: 'member',   label: 'Thành viên' },
              ]}
            />
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: 140 }}
              value={filterTrangThai}
              onChange={v => setFilterTrangThai(v ?? null)}
              options={[
                { value: 'active',   label: '✅ Hoạt động' },
                { value: 'inactive', label: '🔒 Khoá' },
              ]}
            />
            <span className="text-muted fs-8 ms-auto">
              Hiển thị <strong>{filtered.length}</strong> / {data.length} tài khoản
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showSizeChanger: false, showTotal: t => `${t} tài khoản` }}
            rowClassName={r => r.trangThai === 'inactive' ? 'opacity-50' : ''}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center gap-2">
            <i className="fa-regular fa-user-pen text-primary fs-5" />
            <span>Chỉnh sửa tài khoản: <strong>{editUser?.hoTen}</strong></span>
          </div>
        }
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => { setIsModalOpen(false); setEditUser(null); }}
        okText="Lưu thay đổi"
        cancelText="Huỷ"
        width={480}
      >
        {editUser && (
          <div className="mb-4 p-3 bg-light rounded">
            <div className="fs-7 text-muted">Mã NV: <strong>{editUser.maNV}</strong></div>
            <div className="fs-7 text-muted">Đơn vị: <strong>{editUser.donVi}</strong></div>
            <div className="fs-7 text-muted">Chức vụ: <strong>{editUser.chucVu}</strong></div>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item name="vaiTro" label="Vai trò trong hệ thống" rules={[{ required: true }]}>
            <Select options={[
              { value: 'admin',    label: '🔴 Quản trị viên — toàn quyền hệ thống' },
              { value: 'reviewer', label: '🔵 Người duyệt — xét duyệt ý tưởng' },
              { value: 'member',   label: '⬜ Thành viên — gửi và theo dõi ý tưởng' },
            ]} />
          </Form.Item>
          <Form.Item name="trangThai" label="Trạng thái tài khoản" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khoá" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
