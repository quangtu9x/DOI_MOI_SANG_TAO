import React, { useEffect, useState } from 'react';
import { Alert, Tag, Table, Progress, Empty, Spin, Statistic, Row, Col, Checkbox, DatePicker, Space, Button, Select, Dropdown, Menu } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { getIdeaDashboard, getIdeaContributions } from '@/app/services/ideaPortalApi';
import type { IIdeaDashboard, IIdeaContributionReport } from '@/models/idea-portal';

// ─────────────────────────────────────────────────────────────────────────────
// Trang tổng hợp minh họa đầy đủ 19 nhóm báo cáo theo đặc tả IV.1–IV.19.
// Những phần đã có API thật (Ý tưởng/ĐMST) hiển thị số liệu thật, có gắn nhãn
// "Dữ liệu thật". Những phần chưa có module tương ứng trong hệ thống (chiến dịch,
// quỹ thưởng, ví điện tử, quà tặng, CĐS/R&D/Sandbox, ROI, dashboard theo vai trò,
// tùy biến dashboard, sử dụng hệ thống...) dùng SỐ LIỆU GIẢ LẬP để minh họa giao
// diện, gắn nhãn rõ "DỮ LIỆU MINH HỌA" — chưa kết nối dữ liệu/API thật.
// ─────────────────────────────────────────────────────────────────────────────

const fmtNum = (v?: number | null) => (v ?? 0).toLocaleString('vi-VN');
const fmtVnd = (v?: number | null) => `${(v ?? 0).toLocaleString('vi-VN')} đ`;

// ── Màu sắc theo loại dữ liệu ────────────────────────────────────────────────
const DATA_KIND_CONFIG = {
  real:    { color: '#22c55e', text: 'Dữ liệu thật' },
  partial: { color: '#3b82f6', text: 'Một phần dữ liệu thật · một phần minh họa' },
  mock:    { color: '#f59e0b', text: 'Dữ liệu minh họa' },
};

const SectionCard: React.FC<{
  code: string; title: string; desc: string; kind: 'real' | 'partial' | 'mock'; anchorId: string;
  children: React.ReactNode;
}> = ({ code, title, desc, kind, anchorId, children }) => (
  <div id={anchorId} className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12, scrollMarginTop: 90 }}>
    <div className="card-body p-5">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
        <div>
          <span className="badge badge-light-primary fw-bold me-2">{code}</span>
          <span className="fw-bold fs-5 text-gray-900">{title}</span>
        </div>
        <span className="fs-7" style={{ color: DATA_KIND_CONFIG[kind].color, fontStyle: 'italic' }}>
          {DATA_KIND_CONFIG[kind].text}
        </span>
      </div>
      <p className="text-muted fs-7 mb-4">{desc}</p>
      {children}
    </div>
  </div>
);

// ── Danh mục 19 mục — dùng cho mục lục ───────────────────────────────────────
const TOC: Array<{ id: string; code: string; title: string; kind: 'real' | 'partial' | 'mock' }> = [
  { id: 'iv1',  code: 'IV.1',  title: 'Tổng quan Dashboard điều hành',                     kind: 'partial' },
  { id: 'iv2',  code: 'IV.2',  title: 'Dashboard theo vai trò',                             kind: 'mock' },
  { id: 'iv3',  code: 'IV.3',  title: 'Tùy biến Dashboard',                                 kind: 'mock' },
  { id: 'iv4',  code: 'IV.4',  title: 'Báo cáo Ý tưởng/Giải pháp/Sáng kiến',                kind: 'partial' },
  { id: 'iv5',  code: 'IV.5',  title: 'Báo cáo hiệu quả ĐMST',                              kind: 'mock' },
  { id: 'iv6',  code: 'IV.6',  title: 'Báo cáo quy trình xử lý & SLA',                      kind: 'partial' },
  { id: 'iv7',  code: 'IV.7',  title: 'Báo cáo đóng góp cá nhân/đơn vị',                    kind: 'partial' },
  { id: 'iv8',  code: 'IV.8',  title: 'Bảng xếp hạng (Leaderboard)',                        kind: 'real' },
  { id: 'iv9',  code: 'IV.9',  title: 'Báo cáo tương tác hệ thống',                         kind: 'partial' },
  { id: 'iv10', code: 'IV.10', title: 'Báo cáo chiến dịch ĐMST',                            kind: 'mock' },
  { id: 'iv11', code: 'IV.11', title: 'Báo cáo chương trình/dự án CĐS/R&D/Sandbox',         kind: 'mock' },
  { id: 'iv12', code: 'IV.12', title: 'Dashboard tiến độ CĐS/R&D/Sandbox',                  kind: 'mock' },
  { id: 'iv13', code: 'IV.13', title: 'Báo cáo Quỹ phát triển KHCN',                        kind: 'mock' },
  { id: 'iv14', code: 'IV.14', title: 'Báo cáo chi thưởng',                                 kind: 'mock' },
  { id: 'iv15', code: 'IV.15', title: 'Báo cáo ví và giao dịch',                            kind: 'mock' },
  { id: 'iv16', code: 'IV.16', title: 'Báo cáo quy đổi quà tặng',                           kind: 'mock' },
  { id: 'iv17', code: 'IV.17', title: 'Báo cáo ngân sách & ROI',                            kind: 'mock' },
  { id: 'iv18', code: 'IV.18', title: 'Báo cáo người dùng & sử dụng hệ thống',               kind: 'mock' },
  { id: 'iv19', code: 'IV.19', title: 'Xuất báo cáo',                                       kind: 'real' },
];

// ── Mock: Dashboard theo vai trò (IV.2) ──────────────────────────────────────
const ROLE_VIEWS = [
  { role: 'CBNV', icon: 'fa-user', color: 'primary',
    kpis: ['Ý tưởng của tôi: 4', 'Điểm thưởng cá nhân: 850đ quy đổi', 'Huy hiệu đạt được: 2'] },
  { role: 'Lãnh đạo đơn vị', icon: 'fa-user-tie', color: 'info',
    kpis: ['Ý tưởng đơn vị: 37', 'Tỷ lệ duyệt đơn vị: 62%', 'Xếp hạng đơn vị: #4/28'] },
  { role: 'Lãnh đạo TCT', icon: 'fa-building-columns', color: 'success',
    kpis: ['Tổng ý tưởng toàn TCT: 512', 'Ngân sách quỹ đã dùng: 41%', 'Chiến dịch đang chạy: 3'] },
  { role: 'Quản trị hệ thống', icon: 'fa-user-gear', color: 'danger',
    kpis: ['Người dùng hoạt động: 1.204', 'Tồn đọng quá hạn: 18 hồ sơ', 'Nhật ký đăng nhập: 8.2k/tháng'] },
];

// ── Mock: Hiệu quả ĐMST (IV.5) ───────────────────────────────────────────────
const HIEU_QUA_DATA = [
  { ten: 'AI dự đoán nhu cầu nhiên liệu tối ưu theo tuyến bay', tietKiem: 6800000000, doanhThu: 0, nhanRong: 4, chatLuong: 'Cao' },
  { ten: 'Số hóa check-in nội địa', tietKiem: 1200000000, doanhThu: 350000000, nhanRong: 8, chatLuong: 'Cao' },
  { ten: 'Blended learning đào tạo phi công & tiếp viên', tietKiem: 900000000, doanhThu: 0, nhanRong: 2, chatLuong: 'Trung bình' },
  { ten: 'Hệ thống phản hồi hành khách qua QR', tietKiem: 250000000, doanhThu: 180000000, nhanRong: 12, chatLuong: 'Cao' },
];

// ── Mock: Chiến dịch ĐMST (IV.10) ────────────────────────────────────────────
const CAMPAIGNS = [
  { ten: 'Sáng kiến Xanh 2026', trangThai: 'Đang diễn ra', ngUoiThamGia: 218, soNop: 64, tyLeHoanThanh: 58, tongThuong: 45000000, huyHieu: 12 },
  { ten: 'Ngày hội Đổi mới sáng tạo Quý II', trangThai: 'Đã kết thúc', ngUoiThamGia: 340, soNop: 91, tyLeHoanThanh: 100, tongThuong: 72000000, huyHieu: 28 },
  { ten: 'Chuyển đổi số Dịch vụ Mặt đất', trangThai: 'Đang diễn ra', ngUoiThamGia: 156, soNop: 39, tyLeHoanThanh: 41, tongThuong: 30000000, huyHieu: 6 },
  { ten: 'Cải tiến An toàn bay 2025', trangThai: 'Đã kết thúc', ngUoiThamGia: 275, soNop: 80, tyLeHoanThanh: 100, tongThuong: 60000000, huyHieu: 20 },
];

// ── Mock: Chương trình CĐS/R&D/Sandbox (IV.11, IV.12) ────────────────────────
const CDS_PROGRAMS = [
  { ten: 'Nền tảng dữ liệu hành khách 360°', trangThai: 'Đúng hạn', tienDo: 72, nganSach: 65, mocTong: 8, mocHoanThanh: 6 },
  { ten: 'Sandbox AI dự báo bảo trì động cơ', trangThai: 'Rủi ro', tienDo: 45, nganSach: 80, mocTong: 6, mocHoanThanh: 3 },
  { ten: 'Ứng dụng di động cho phi hành đoàn', trangThai: 'Trễ tiến độ', tienDo: 30, nganSach: 55, mocTong: 5, mocHoanThanh: 2 },
  { ten: 'Tự động hóa quy trình kế toán (RPA)', trangThai: 'Đúng hạn', tienDo: 90, nganSach: 88, mocTong: 4, mocHoanThanh: 4 },
  { ten: 'R&D vật liệu tiết kiệm nhiên liệu', trangThai: 'Đúng hạn', tienDo: 55, nganSach: 40, mocTong: 7, mocHoanThanh: 4 },
];
const CDS_STATUS_COLOR: Record<string, string> = { 'Đúng hạn': '#22c55e', 'Trễ tiến độ': '#ef4444', 'Rủi ro': '#f59e0b' };

// ── Mock: Quỹ phát triển KHCN (IV.13) ─────────────────────────────────────────
const QUY_KHCN = [
  { loaiQuy: 'Quỹ phát triển KHCN Tổng công ty', nganSachDau: 20000000000, daChi: 8200000000 },
  { loaiQuy: 'Quỹ ĐMST cấp đơn vị', nganSachDau: 6000000000, daChi: 3450000000 },
  { loaiQuy: 'Quỹ khen thưởng sáng kiến', nganSachDau: 2500000000, daChi: 1780000000 },
];

// ── Mock: Chi thưởng (IV.14) ──────────────────────────────────────────────────
const CHI_THUONG = [
  { doiTuong: 'Trần Minh Hoàng', donVi: 'Ban Kỹ thuật Bay', tienThuong: 25000000, diemThuong: 500, kyThuong: 'Q1/2026' },
  { doiTuong: 'Nguyễn Văn An', donVi: 'Ban Dịch vụ Mặt đất', tienThuong: 12000000, diemThuong: 300, kyThuong: 'Q1/2026' },
  { doiTuong: 'Ban Khai thác Bay', donVi: '—', tienThuong: 40000000, diemThuong: 0, kyThuong: 'Năm 2025' },
];

// ── Mock: Ví và giao dịch (IV.15) ─────────────────────────────────────────────
const VI_GIAO_DICH = [
  { thoiGian: '05/07/2026 09:12', loai: 'Nhận thưởng sáng kiến', vi: 'Cánh sen', soTien: '+500', soDu: 2150 },
  { thoiGian: '02/07/2026 14:30', loai: 'Quy đổi quà tặng', vi: 'Bông sen', soTien: '-1200', soDu: 3400 },
  { thoiGian: '28/06/2026 08:05', loai: 'Nhận thưởng chiến dịch', vi: 'Cánh sen', soTien: '+300', soDu: 1650 },
];

// ── Mock: Quy đổi quà tặng (IV.16) ────────────────────────────────────────────
const QUA_TANG = [
  { ten: 'Voucher nghỉ dưỡng 2N1Đ', daQuyDoi: 34, tonKho: 6, chiPhi: 200 },
  { ten: 'Tai nghe không dây', daQuyDoi: 58, tonKho: 12, chiPhi: 80 },
  { ten: 'Vé máy bay khứ hồi nội địa', daQuyDoi: 15, tonKho: 3, chiPhi: 600 },
];

// ── Mock: Người dùng & sử dụng hệ thống (IV.18) ──────────────────────────────
const USAGE_BY_DEPT = [
  { donVi: 'Ban Khai thác Bay', hoatDong: 92, tanSuatDangNhap: 4.2, tyLeSuDung: 78 },
  { donVi: 'Ban Dịch vụ Mặt đất', hoatDong: 145, tanSuatDangNhap: 3.6, tyLeSuDung: 65 },
  { donVi: 'Trung tâm Kỹ thuật A76', hoatDong: 88, tanSuatDangNhap: 5.1, tyLeSuDung: 82 },
];

export const BaoCaoDayDuPage: React.FC = () => {
  const [dash, setDash] = useState<IIdeaDashboard | null>(null);
  const [lb, setLb] = useState<IIdeaContributionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterKind, setFilterKind] = useState<'all' | 'real' | 'partial' | 'mock'>('all');

  useEffect(() => {
    (async () => {
      try {
        const [dRes, lRes] = await Promise.all([
          getIdeaDashboard(undefined, 72),
          getIdeaContributions({ top: 5 }),
        ]);
        const dd = (dRes as any)?.data;
        setDash(dd?.data ?? dd ?? null);
        const ll = (lRes as any)?.data;
        setLb(ll?.data ?? ll ?? null);
      } catch { /* giữ mặc định rỗng, phần IV.1/4/6/7 vẫn hiện khung minh họa */ }
      finally { setLoading(false); }
    })();
  }, []);

  // Lọc danh mục theo loại dữ liệu
  const filteredTOC = filterKind === 'all' ? TOC : TOC.filter(t => t.kind === filterKind);

  // Menu dropdown
  const menuItems = [
    {
      key: 'full-report',
      label: 'Đi đến trang Báo cáo đầy đủ',
      icon: <i className="fa-regular fa-chart-line me-2" />,
      onClick: () => {
        window.location.href = 'https://dmst.hanhchinhcong.net/doi-moi-sang-tao/bao-cao';
      },
    },
    {
      key: 'export',
      label: 'Xuất báo cáo',
      icon: <i className="fa-regular fa-download me-2" />,
      onClick: () => {
        alert('Chức năng xuất báo cáo sẽ được bổ sung');
      },
    },
  ];

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Báo cáo & thống kê', path: '/doi-moi-sang-tao/bao-cao', isActive: false, isSeparator: false },
      ]}>Báo cáo tổng hợp đầy đủ (IV.1 – IV.19)</PageTitle>

      <Content>
        {/* Thanh công cụ: Filter + Menu */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          <div className="card-body p-4 d-flex flex-wrap gap-3 align-items-center justify-content-between">
            <div className="d-flex gap-3 align-items-center">
              <span className="fw-semibold fs-7">Lọc báo cáo:</span>
              <Select
                value={filterKind}
                onChange={(v) => setFilterKind(v)}
                style={{ width: 200 }}
                options={[
                  { label: 'Tất cả báo cáo', value: 'all' },
                  { label: `Dữ liệu thật (${TOC.filter(t => t.kind === 'real').length})`, value: 'real' },
                  { label: `Một phần thật (${TOC.filter(t => t.kind === 'partial').length})`, value: 'partial' },
                  { label: `Dữ liệu minh họa (${TOC.filter(t => t.kind === 'mock').length})`, value: 'mock' },
                ]}
              />
            </div>
            <div className="d-flex gap-2">
              <Button
                type="primary"
                icon={<i className="fa-regular fa-arrow-right me-2" />}
                onClick={() => {
                  window.location.href = 'https://dmst.hanhchinhcong.net/doi-moi-sang-tao/bao-cao';
                }}
              >
                Trang báo cáo đầy đủ
              </Button>
              <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Button icon={<i className="fa-regular fa-ellipsis-vertical" />} />
              </Dropdown>
            </div>
          </div>
        </div>

        <Alert
          type="warning"
          showIcon
          className="mb-4"
          message="Trang tổng hợp minh họa cho toàn bộ 19 nhóm báo cáo theo đặc tả (mục IV)."
          description={
            <>
              <span style={{ color: DATA_KIND_CONFIG.real.color }}>■ Dữ liệu thật</span> — lấy trực tiếp từ dữ liệu Ý tưởng đang vận hành.
              <br />
              <span style={{ color: DATA_KIND_CONFIG.partial.color }}>■ Một phần dữ liệu thật · một phần minh họa</span> — có một số số liệu thật, phần còn lại giả lập.
              <br />
              <span style={{ color: DATA_KIND_CONFIG.mock.color }}>■ Dữ liệu minh họa</span> — dùng số liệu giả lập để trình bày giao diện/khái niệm cho các phần hệ thống <strong>chưa xây dựng</strong> (chiến dịch, quỹ thưởng, ví điện tử, quà tặng, chương trình CĐS/R&D/Sandbox, ROI, dashboard theo vai trò/tùy biến, thống kê sử dụng hệ thống…).
              <br />
              Không dùng số liệu trên trang này để báo cáo chính thức.
            </>
          }
        />

        {/* Mục lục */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          <div className="card-body p-4">
            <div className="d-flex flex-wrap gap-2">
              {filteredTOC.map(t => (
                <a key={t.id} href={`#${t.id}`}
                  className="badge fs-8 text-decoration-none"
                  style={{
                    padding: '7px 12px',
                    background: DATA_KIND_CONFIG[t.kind].color + '20',
                    color: DATA_KIND_CONFIG[t.kind].color,
                    border: `1px solid ${DATA_KIND_CONFIG[t.kind].color}40`,
                  }}>
                  {t.code} {t.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        <Spin spinning={loading}>

          {/* IV.1 */}
          {(filterKind === 'all' || filterKind === 'partial') && (
          <SectionCard anchorId="iv1" code="IV.1" title="Tổng quan Dashboard điều hành" kind="partial"
            desc="Bức tranh tổng thể ĐMST và CĐS trên một màn hình — số lượng ý tưởng/giải pháp/sáng kiến, chương trình/dự án CĐS, chiến dịch, quỹ thưởng, mức độ tham gia CBNV.">
            <Row gutter={[16, 16]}>
              <Col xs={12} md={6}><Statistic title="Tổng ý tưởng (thật)" value={dash?.tongYTuong ?? 0} /></Col>
              <Col xs={12} md={6}><Statistic title="Người tham gia (thật)" value={dash?.soNguoiThamGia ?? 0} /></Col>
              <Col xs={12} md={6}>
                <Statistic title="Chương trình CĐS/R&D đang chạy" value={CDS_PROGRAMS.length} suffix={<span style={{ color: DATA_KIND_CONFIG.mock.color, fontSize: 12 }}>minh họa</span>} />
              </Col>
              <Col xs={12} md={6}>
                <Statistic title="Chiến dịch đang diễn ra" value={CAMPAIGNS.filter(c => c.trangThai === 'Đang diễn ra').length} suffix={<span style={{ color: DATA_KIND_CONFIG.mock.color, fontSize: 12 }}>minh họa</span>} />
              </Col>
            </Row>
          </SectionCard>
          )}

          {/* IV.2 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv2" code="IV.2" title="Dashboard theo vai trò" kind="mock"
            desc="Hệ thống tự động hiển thị dashboard khác nhau theo vai trò: CBNV, Lãnh đạo đơn vị, Lãnh đạo TCT, Quản trị hệ thống.">
            <Row gutter={[16, 16]}>
              {ROLE_VIEWS.map(r => (
                <Col xs={24} md={12} xl={6} key={r.role}>
                  <div className="p-4 rounded h-100" style={{ background: '#fafafa', border: '1px solid #eee' }}>
                    <div className={`fw-bold mb-3 text-${r.color}`}>
                      <i className={`fa-regular ${r.icon} me-2`} />{r.role}
                    </div>
                    {r.kpis.map(k => <div key={k} className="text-gray-700 fs-8 mb-1">• {k}</div>)}
                  </div>
                </Col>
              ))}
            </Row>
          </SectionCard>
          )}

          {/* IV.3 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv3" code="IV.3" title="Tùy biến Dashboard" kind="mock"
            desc="Người dùng cấu hình bố cục, chọn KPI, biểu đồ và phạm vi thời gian hiển thị theo nhu cầu cá nhân — minh họa khái niệm bảng cấu hình.">
            <div className="p-4 rounded" style={{ background: '#fafafa', border: '1px solid #eee' }}>
              <div className="fw-semibold mb-2 fs-7">Chọn chỉ số KPI hiển thị</div>
              <Space direction="vertical">
                <Checkbox defaultChecked>Tổng ý tưởng</Checkbox>
                <Checkbox defaultChecked>Tỷ lệ đúng hạn SLA</Checkbox>
                <Checkbox>Chi thưởng theo kỳ</Checkbox>
                <Checkbox>Tiến độ chương trình CĐS</Checkbox>
              </Space>
              <div className="fw-semibold mb-2 mt-4 fs-7">Phạm vi thời gian</div>
              <DatePicker.RangePicker disabled style={{ width: 280 }} />
              <div className="mt-4"><Button disabled type="primary">Lưu bố cục (minh họa)</Button></div>
            </div>
          </SectionCard>
          )}

          {/* IV.4 */}
          {(filterKind === 'all' || filterKind === 'partial') && (
          <SectionCard anchorId="iv4" code="IV.4" title="Báo cáo Ý tưởng / Giải pháp / Sáng kiến" kind="partial"
            desc="Thống kê theo trạng thái, đơn vị, lĩnh vực, thời gian và mức độ hiệu quả. Phần Ý tưởng lấy dữ liệu thật; Giải pháp/Sáng kiến hiện minh họa do module Giải pháp còn ở dạng mẫu.">
            <Row gutter={[16, 16]} className="mb-3">
              <Col xs={12} md={6}><Statistic title="Bản nháp (thật)" value={dash?.soBanNhap ?? 0} /></Col>
              <Col xs={12} md={6}><Statistic title="Đã nộp/Chờ duyệt (thật)" value={dash?.soDaNop ?? 0} /></Col>
              <Col xs={12} md={6}><Statistic title="Đã tiếp nhận (thật)" value={dash?.soDaTiepNhan ?? 0} /></Col>
              <Col xs={12} md={6}><Statistic title="Được công nhận (thật)" value={dash?.soDuocCongNhan ?? 0} /></Col>
            </Row>
            <Table
              size="small" pagination={false}
              locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }}
              dataSource={dash?.theoLinhVuc ?? []}
              rowKey="ten"
              title={() => <span className="fw-semibold fs-8">Theo lĩnh vực (thật)</span>}
              columns={[
                { title: 'Lĩnh vực', dataIndex: 'ten' },
                { title: 'Số lượng', dataIndex: 'soLuong', width: 100 },
                { title: 'Được duyệt', dataIndex: 'soDuocDuyet', width: 100 },
                { title: 'Công nhận', dataIndex: 'soDuocCongNhan', width: 100 },
              ]}
            />
            <div className="mt-4 mb-2 d-flex align-items-center gap-2">
              <span className="fw-semibold fs-8">Giải pháp (module đang ở dạng mẫu)</span>
              <span style={{ color: DATA_KIND_CONFIG.mock.color, fontSize: 12, fontStyle: 'italic' }}>minh họa</span>
            </div>
            <Table
              size="small" pagination={false}
              dataSource={[
                { ten: 'Giải pháp tối ưu tải trọng hàng hóa', trangThai: 'Đang triển khai', donVi: 'Ban Hàng hóa' },
                { ten: 'Giải pháp tự động hóa lịch bay dự phòng', trangThai: 'Không thông qua', donVi: 'Ban Khai thác Bay' },
              ]}
              rowKey="ten"
              columns={[
                { title: 'Tên giải pháp', dataIndex: 'ten' },
                { title: 'Trạng thái', dataIndex: 'trangThai', width: 160 },
                { title: 'Đơn vị', dataIndex: 'donVi', width: 180 },
              ]}
            />
          </SectionCard>
          )}

          {/* IV.5 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv5" code="IV.5" title="Báo cáo hiệu quả ĐMST" kind="mock"
            desc="Tổng hợp lợi ích mang lại: tiết kiệm chi phí, tăng doanh thu, nâng cao chất lượng dịch vụ, số lượng áp dụng/nhân rộng.">
            <Table
              size="small" pagination={false}
              dataSource={HIEU_QUA_DATA}
              rowKey="ten"
              columns={[
                { title: 'Sáng kiến / Ý tưởng', dataIndex: 'ten' },
                { title: 'Tiết kiệm chi phí', dataIndex: 'tietKiem', width: 150, render: fmtVnd },
                { title: 'Tăng doanh thu', dataIndex: 'doanhThu', width: 150, render: fmtVnd },
                { title: 'Số lượng nhân rộng', dataIndex: 'nhanRong', width: 130 },
                { title: 'Chất lượng dịch vụ', dataIndex: 'chatLuong', width: 130,
                  render: (v: string) => <Tag color={v === 'Cao' ? 'green' : 'gold'}>{v}</Tag> },
              ]}
            />
          </SectionCard>
          )}

          {/* IV.6 */}
          {(filterKind === 'all' || filterKind === 'partial') && (
          <SectionCard anchorId="iv6" code="IV.6" title="Báo cáo quy trình xử lý & SLA" kind="partial"
            desc="Thời gian xử lý trung bình từng bước, tỷ lệ đúng/quá hạn, điểm nghẽn quy trình, cảnh báo tồn đọng.">
            <Row gutter={[16, 16]} className="mb-3">
              <Col xs={12} md={6}><Statistic title="Giờ xử lý TB (thật)" value={dash?.gioXuLyTrungBinh ?? 0} suffix="giờ" /></Col>
              <Col xs={12} md={6}><Statistic title="Tỷ lệ đúng hạn (thật)" value={dash?.tyLeDungHan ?? 0} suffix="%" /></Col>
              <Col xs={12} md={6}><Statistic title="Chờ xử lý (thật)" value={dash?.soChoXuLy ?? 0} /></Col>
              <Col xs={12} md={6}><Statistic title="Tồn đọng quá hạn (thật)" value={dash?.soTonDong ?? 0} valueStyle={{ color: (dash?.soTonDong ?? 0) > 0 ? '#cf1322' : undefined }} /></Col>
            </Row>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="fw-semibold fs-8">Điểm nghẽn theo từng bước quy trình</span>
              <Tag color="orange">Minh họa</Tag>
            </div>
            {[
              { buoc: 'Chờ tiếp nhận', gioTB: 18, nghenNghen: false },
              { buoc: 'Tiếp nhận → Xét duyệt', gioTB: 96, nghenNghen: true },
              { buoc: 'Xét duyệt → Công nhận', gioTB: 40, nghenNghen: false },
            ].map(b => (
              <div key={b.buoc} className="mb-2">
                <div className="d-flex justify-content-between fs-8 mb-1">
                  <span>{b.buoc} {b.nghenNghen && <Tag color="red" className="ms-1">Điểm nghẽn</Tag>}</span>
                  <span>{b.gioTB} giờ TB</span>
                </div>
                <Progress percent={Math.min(100, Math.round((b.gioTB / 96) * 100))} showInfo={false}
                  strokeColor={b.nghenNghen ? '#ef4444' : '#3b82f6'} />
              </div>
            ))}
          </SectionCard>
          )}

          {/* IV.7 */}
          {(filterKind === 'all' || filterKind === 'partial') && (
          <SectionCard anchorId="iv7" code="IV.7" title="Báo cáo đóng góp cá nhân/đơn vị" kind="partial"
            desc="Xếp hạng và thống kê mức độ tham gia theo số lượng nộp, phê duyệt, điểm thưởng, lượt tương tác và huy hiệu đạt được.">
            <Table
              size="small" pagination={false}
              locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }}
              dataSource={lb?.caNhan ?? []}
              rowKey="ten"
              title={() => <span className="fw-semibold fs-8">Top cá nhân (thật) — {lb?.ky ?? ''}</span>}
              columns={[
                { title: '#', dataIndex: 'xepHang', width: 50 },
                { title: 'Cá nhân', dataIndex: 'ten' },
                { title: 'Đơn vị', dataIndex: 'donVi', width: 160 },
                { title: 'Số nộp', dataIndex: 'soNop', width: 90 },
                { title: 'Được duyệt', dataIndex: 'soDuocDuyet', width: 100 },
                {
                  title: () => <>Điểm thưởng / Huy hiệu <Tag color="orange" className="ms-1">Minh họa</Tag></>,
                  key: 'diem',
                  render: (_: unknown, __: unknown, i: number) => `${(5 - i) * 120}đ · ${5 - i} huy hiệu`,
                },
              ]}
            />
          </SectionCard>
          )}

          {/* IV.8 */}
          {(filterKind === 'all' || filterKind === 'real') && (
          <SectionCard anchorId="iv8" code="IV.8" title="Bảng xếp hạng (Leaderboard)" kind="real"
            desc="Bảng xếp hạng theo tháng/quý/năm cho cá nhân và đơn vị có thành tích nổi bật trong ĐMST và CĐS.">
            <Alert type="success" showIcon message={
              <>Đã có đầy đủ tại trang <a href="/doi-moi-sang-tao/bao-cao">Báo cáo & thống kê</a> — mục "Bảng xếp hạng đóng góp", hỗ trợ lọc theo Năm/Quý/Tháng và tách Cá nhân/Đơn vị.</>
            } />
          </SectionCard>
          )}

          {/* IV.9 */}
          {(filterKind === 'all' || filterKind === 'partial') && (
          <SectionCard anchorId="iv9" code="IV.9" title="Báo cáo tương tác hệ thống" kind="partial"
            desc="Thống kê lượt xem, thích, bình luận, tham gia chiến dịch và mức độ sử dụng hệ thống theo người dùng/đơn vị.">
            <Row gutter={[16, 16]} className="mb-3">
              <Col xs={12} md={6}><Statistic title="Lượt thích (Kho tri thức, thật)" value="—" /></Col>
              <Col xs={12} md={6}><Statistic title="Lượt bình luận (Kho tri thức, thật)" value="—" /></Col>
              <Col xs={12} md={6}>
                <Statistic title="Tham gia chiến dịch" value={CAMPAIGNS.reduce((s, c) => s + c.ngUoiThamGia, 0)} suffix={<Tag color="orange" className="ms-1">Minh họa</Tag>} />
              </Col>
              <Col xs={12} md={6}>
                <Statistic title="Mức sử dụng hệ thống" value="Xem mục IV.18" suffix={<Tag color="orange" className="ms-1">Minh họa</Tag>} />
              </Col>
            </Row>
            <Alert type="info" showIcon message={
              <>Số liệu lượt xem/thích/bình luận thật đã có tại <a href="/doi-moi-sang-tao/kho-tri-thuc/analytics">Kho tri thức &gt; Phân tích</a>, hiện theo tài liệu/bài viết — chưa hợp nhất theo người dùng/đơn vị trên một báo cáo duy nhất.</>
            } />
          </SectionCard>
          )}

          {/* IV.10 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv10" code="IV.10" title="Báo cáo chiến dịch ĐMST" kind="mock"
            desc="Theo dõi hiệu quả từng chiến dịch: số người tham gia, số ý tưởng/giải pháp/sáng kiến nộp, tỷ lệ hoàn thành, tổng thưởng đã chi, huy hiệu đã trao.">
            <Table
              size="small" pagination={false}
              dataSource={CAMPAIGNS}
              rowKey="ten"
              columns={[
                { title: 'Chiến dịch', dataIndex: 'ten' },
                { title: 'Trạng thái', dataIndex: 'trangThai', width: 130,
                  render: (v: string) => <Tag color={v === 'Đang diễn ra' ? 'processing' : 'default'}>{v}</Tag> },
                { title: 'Người tham gia', dataIndex: 'ngUoiThamGia', width: 120 },
                { title: 'Số nộp', dataIndex: 'soNop', width: 90 },
                { title: 'Tỷ lệ hoàn thành', dataIndex: 'tyLeHoanThanh', width: 150,
                  render: (v: number) => <Progress percent={v} size="small" /> },
                { title: 'Tổng thưởng', dataIndex: 'tongThuong', width: 140, render: fmtVnd },
                { title: 'Huy hiệu trao', dataIndex: 'huyHieu', width: 100 },
              ]}
            />
          </SectionCard>
          )}

          {/* IV.11 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv11" code="IV.11" title="Báo cáo chương trình/dự án CĐS/R&D và Sandbox" kind="mock"
            desc="Tổng hợp tiến độ thực hiện, trạng thái (đúng hạn/trễ/rủi ro), tỷ lệ hoàn thành milestone, ngân sách sử dụng và hiệu quả đạt được của từng chương trình.">
            <Table
              size="small" pagination={false}
              dataSource={CDS_PROGRAMS}
              rowKey="ten"
              columns={[
                { title: 'Chương trình / Dự án', dataIndex: 'ten' },
                { title: 'Trạng thái', dataIndex: 'trangThai', width: 120,
                  render: (v: string) => <Tag color={v === 'Đúng hạn' ? 'green' : v === 'Rủi ro' ? 'gold' : 'red'}>{v}</Tag> },
                { title: 'Tiến độ', dataIndex: 'tienDo', width: 150, render: (v: number) => <Progress percent={v} size="small" /> },
                { title: 'Ngân sách đã dùng', dataIndex: 'nganSach', width: 150, render: (v: number) => <Progress percent={v} size="small" strokeColor="#722ed1" /> },
                { title: 'Milestone', key: 'moc', width: 110, render: (_: unknown, r: typeof CDS_PROGRAMS[number]) => `${r.mocHoanThanh}/${r.mocTong}` },
              ]}
            />
          </SectionCard>
          )}

          {/* IV.12 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv12" code="IV.12" title="Dashboard tiến độ CĐS/R&D và Sandbox" kind="mock"
            desc="Biểu đồ Gantt, biểu đồ tiến độ và cảnh báo các mốc triển khai chậm hoặc vượt ngân sách.">
            <div className="d-flex flex-column gap-3">
              {CDS_PROGRAMS.map(p => (
                <div key={p.ten}>
                  <div className="d-flex justify-content-between fs-8 mb-1">
                    <span className="fw-semibold">{p.ten}</span>
                    <Tag color={p.trangThai === 'Đúng hạn' ? 'green' : p.trangThai === 'Rủi ro' ? 'gold' : 'red'}>{p.trangThai}</Tag>
                  </div>
                  <div style={{ height: 14, borderRadius: 7, background: '#f0f0f0', overflow: 'hidden' }}>
                    <div style={{ width: `${p.tienDo}%`, height: '100%', background: CDS_STATUS_COLOR[p.trangThai] }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
          )}

          {/* IV.13 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv13" code="IV.13" title="Báo cáo Quỹ phát triển KHCN" kind="mock"
            desc="Theo dõi tình hình phân bổ và sử dụng quỹ theo thời gian thực: ngân sách ban đầu, đã chi, còn lại, theo loại quỹ và theo đơn vị.">
            <Table
              size="small" pagination={false}
              dataSource={QUY_KHCN}
              rowKey="loaiQuy"
              columns={[
                { title: 'Loại quỹ', dataIndex: 'loaiQuy' },
                { title: 'Ngân sách ban đầu', dataIndex: 'nganSachDau', width: 170, render: fmtVnd },
                { title: 'Đã chi', dataIndex: 'daChi', width: 170, render: fmtVnd },
                { title: 'Còn lại', key: 'conLai', width: 170, render: (_: unknown, r: typeof QUY_KHCN[number]) => fmtVnd(r.nganSachDau - r.daChi) },
                { title: 'Tỷ lệ đã dùng', key: 'ty', width: 160,
                  render: (_: unknown, r: typeof QUY_KHCN[number]) => <Progress percent={Math.round((r.daChi / r.nganSachDau) * 100)} size="small" /> },
              ]}
            />
          </SectionCard>
          )}

          {/* IV.14 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv14" code="IV.14" title="Báo cáo chi thưởng" kind="mock"
            desc="Thống kê chi tiết các khoản chi tiền thưởng và điểm thưởng theo cá nhân, đơn vị, chiến dịch, sáng kiến hoặc thời gian.">
            <Table
              size="small" pagination={false}
              dataSource={CHI_THUONG}
              rowKey="doiTuong"
              columns={[
                { title: 'Đối tượng', dataIndex: 'doiTuong' },
                { title: 'Đơn vị', dataIndex: 'donVi', width: 180 },
                { title: 'Tiền thưởng', dataIndex: 'tienThuong', width: 150, render: fmtVnd },
                { title: 'Điểm thưởng', dataIndex: 'diemThuong', width: 120 },
                { title: 'Kỳ thưởng', dataIndex: 'kyThuong', width: 120 },
              ]}
            />
          </SectionCard>
          )}

          {/* IV.15 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv15" code="IV.15" title="Báo cáo ví và giao dịch" kind="mock"
            desc="Tra cứu lịch sử giao dịch, số dư ví tiền mặt và ví Cánh sen/Bông sen; hỗ trợ đối soát.">
            <Row gutter={[16, 16]} className="mb-3">
              <Col xs={12} md={6}><Statistic title="Số dư ví Cánh sen" value={2150} /></Col>
              <Col xs={12} md={6}><Statistic title="Số dư ví Bông sen" value={3400} /></Col>
            </Row>
            <Table
              size="small" pagination={false}
              dataSource={VI_GIAO_DICH}
              rowKey="thoiGian"
              columns={[
                { title: 'Thời gian', dataIndex: 'thoiGian', width: 160 },
                { title: 'Loại giao dịch', dataIndex: 'loai' },
                { title: 'Ví', dataIndex: 'vi', width: 110 },
                { title: 'Số tiền', dataIndex: 'soTien', width: 100,
                  render: (v: string) => <span style={{ color: v.startsWith('+') ? '#16a34a' : '#dc2626' }}>{v}</span> },
                { title: 'Số dư sau GD', dataIndex: 'soDu', width: 120 },
              ]}
            />
          </SectionCard>
          )}

          {/* IV.16 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv16" code="IV.16" title="Báo cáo quy đổi quà tặng" kind="mock"
            desc="Thống kê số lượng quy đổi, loại quà phổ biến, tồn kho và chi phí quy đổi.">
            <Table
              size="small" pagination={false}
              dataSource={QUA_TANG}
              rowKey="ten"
              columns={[
                { title: 'Quà tặng', dataIndex: 'ten' },
                { title: 'Đã quy đổi', dataIndex: 'daQuyDoi', width: 120 },
                { title: 'Tồn kho', dataIndex: 'tonKho', width: 100 },
                { title: 'Chi phí (điểm)', dataIndex: 'chiPhi', width: 130 },
              ]}
            />
          </SectionCard>
          )}

          {/* IV.17 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv17" code="IV.17" title="Báo cáo ngân sách & ROI" kind="mock"
            desc="So sánh chi phí quỹ khen thưởng với giá trị/hiệu quả mang lại từ các sáng kiến để đánh giá hiệu quả đầu tư (ROI).">
            {(() => {
              const chiPhi = CHI_THUONG.reduce((s, c) => s + c.tienThuong, 0);
              const loiIch = HIEU_QUA_DATA.reduce((s, h) => s + h.tietKiem + h.doanhThu, 0);
              const roi = chiPhi > 0 ? Math.round(((loiIch - chiPhi) / chiPhi) * 100) : 0;
              return (
                <Row gutter={[16, 16]}>
                  <Col xs={12} md={8}><Statistic title="Tổng chi thưởng" value={fmtVnd(chiPhi)} /></Col>
                  <Col xs={12} md={8}><Statistic title="Tổng giá trị mang lại" value={fmtVnd(loiIch)} /></Col>
                  <Col xs={12} md={8}><Statistic title="ROI ước tính" value={roi} suffix="%" valueStyle={{ color: roi > 0 ? '#16a34a' : '#dc2626' }} /></Col>
                </Row>
              );
            })()}
          </SectionCard>
          )}

          {/* IV.18 */}
          {(filterKind === 'all' || filterKind === 'mock') && (
          <SectionCard anchorId="iv18" code="IV.18" title="Báo cáo người dùng & sử dụng hệ thống" kind="mock"
            desc="Thống kê số lượng người dùng hoạt động, tần suất đăng nhập, tỷ lệ sử dụng tính năng và mức độ tương tác theo phòng ban/đơn vị.">
            <Row gutter={[16, 16]} className="mb-3">
              <Col xs={12} md={8}><Statistic title="Người dùng hoạt động (30 ngày)" value={1204} /></Col>
              <Col xs={12} md={8}><Statistic title="Tần suất đăng nhập TB" value={4.1} suffix="lần/tuần" /></Col>
              <Col xs={12} md={8}><Statistic title="Tỷ lệ dùng tính năng cốt lõi" value={71} suffix="%" /></Col>
            </Row>
            <Table
              size="small" pagination={false}
              dataSource={USAGE_BY_DEPT}
              rowKey="donVi"
              columns={[
                { title: 'Đơn vị', dataIndex: 'donVi' },
                { title: 'Người dùng hoạt động', dataIndex: 'hoatDong', width: 160 },
                { title: 'Tần suất đăng nhập/tuần', dataIndex: 'tanSuatDangNhap', width: 180 },
                { title: 'Tỷ lệ sử dụng', dataIndex: 'tyLeSuDung', width: 140, render: (v: number) => <Progress percent={v} size="small" /> },
              ]}
            />
            <div className="mt-2 text-muted fs-8">
              Nhật ký đăng nhập gốc (chưa tổng hợp) đã có tại <a href="/admins/system-admins/login-logs">Quản trị &gt; Nhật ký đăng nhập</a>.
            </div>
          </SectionCard>
          )}

          {/* IV.19 */}
          {(filterKind === 'all' || filterKind === 'real') && (
          <SectionCard anchorId="iv19" code="IV.19" title="Xuất báo cáo" kind="real"
            desc="Xuất dữ liệu và biểu đồ sang các định dạng Excel, PDF hoặc CSV để phục vụ họp, tổng hợp và báo cáo lãnh đạo.">
            <Alert type="success" showIcon message={
              <>Đã hỗ trợ đầy đủ tại trang <a href="/doi-moi-sang-tao/bao-cao">Báo cáo & thống kê</a> (CSV, Excel, PDF, Word) và <a href="/doi-moi-sang-tao/kho-tri-thuc/bao-cao">Kho tri thức &gt; Báo cáo</a> (Excel). Trang minh họa này chưa có nút xuất riêng vì phần lớn nội dung là số liệu giả lập.</>
            } />
          </SectionCard>
          )}

        </Spin>
      </Content>
    </>
  );
};
