import React, { useState, useEffect, useCallback } from 'react';
import { Button, Select, DatePicker, message, Table, Tag, Spin, Empty, Tabs, Tooltip } from 'antd';
import type { Dayjs } from 'dayjs';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import {
  getIdeaDashboard, getIdeaContributions,
  exportIdeaReport, exportIdeaReportExcel, exportIdeaReportPdf, exportIdeaReportWord,
  IKhoangThoiGian,
} from '@/app/services/ideaPortalApi';
import type { IIdeaDashboard, IIdeaContributionReport, IIdeaContribution, INhomSoLuong } from '@/models/idea-portal';

const { Option } = Select;
const { RangePicker } = DatePicker;
type DateRange = [Dayjs, Dayjs] | null;
const toRangeParam = (r: DateRange): IKhoangThoiGian | undefined =>
  r ? { tuNgay: r[0].format('YYYY-MM-DD'), denNgay: r[1].format('YYYY-MM-DD') } : undefined;

const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2];

const safeItem = <T,>(res: any): T | null => {
  const d = res?.data ?? res;
  if (d && d.succeeded === false) return null;
  return (d?.data ?? d ?? null) as T | null;
};

const fmtNum = (v?: number | null) => (v ?? 0).toLocaleString('vi-VN');

// ── KPI card ──────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{ title: string; value: React.ReactNode; icon: string; color: string; sub?: string }> =
  ({ title, value, icon, color, sub }) => (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
      <div className="card-body py-4 px-5 d-flex align-items-center gap-4">
        <div className={`d-flex align-items-center justify-content-center rounded-3 bg-light-${color}`}
          style={{ width: 48, height: 48, flexShrink: 0 }}>
          <i className={`fa-regular ${icon} fs-3 text-${color}`} />
        </div>
        <div>
          <div className="fs-2 fw-bold text-gray-900">{value}</div>
          <div className="fs-8 text-muted">{title}</div>
          {sub && <div className="fs-9 text-muted">{sub}</div>}
        </div>
      </div>
    </div>
  );

const ALL_TIME = 0; // giá trị đặc biệt cho lựa chọn "Tất cả" trong Select năm

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

export const BaoCaoPage: React.FC = () => {
  // Mặc định "Tất cả" (không lọc theo năm) — tránh trường hợp năm hiện tại chưa có ý tưởng nào
  // mà hiển thị nhầm thành "chưa có dữ liệu" khi mở trang lần đầu.
  const [year, setYear]         = useState<number>(ALL_TIME);
  const [range, setRange]       = useState<DateRange>(null);
  const [loading, setLoading]   = useState(false);
  const [dash, setDash]         = useState<IIdeaDashboard | null>(null);

  // Leaderboard
  const [lbPeriod, setLbPeriod] = useState<'nam' | 'quy' | 'thang'>('nam');
  const [lbValue, setLbValue]   = useState<number>(1);
  const [lbLoading, setLbLoading] = useState(false);
  const [lb, setLb]             = useState<IIdeaContributionReport | null>(null);

  const [exporting, setExporting] = useState(false);

  const loadDash = useCallback(async (y = year, r = range) => {
    setLoading(true);
    try {
      const res = await getIdeaDashboard(y === ALL_TIME ? undefined : y, 72, toRangeParam(r));
      setDash(safeItem<IIdeaDashboard>(res));
    } catch { message.error('Không tải được số liệu báo cáo'); }
    finally { setLoading(false); }
  }, [year, range]);

  const loadLb = useCallback(async (y = year, period = lbPeriod, value = lbValue, r = range) => {
    setLbLoading(true);
    try {
      const res = await getIdeaContributions({
        nam: y === ALL_TIME ? undefined : y,
        quy: period === 'quy' ? value : undefined,
        thang: period === 'thang' ? value : undefined,
        top: 10,
        ...toRangeParam(r),
      });
      setLb(safeItem<IIdeaContributionReport>(res));
    } catch { /* ignore */ }
    finally { setLbLoading(false); }
  }, [year, lbPeriod, lbValue, range]);

  useEffect(() => { loadDash(); loadLb(); }, []);

  const changeYear = (y: number) => {
    setYear(y);
    setRange(null);
    // "Tất cả" không hỗ trợ lọc theo quý/tháng cụ thể → về lại chế độ theo năm
    const period = y === ALL_TIME ? 'nam' : lbPeriod;
    if (period !== lbPeriod) { setLbPeriod(period); setLbValue(1); }
    loadDash(y, null);
    loadLb(y, period, period === lbPeriod ? lbValue : 1, null);
  };

  const changeRange = (dates: any) => {
    const r: DateRange = dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null;
    setRange(r);
    loadDash(year, r);
    loadLb(year, lbPeriod, lbValue, r);
  };

  const [exportingFormat, setExportingFormat] = useState<'csv' | 'excel' | 'pdf' | 'word' | null>(null);

  const EXPORT_CONFIG = {
    csv:   { fn: exportIdeaReport,      ext: 'csv',  label: 'CSV — mở bằng Excel' },
    excel: { fn: exportIdeaReportExcel, ext: 'xlsx', label: 'Excel' },
    pdf:   { fn: exportIdeaReportPdf,   ext: 'pdf',  label: 'PDF' },
    word:  { fn: exportIdeaReportWord,  ext: 'docx', label: 'Word' },
  } as const;

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' | 'word') => {
    setExporting(true);
    setExportingFormat(format);
    try {
      const { fn, ext, label } = EXPORT_CONFIG[format];
      const res = await fn(year === ALL_TIME ? undefined : year, toRangeParam(range));
      if (res?.data) {
        const url = URL.createObjectURL(res.data as Blob);
        const a = document.createElement('a');
        a.href = url; a.download = `bao-cao-dmst-${year === ALL_TIME ? 'tat-ca' : year}.${ext}`; a.click();
        URL.revokeObjectURL(url);
        message.success(`Đã xuất báo cáo (${label})`);
      } else {
        message.error('Không xuất được báo cáo');
      }
    } catch {
      message.error('Không xuất được báo cáo');
    } finally { setExporting(false); setExportingFormat(null); }
  };

  // ── Charts ──────────────────────────────────────────────────────────────────
  const monthlyOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#2563eb'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: Array.from({ length: 12 }, (_, i) => `T${i + 1}`) },
    yaxis: { labels: { formatter: (v: number) => `${Math.round(v)}` } },
    grid: { strokeDashArray: 4 },
  };

  const statusSeries = dash
    ? [dash.soBanNhap, dash.soDaNop, dash.soDaTiepNhan, dash.soTraLai, dash.soDuocCongNhan]
    : [];
  const statusOptions: ApexOptions = {
    labels: ['Bản nháp', 'Đã nộp/Chờ xét duyệt', 'Đã tiếp nhận', 'Đã trả lại', 'Được công nhận'],
    colors: ['#94a3b8', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'],
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
  };

  // ── Tables ──────────────────────────────────────────────────────────────────
  const groupColumns = (label: string) => [
    { title: label, dataIndex: 'ten', key: 'ten', render: (t: string) => <span className="fw-semibold">{t}</span> },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'soLuong', width: 100, className: 'text-center' },
    { title: 'Được duyệt', dataIndex: 'soDuocDuyet', key: 'soDuocDuyet', width: 110, className: 'text-center' },
    {
      title: 'Công nhận', dataIndex: 'soDuocCongNhan', key: 'soDuocCongNhan', width: 100, className: 'text-center',
      render: (v: number) => v > 0 ? <Tag color="purple">{v}</Tag> : <span className="text-muted">0</span>,
    },
    {
      title: 'Tỷ lệ duyệt', key: 'rate', width: 100, className: 'text-center',
      render: (_: unknown, r: INhomSoLuong) =>
        r.soLuong > 0 ? `${Math.round((r.soDuocDuyet / r.soLuong) * 100)}%` : '—',
    },
  ];

  const lbColumns = (isUnit: boolean) => [
    {
      title: '#', dataIndex: 'xepHang', key: 'xepHang', width: 56, className: 'text-center',
      render: (v: number) =>
        v === 1 ? <i className="fa-solid fa-trophy text-warning fs-5" />
        : v === 2 ? <i className="fa-solid fa-trophy text-secondary fs-5" />
        : v === 3 ? <i className="fa-solid fa-trophy" style={{ color: '#cd7f32' }} />
        : <span className="text-muted fw-semibold">{v}</span>,
    },
    {
      title: isUnit ? 'Đơn vị' : 'Cá nhân', dataIndex: 'ten', key: 'ten',
      render: (t: string, r: IIdeaContribution) => (
        <div>
          <div className="fw-semibold">{t}</div>
          {!isUnit && r.donVi && <div className="text-muted fs-8">{r.donVi}</div>}
        </div>
      ),
    },
    { title: 'Số nộp', dataIndex: 'soNop', key: 'soNop', width: 90, className: 'text-center' },
    { title: 'Được duyệt', dataIndex: 'soDuocDuyet', key: 'soDuocDuyet', width: 110, className: 'text-center' },
    {
      title: 'Công nhận', dataIndex: 'soDuocCongNhan', key: 'soDuocCongNhan', width: 100, className: 'text-center',
      render: (v: number) => v > 0 ? <Tag color="purple">{v}</Tag> : <span className="text-muted">0</span>,
    },
  ];

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
      ]}>Báo cáo & thống kê</PageTitle>

      <Content>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
          <div>
            <h4 className="fw-bold text-gray-900 mb-1">Báo cáo hoạt động Đổi mới sáng tạo</h4>
            <p className="text-muted fs-7 mb-0">
              Số liệu thời gian thực từ hồ sơ ý tưởng — trạng thái, đơn vị, lĩnh vực, SLA xử lý và xếp hạng đóng góp
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <Tooltip title={range ? 'Đang lọc theo khoảng thời gian tùy chọn — bỏ chọn khoảng ngày để quay lại lọc theo năm' : ''}>
              <Select value={year} onChange={changeYear} style={{ width: 110 }} disabled={!!range}>
                <Option value={ALL_TIME}>Tất cả</Option>
                {YEARS.map(y => <Option key={y} value={y}>{y}</Option>)}
              </Select>
            </Tooltip>
            <RangePicker
              value={range as any}
              onChange={changeRange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              allowClear
              style={{ width: 240 }}
            />
            <Tooltip title="Làm mới">
              <Button icon={<i className="fa-regular fa-refresh" />} onClick={() => { loadDash(); loadLb(); }} />
            </Tooltip>
            <Tooltip title="Xuất CSV (mở bằng Excel)">
              <Button loading={exporting && exportingFormat === 'csv'} onClick={() => handleExport('csv')}
                icon={<i className="fa-regular fa-file-csv" />} />
            </Tooltip>
            <Tooltip title="Xuất Word">
              <Button loading={exporting && exportingFormat === 'word'} onClick={() => handleExport('word')}
                icon={<i className="fa-regular fa-file-word" />} />
            </Tooltip>
            <Tooltip title="Xuất Excel">
              <Button type="primary" loading={exporting && exportingFormat === 'excel'} onClick={() => handleExport('excel')}
                icon={<i className="fa-regular fa-file-excel me-1" />}>
                Excel
              </Button>
            </Tooltip>
            <Tooltip title="Xuất PDF">
              <Button danger loading={exporting && exportingFormat === 'pdf'} onClick={() => handleExport('pdf')}
                icon={<i className="fa-regular fa-file-pdf me-1" />}>
                PDF
              </Button>
            </Tooltip>
          </div>
        </div>

        <Spin spinning={loading}>
          {!dash && !loading ? (
            <Empty description="Chưa có dữ liệu" className="py-10" />
          ) : dash && (
            <>
              {/* KPI hàng 1 — trạng thái */}
              <div className="row g-4 mb-4">
                <div className="col-6 col-xl-2"><KpiCard title="Tổng ý tưởng" value={fmtNum(dash.tongYTuong)} icon="fa-lightbulb" color="primary" /></div>
                <div className="col-6 col-xl-2"><KpiCard title="Đã nộp/Chờ xét duyệt" value={fmtNum(dash.soDaNop)} icon="fa-clock" color="warning" /></div>
                <div className="col-6 col-xl-2"><KpiCard title="Đã tiếp nhận" value={fmtNum(dash.soDaTiepNhan)} icon="fa-circle-check" color="info" /></div>
                <div className="col-6 col-xl-2"><KpiCard title="Được công nhận" value={fmtNum(dash.soDuocCongNhan)} icon="fa-medal" color="success" /></div>
                <div className="col-6 col-xl-2"><KpiCard title="Người tham gia" value={fmtNum(dash.soNguoiThamGia)} icon="fa-users" color="primary" /></div>
                <div className="col-6 col-xl-2"><KpiCard title="Đơn vị tham gia" value={fmtNum(dash.soDonViThamGia)} icon="fa-building" color="info" /></div>
              </div>

              {/* KPI hàng 2 — SLA */}
              <div className="row g-4 mb-4">
                <div className="col-6 col-xl-3">
                  <KpiCard title="Thời gian xử lý trung bình" icon="fa-stopwatch" color="primary"
                    value={dash.gioXuLyTrungBinh != null ? `${dash.gioXuLyTrungBinh} giờ` : '—'} />
                </div>
                <div className="col-6 col-xl-3">
                  <KpiCard title={`Tỷ lệ đúng hạn (SLA ${dash.slaGio}h)`} icon="fa-gauge-high" color="success"
                    value={dash.tyLeDungHan != null ? `${dash.tyLeDungHan}%` : '—'} />
                </div>
                <div className="col-6 col-xl-3">
                  <KpiCard title="Hồ sơ đang chờ xử lý" icon="fa-inbox" color="warning" value={fmtNum(dash.soChoXuLy)} />
                </div>
                <div className="col-6 col-xl-3">
                  <KpiCard title="Tồn đọng quá hạn" icon="fa-triangle-exclamation" color="danger"
                    value={fmtNum(dash.soTonDong)}
                    sub={dash.soTonDong > 0 ? 'Cần xử lý ngay' : 'Không có tồn đọng'} />
                </div>
              </div>

              {/* Charts */}
              <div className="row g-4 mb-4">
                <div className="col-xl-8">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                    <div className="card-body p-5">
                      <div className="fw-bold text-gray-800 mb-3">
                        <i className="fa-regular fa-chart-column text-primary me-2" />
                        Ý tưởng nộp theo tháng — {dash.nam}{year === ALL_TIME && !range ? ' (năm hiện tại)' : ''}
                      </div>
                      <ReactApexChart type="bar" height={260}
                        series={[{ name: 'Số nộp', data: dash.nopTheoThang }]}
                        options={monthlyOptions} />
                    </div>
                  </div>
                </div>
                <div className="col-xl-4">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                    <div className="card-body p-5">
                      <div className="fw-bold text-gray-800 mb-3">
                        <i className="fa-regular fa-chart-pie text-primary me-2" />
                        Phân bố theo trạng thái
                      </div>
                      {statusSeries.every(v => v === 0)
                        ? <Empty description="Chưa có dữ liệu" style={{ padding: 24 }} />
                        : <ReactApexChart type="donut" height={260} series={statusSeries} options={statusOptions} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Theo lĩnh vực / đơn vị */}
              <div className="row g-4 mb-4">
                <div className="col-xl-6">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                    <div className="card-body p-5">
                      <div className="fw-bold text-gray-800 mb-3">
                        <i className="fa-regular fa-tags text-primary me-2" />Theo lĩnh vực
                      </div>
                      <Table columns={groupColumns('Lĩnh vực')} dataSource={dash.theoLinhVuc}
                        rowKey="ten" size="small" pagination={false}
                        locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }} />
                    </div>
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                    <div className="card-body p-5">
                      <div className="fw-bold text-gray-800 mb-3">
                        <i className="fa-regular fa-building text-primary me-2" />Theo đơn vị
                      </div>
                      <Table columns={groupColumns('Đơn vị')} dataSource={dash.theoDonVi}
                        rowKey="ten" size="small" pagination={false}
                        locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                <div className="card-body p-5">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div className="fw-bold text-gray-800">
                      <i className="fa-regular fa-ranking-star text-primary me-2" />
                      Bảng xếp hạng đóng góp {lb?.ky ? `— ${lb.ky}` : ''}
                    </div>
                    <div className="d-flex gap-2">
                      {range ? (
                        <Tag color="blue" className="d-flex align-items-center">Đang lọc theo khoảng ngày đã chọn</Tag>
                      ) : year === ALL_TIME ? (
                        <Tag color="blue" className="d-flex align-items-center">Toàn thời gian</Tag>
                      ) : (
                        <>
                          <Select value={lbPeriod} style={{ width: 110 }}
                            onChange={(p: 'nam' | 'quy' | 'thang') => { setLbPeriod(p); setLbValue(1); loadLb(year, p, 1); }}>
                            <Option value="nam">Năm</Option>
                            <Option value="quy">Quý</Option>
                            <Option value="thang">Tháng</Option>
                          </Select>
                          {lbPeriod !== 'nam' && (
                            <Select value={lbValue} style={{ width: 110 }}
                              onChange={(v: number) => { setLbValue(v); loadLb(year, lbPeriod, v); }}>
                              {(lbPeriod === 'quy' ? [1, 2, 3, 4] : Array.from({ length: 12 }, (_, i) => i + 1)).map(v => (
                                <Option key={v} value={v}>{lbPeriod === 'quy' ? `Quý ${v}` : `Tháng ${v}`}</Option>
                              ))}
                            </Select>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <Spin spinning={lbLoading}>
                    <Tabs
                      items={[
                        {
                          key: 'ca-nhan',
                          label: <span><i className="fa-regular fa-user me-1" />Cá nhân</span>,
                          children: (
                            <Table columns={lbColumns(false)} dataSource={lb?.caNhan ?? []}
                              rowKey="ten" size="small" pagination={false}
                              locale={{ emptyText: <Empty description="Chưa có dữ liệu trong kỳ" /> }} />
                          ),
                        },
                        {
                          key: 'don-vi',
                          label: <span><i className="fa-regular fa-building me-1" />Đơn vị</span>,
                          children: (
                            <Table columns={lbColumns(true)} dataSource={lb?.donVi ?? []}
                              rowKey="ten" size="small" pagination={false}
                              locale={{ emptyText: <Empty description="Chưa có dữ liệu trong kỳ" /> }} />
                          ),
                        },
                      ]}
                    />
                  </Spin>
                </div>
              </div>

              {/* Mock data sections — Các báo cáo minh họa chưa xây dựng */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                <div className="card-body p-5">
                  <div className="fw-bold text-gray-800 mb-4">
                    <i className="fa-regular fa-chart-line text-warning me-2" />
                    Phân tích & báo cáo khác
                    {/* Các báo cáo minh họa (dữ liệu chưa xây dựng) */}
                  </div>
                  <Tabs
                    items={[
                      // {
                      //   key: 'role-views',
                      //   label: <span><i className="fa-regular fa-user-tie me-1" />Dashboard theo vai trò</span>,
                      //   children: (
                      //     <div className="row g-3">
                      //       {ROLE_VIEWS.map((role, idx) => (
                      //         <div key={idx} className="col-sm-6 col-xl-3">
                      //           <div className={`card bg-light-${role.color}`}>
                      //             <div className="card-body text-center py-4">
                      //               <i className={`fa-regular ${role.icon} fs-2 text-${role.color} mb-2 d-block`} />
                      //               <h5 className="fw-bold">{role.role}</h5>
                      //               {role.kpis.map((kpi, i) => (
                      //                 <div key={i} className="text-muted fs-8">{kpi}</div>
                      //               ))}
                      //             </div>
                      //           </div>
                      //         </div>
                      //       ))}
                      //     </div>
                      //   ),
                      // },
                      {
                        key: 'campaigns',
                        label: <span><i className="fa-regular fa-megaphone me-1" />Chiến dịch</span>,
                        children: (
                          <Table columns={[
                            { title: 'Tên chiến dịch', dataIndex: 'ten', key: 'ten' },
                            { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', render: (v: string) => <Tag color={v === 'Đang diễn ra' ? 'blue' : 'green'}>{v}</Tag> },
                            { title: 'Người tham gia', dataIndex: 'ngUoiThamGia', key: 'ngUoiThamGia', align: 'center' as const },
                            { title: 'Số nộp', dataIndex: 'soNop', key: 'soNop', align: 'center' as const },
                            { title: '% hoàn thành', dataIndex: 'tyLeHoanThanh', key: 'tyLeHoanThanh', align: 'center' as const, render: (v: number) => `${v}%` },
                          ]}
                          dataSource={CAMPAIGNS} rowKey="ten" size="small" pagination={false} />
                        ),
                      },
                      {
                        key: 'cds-programs',
                        label: <span><i className="fa-regular fa-flask me-1" />Chương trình CĐS/R&D</span>,
                        children: (
                          <Table columns={[
                            { title: 'Chương trình', dataIndex: 'ten', key: 'ten' },
                            { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', render: (v: string) => <span style={{ color: CDS_STATUS_COLOR[v], fontWeight: 'bold' }}>{v}</span> },
                            { title: 'Tiến độ', dataIndex: 'tienDo', key: 'tienDo', align: 'center' as const, render: (v: number) => `${v}%` },
                            { title: 'Ngân sách', dataIndex: 'nganSach', key: 'nganSach', align: 'center' as const, render: (v: number) => `${v}%` },
                            { title: 'Mốc/Hoàn thành', dataIndex: 'mocTong', key: 'mocTong', align: 'center' as const, render: (_: any, r: any) => `${r.mocHoanThanh}/${r.mocTong}` },
                          ]}
                          dataSource={CDS_PROGRAMS} rowKey="ten" size="small" pagination={false} />
                        ),
                      },
                      {
                        key: 'quy-khcn',
                        label: <span><i className="fa-regular fa-wallet me-1" />Quỹ KHCN</span>,
                        children: (
                          <Table columns={[
                            { title: 'Loại quỹ', dataIndex: 'loaiQuy', key: 'loaiQuy' },
                            { title: 'Ngân sách đầu', dataIndex: 'nganSachDau', key: 'nganSachDau', align: 'right' as const, render: (v: number) => fmtNum(v) },
                            { title: 'Đã chi', dataIndex: 'daChi', key: 'daChi', align: 'right' as const, render: (v: number) => fmtNum(v) },
                            { title: 'Còn lại', key: 'conLai', align: 'right' as const, render: (_: any, r: any) => fmtNum(r.nganSachDau - r.daChi) },
                          ]}
                          dataSource={QUY_KHCN} rowKey="loaiQuy" size="small" pagination={false} />
                        ),
                      },
                      {
                        key: 'chi-thuong',
                        label: <span><i className="fa-regular fa-gift me-1" />Chi thưởng</span>,
                        children: (
                          <Table columns={[
                            { title: 'Đối tượng', dataIndex: 'doiTuong', key: 'doiTuong' },
                            { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi' },
                            { title: 'Tiền thưởng', dataIndex: 'tienThuong', key: 'tienThuong', align: 'right' as const, render: (v: number) => fmtNum(v) + ' đ' },
                            { title: 'Điểm', dataIndex: 'diemThuong', key: 'diemThuong', align: 'center' as const },
                            { title: 'Kỳ', dataIndex: 'kyThuong', key: 'kyThuong' },
                          ]}
                          dataSource={CHI_THUONG} rowKey="doiTuong" size="small" pagination={false} />
                        ),
                      },
                      {
                        key: 'vi-giao-dich',
                        label: <span><i className="fa-regular fa-coins me-1" />Ví & giao dịch</span>,
                        children: (
                          <Table columns={[
                            { title: 'Thời gian', dataIndex: 'thoiGian', key: 'thoiGian', width: 150 },
                            { title: 'Loại', dataIndex: 'loai', key: 'loai' },
                            { title: 'Ví', dataIndex: 'vi', key: 'vi' },
                            { title: 'Số tiền', dataIndex: 'soTien', key: 'soTien', align: 'right' as const, render: (v: string) => <span className={v.startsWith('+') ? 'text-success' : 'text-danger'}><strong>{v}</strong></span> },
                            { title: 'Số dư', dataIndex: 'soDu', key: 'soDu', align: 'right' as const, render: (v: number) => fmtNum(v) },
                          ]}
                          dataSource={VI_GIAO_DICH} rowKey="thoiGian" size="small" pagination={false} />
                        ),
                      },
                      {
                        key: 'qua-tang',
                        label: <span><i className="fa-regular fa-box-gift me-1" />Quà tặng</span>,
                        children: (
                          <Table columns={[
                            { title: 'Quà tặng', dataIndex: 'ten', key: 'ten' },
                            { title: 'Đã quy đổi', dataIndex: 'daQuyDoi', key: 'daQuyDoi', align: 'center' as const },
                            { title: 'Tồn kho', dataIndex: 'tonKho', key: 'tonKho', align: 'center' as const },
                            { title: 'Chi phí (đ)', dataIndex: 'chiPhi', key: 'chiPhi', align: 'right' as const, render: (v: number) => fmtNum(v) },
                          ]}
                          dataSource={QUA_TANG} rowKey="ten" size="small" pagination={false} />
                        ),
                      },
                      {
                        key: 'usage',
                        label: <span><i className="fa-regular fa-chart-bar me-1" />Sử dụng hệ thống</span>,
                        children: (
                          <Table columns={[
                            { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi' },
                            { title: 'Hoạt động', dataIndex: 'hoatDong', key: 'hoatDong', align: 'center' as const },
                            { title: 'Tần suất đăng nhập', dataIndex: 'tanSuatDangNhap', key: 'tanSuatDangNhap', align: 'center' as const, render: (v: number) => `${v} lần/tuần` },
                            { title: '% sử dụng', dataIndex: 'tyLeSuDung', key: 'tyLeSuDung', align: 'center' as const, render: (v: number) => `${v}%` },
                          ]}
                          dataSource={USAGE_BY_DEPT} rowKey="donVi" size="small" pagination={false} />
                        ),
                      },
                    ]}
                  />
                </div>
              </div>
            </>
          )}
        </Spin>
      </Content>
    </>
  );
};
