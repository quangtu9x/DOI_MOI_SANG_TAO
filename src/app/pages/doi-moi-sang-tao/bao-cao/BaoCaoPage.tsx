import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Select, DatePicker, message, Table, Tag, Spin, Empty, Tabs, Tooltip, Row, Col, Statistic } from 'antd';
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

const REPORT_DATA = [
  { stt: 1, linhVuc: 'Khai thác bay', tongSo: 52, choDuyet: 7, daDuyet: 34, tuChoi: 6, congNhan: 5 },
  { stt: 2, linhVuc: 'Kỹ thuật bảo dưỡng', tongSo: 45, choDuyet: 8, daDuyet: 28, tuChoi: 5, congNhan: 4 },
  { stt: 3, linhVuc: 'Dịch vụ hành khách', tongSo: 38, choDuyet: 6, daDuyet: 24, tuChoi: 5, congNhan: 3 },
  { stt: 4, linhVuc: 'Dịch vụ mặt đất', tongSo: 32, choDuyet: 5, daDuyet: 20, tuChoi: 4, congNhan: 3 },
  { stt: 5, linhVuc: 'Công nghệ thông tin', tongSo: 27, choDuyet: 3, daDuyet: 17, tuChoi: 4, congNhan: 3 },
  { stt: 6, linhVuc: 'Đào tạo nhân lực', tongSo: 20, choDuyet: 2, daDuyet: 12, tuChoi: 3, congNhan: 3 },
];

const TOTALS = REPORT_DATA.reduce(
  (acc, row) => ({
    tongSo: acc.tongSo + row.tongSo,
    choDuyet: acc.choDuyet + row.choDuyet,
    daDuyet: acc.daDuyet + row.daDuyet,
    tuChoi: acc.tuChoi + row.tuChoi,
    congNhan: acc.congNhan + row.congNhan,
  }),
  { tongSo: 0, choDuyet: 0, daDuyet: 0, tuChoi: 0, congNhan: 0 }
);

type ReportObjectType = 'YTuong' | 'GiaiPhap' | 'SangKien';
type ReportTemplateKey =
  | 'trang-thai'
  | 'hieu-qua'
  | 'sla'
  | 'dong-gop'
  | 'leaderboard'
  | 'tuong-tac'
  | 'chien-dich'
  | 'chuong-trinh'
  | 'quy'
  | 'chi-thuong'
  | 'vi-giao-dich'
  | 'qua-tang'
  | 'usage'
  | 'roi';

const REPORT_OBJECT_OPTIONS: { value: ReportObjectType; label: string }[] = [
  { value: 'YTuong', label: 'Ý tưởng' },
  { value: 'GiaiPhap', label: 'Giải pháp' },
  { value: 'SangKien', label: 'Sáng kiến' },
];

const REPORT_TEMPLATES: { value: ReportTemplateKey; label: string; group: string; desc: string }[] = [
  { value: 'trang-thai', label: 'Thống kê theo trạng thái', group: 'Ý tưởng/Giải pháp/Sáng kiến', desc: 'Nháp, nộp, phê duyệt, triển khai, không thông qua' },
  { value: 'hieu-qua', label: 'Hiệu quả ĐMST', group: 'Ý tưởng/Giải pháp/Sáng kiến', desc: 'Tiết kiệm chi phí, tăng doanh thu, chất lượng, nhân rộng' },
  { value: 'sla', label: 'Quy trình xử lý & SLA', group: 'Ý tưởng/Giải pháp/Sáng kiến', desc: 'Thời gian xử lý, đúng hạn/quá hạn, tồn đọng' },
  { value: 'dong-gop', label: 'Đóng góp cá nhân/đơn vị', group: 'Ý tưởng/Giải pháp/Sáng kiến', desc: 'Số nộp, phê duyệt, điểm thưởng, huy hiệu' },
  { value: 'leaderboard', label: 'Bảng xếp hạng', group: 'Ý tưởng/Giải pháp/Sáng kiến', desc: 'Xếp hạng theo tháng/quý/năm' },
  { value: 'tuong-tac', label: 'Báo cáo tương tác hệ thống', group: 'Cộng đồng/Kho tri thức', desc: 'Lượt xem, thích, bình luận, mức độ sử dụng' },
  { value: 'chien-dich', label: 'Báo cáo chiến dịch ĐMST', group: 'Chương trình/chiến dịch', desc: 'Người tham gia, số nộp, tỷ lệ hoàn thành, thưởng, huy hiệu' },
  { value: 'chuong-trinh', label: 'Chương trình/dự án CĐS/R&D/Sandbox', group: 'Chương trình/chiến dịch', desc: 'Tiến độ, trạng thái, milestone, ngân sách, hiệu quả' },
  { value: 'quy', label: 'Quỹ phát triển KHCN', group: 'Tài chính', desc: 'Ngân sách đầu, đã chi, còn lại theo loại quỹ' },
  { value: 'chi-thuong', label: 'Chi thưởng', group: 'Tài chính', desc: 'Chi tiền thưởng và điểm thưởng theo đối tượng' },
  { value: 'vi-giao-dich', label: 'Ví và giao dịch', group: 'Tài chính', desc: 'Lịch sử giao dịch, số dư, đối soát' },
  { value: 'qua-tang', label: 'Quy đổi quà tặng', group: 'Tài chính', desc: 'Số quy đổi, loại quà, tồn kho, chi phí' },
  { value: 'usage', label: 'Người dùng & sử dụng hệ thống', group: 'Vận hành', desc: 'Người dùng hoạt động, tần suất, tỷ lệ sử dụng' },
  { value: 'roi', label: 'Ngân sách & ROI', group: 'Phân tích nâng cao', desc: 'So sánh chi phí và giá trị mang lại' },
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

  // ── Bộ lọc bổ sung cho báo cáo ──────────────────────────────────────────────
  const [filterDonVi, setFilterDonVi] = useState<string>('');
  const [filterLinhVuc, setFilterLinhVuc] = useState<string>('');
  const [filterHieuQua, setFilterHieuQua] = useState<string>('');

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
  const [reportObject, setReportObject] = useState<ReportObjectType>('YTuong');
  const [reportTemplate, setReportTemplate] = useState<ReportTemplateKey>('trang-thai');

  const templateOptions = useMemo(() => {
    const allowedGroups: Record<ReportObjectType, string[]> = {
      YTuong: ['Ý tưởng/Giải pháp/Sáng kiến', 'Phân tích nâng cao'],
      GiaiPhap: ['Ý tưởng/Giải pháp/Sáng kiến', 'Cộng đồng/Kho tri thức', 'Tài chính', 'Vận hành', 'Phân tích nâng cao'],
      SangKien: ['Ý tưởng/Giải pháp/Sáng kiến', 'Chương trình/chiến dịch', 'Tài chính', 'Vận hành', 'Phân tích nâng cao'],
    };
    return REPORT_TEMPLATES.filter(t => allowedGroups[reportObject].includes(t.group));
  }, [reportObject]);

  const selectedTemplate = useMemo(
    () => templateOptions.find(t => t.value === reportTemplate) ?? templateOptions[0] ?? REPORT_TEMPLATES[0],
    [templateOptions, reportTemplate]
  );

  useEffect(() => {
    if (!templateOptions.some(t => t.value === reportTemplate) && templateOptions[0]) {
      setReportTemplate(templateOptions[0].value);
    }
  }, [templateOptions, reportTemplate]);

  const reportRows = useMemo(() => {
    // Lọc dữ liệu theo bộ lọc bổ sung (đơn vị, lĩnh vực, mức độ hiệu quả)
    const filterByDonVi = (items: any[]) => {
      if (!filterDonVi) return items;
      return items.filter(x => (x.donVi || '').includes(filterDonVi) || (x.ten || '').includes(filterDonVi));
    };
    const filterByLinhVuc = (items: any[]) => {
      if (!filterLinhVuc) return items;
      return items.filter(x => (x.linhVuc || '').includes(filterLinhVuc) || (x.ten || '').includes(filterLinhVuc));
    };
    const filterByHieuQua = (items: any[]) => {
      if (!filterHieuQua) return items;
      return items.filter(x => (x.chatLuong || '').includes(filterHieuQua));
    };

    switch (reportTemplate) {
      case 'trang-thai': {
        // Thống kê theo trạng thái: nháp, đã nộp, phê duyệt, triển khai, không thông qua
        const rows = dash ? [
          { ten: 'Bản nháp', soLuong: dash.soBanNhap, ghiChu: 'Chưa nộp - ý tưởng mới khởi tạo' },
          { ten: 'Đã nộp', soLuong: dash.soDaNop, ghiChu: 'Chờ xét duyệt' },
          { ten: 'Đã tiếp nhận (Phê duyệt)', soLuong: dash.soDaTiepNhan, ghiChu: 'Đã được phê duyệt' },
          { ten: 'Đang triển khai', soLuong: Math.round((dash.soDuocCongNhan ?? 0) * 0.6), ghiChu: 'Ước tính từ số được công nhận' },
          { ten: 'Được công nhận', soLuong: dash.soDuocCongNhan, ghiChu: 'Đã hoàn tất & công nhận' },
          { ten: 'Đã trả lại (Không thông qua)', soLuong: dash.soTraLai, ghiChu: 'Cần bổ sung hoặc từ chối' },
          { ten: 'Đã hủy', soLuong: dash.soDaHuy ?? 0, ghiChu: 'Bị hủy bỏ' },
        ] : [];
        return filterByDonVi(filterByLinhVuc(rows));
      }
      case 'hieu-qua': {
        // Thống kê theo mức độ hiệu quả
        let data = HIEU_QUA_DATA.map(x => ({
          ten: x.ten,
          soLuong: x.tietKiem,
          tietKiem: x.tietKiem,
          doanhThu: x.doanhThu,
          nhanRong: x.nhanRong,
          chatLuong: x.chatLuong,
          ghiChu: `${fmtNum(x.nhanRong)} lần nhân rộng • Chất lượng: ${x.chatLuong}`,
          linhVuc: '',
          donVi: '',
        }));
        data = filterByDonVi(data);
        data = filterByLinhVuc(data);
        data = filterByHieuQua(data);
        return data;
      }
      case 'sla':
        return dash ? [
          { ten: 'Thời gian xử lý trung bình', soLuong: dash.gioXuLyTrungBinh ?? 0, ghiChu: `SLA ${dash.slaGio}h` },
          { ten: 'Tỷ lệ đúng hạn', soLuong: dash.tyLeDungHan ?? 0, ghiChu: 'Phần trăm' },
          { ten: 'Hồ sơ đang chờ xử lý', soLuong: dash.soChoXuLy, ghiChu: 'Đang mở' },
          { ten: 'Tồn đọng quá hạn', soLuong: dash.soTonDong, ghiChu: 'Cảnh báo' },
        ] : [];
      case 'dong-gop': {
        let data = (lb?.caNhan ?? []).map(x => ({
          ...x,
          linhVuc: '',
          donVi: x.donVi || '',
          chatLuong: '',
        }));
        data = filterByDonVi(data);
        return data;
      }
      case 'leaderboard': {
        let data = [...(lb?.caNhan ?? []), ...(lb?.donVi ?? [])].map(x => ({
          ...x,
          linhVuc: '',
          donVi: (x as any).donVi || '',
          chatLuong: '',
        }));
        data = filterByDonVi(data);
        return data;
      }
      case 'tuong-tac': {
        let data = USAGE_BY_DEPT.map(x => ({
          ten: x.donVi,
          soLuong: x.hoatDong,
          ghiChu: `${x.tanSuatDangNhap} lần/tuần`,
          linhVuc: '',
          donVi: x.donVi,
          chatLuong: '',
        }));
        data = filterByDonVi(data);
        return data;
      }
      case 'chien-dich':
        return CAMPAIGNS;
      case 'chuong-trinh':
        return CDS_PROGRAMS;
      case 'quy':
        return QUY_KHCN;
      case 'chi-thuong':
        return CHI_THUONG.map(x => ({ ten: x.doiTuong, soLuong: x.tienThuong, ghiChu: `${x.donVi} • ${x.kyThuong}` }));
      case 'vi-giao-dich':
        return VI_GIAO_DICH;
      case 'qua-tang':
        return QUA_TANG.map(x => ({ ten: x.ten, soLuong: x.daQuyDoi, ghiChu: `${x.tonKho} quà còn lại • ${fmtNum(x.chiPhi)} đ` }));
      case 'roi':
        return dash ? [{ ten: 'Ngân sách vs hiệu quả', soLuong: dash.soDuocCongNhan, ghiChu: 'Báo cáo ROI cần hoàn thiện dữ liệu chuyên sâu' }] : [];
      case 'usage': {
        let data = USAGE_BY_DEPT.map(x => ({
          ten: x.donVi,
          soLuong: x.hoatDong,
          ghiChu: `${x.tanSuatDangNhap} lần/tuần • ${x.tyLeSuDung}% sử dụng`,
          linhVuc: '',
          donVi: x.donVi,
          chatLuong: '',
        }));
        data = filterByDonVi(data);
        return data;
      }
      default:
        return [];
    }
  }, [reportTemplate, dash, lb, filterDonVi, filterLinhVuc, filterHieuQua]);

  const reportColumns = useMemo(() => {
    const baseColumns = [
      { title: 'Chỉ tiêu', dataIndex: 'ten', key: 'ten', render: (value: string) => <span className="fw-semibold">{value}</span> },
      { title: 'Giá trị', dataIndex: 'soLuong', key: 'soLuong', width: 130, align: 'right' as const, render: (value: any) => typeof value === 'number' ? fmtNum(value) : (value ?? '—') },
      { title: 'Ghi chú', dataIndex: 'ghiChu', key: 'ghiChu', render: (value: string) => value || <span className="text-muted">—</span> },
    ];

    if (reportTemplate === 'leaderboard') {
      return [
        { title: 'Xếp hạng', dataIndex: 'xepHang', key: 'xepHang', width: 100, align: 'center' as const },
        { title: 'Tên', dataIndex: 'ten', key: 'ten', render: (value: string) => <span className="fw-semibold">{value}</span> },
        { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', render: (value: string) => value || <span className="text-muted">—</span> },
        { title: 'Điểm', dataIndex: 'diem', key: 'diem', width: 120, align: 'right' as const, render: (value: any) => fmtNum(value) },
      ];
    }

    if (reportTemplate === 'dong-gop') {
      return [
        { title: 'Xếp hạng', dataIndex: 'xepHang', key: 'xepHang', width: 100, align: 'center' as const },
        { title: 'Tên', dataIndex: 'ten', key: 'ten', render: (value: string) => <span className="fw-semibold">{value}</span> },
        { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', render: (value: string) => value || <span className="text-muted">—</span> },
        { title: 'Điểm', dataIndex: 'diem', key: 'diem', width: 120, align: 'right' as const, render: (value: any) => fmtNum(value) },
      ];
    }

    if (reportTemplate === 'chien-dich') {
      return [
        { title: 'Chiến dịch', dataIndex: 'ten', key: 'ten', render: (value: string) => <span className="fw-semibold">{value}</span> },
        { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', render: (value: string) => <Tag color={value === 'Đang diễn ra' ? 'blue' : 'green'}>{value}</Tag> },
        { title: 'Tham gia', dataIndex: 'ngUoiThamGia', key: 'ngUoiThamGia', width: 110, align: 'right' as const },
        { title: 'Hoàn thành', dataIndex: 'tyLeHoanThanh', key: 'tyLeHoanThanh', width: 110, align: 'right' as const, render: (value: number) => `${value}%` },
      ];
    }

    if (reportTemplate === 'chuong-trinh') {
      return [
        { title: 'Chương trình', dataIndex: 'ten', key: 'ten', render: (value: string) => <span className="fw-semibold">{value}</span> },
        { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', render: (value: string) => <span style={{ color: CDS_STATUS_COLOR[value], fontWeight: 600 }}>{value}</span> },
        { title: 'Tiến độ', dataIndex: 'tienDo', key: 'tienDo', width: 110, align: 'right' as const, render: (value: number) => `${value}%` },
        { title: 'Ngân sách', dataIndex: 'nganSach', key: 'nganSach', width: 110, align: 'right' as const, render: (value: number) => `${value}%` },
      ];
    }

    if (reportTemplate === 'quy') {
      return [
        { title: 'Loại quỹ', dataIndex: 'loaiQuy', key: 'loaiQuy', render: (value: string) => <span className="fw-semibold">{value}</span> },
        { title: 'Ngân sách đầu', dataIndex: 'nganSachDau', key: 'nganSachDau', width: 140, align: 'right' as const, render: (value: number) => fmtNum(value) },
        { title: 'Đã chi', dataIndex: 'daChi', key: 'daChi', width: 140, align: 'right' as const, render: (value: number) => fmtNum(value) },
        { title: 'Còn lại', key: 'conLai', width: 140, align: 'right' as const, render: (_: unknown, row: any) => fmtNum(row.nganSachDau - row.daChi) },
      ];
    }

    if (reportTemplate === 'vi-giao-dich') {
      return [
        { title: 'Thời gian', dataIndex: 'thoiGian', key: 'thoiGian', width: 160 },
        { title: 'Loại', dataIndex: 'loai', key: 'loai' },
        { title: 'Ví', dataIndex: 'vi', key: 'vi' },
        { title: 'Số tiền', dataIndex: 'soTien', key: 'soTien', width: 110, align: 'right' as const, render: (value: string) => <span className={value.startsWith('+') ? 'text-success' : 'text-danger'}>{value}</span> },
        { title: 'Số dư', dataIndex: 'soDu', key: 'soDu', width: 110, align: 'right' as const, render: (value: number) => fmtNum(value) },
      ];
    }

    return baseColumns;
  }, [reportTemplate]);

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
      ]}>Báo cáo</PageTitle>

      <Content>
        <Spin spinning={loading}>
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                <div className="card-body p-5">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                      <div className="fw-bold text-gray-800 fs-4 mb-1">
                        <i className="fa-regular fa-chart-line text-warning me-2" />Báo cáo
                      </div>
                      <div className="text-muted fs-7">
                        Chọn đối tượng báo cáo, sau đó chọn mẫu để xem bảng kết quả trước khi xuất file.
                      </div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Tag color="blue">Dashboard = số liệu tổng quan</Tag>
                      <Tag color="gold">Báo cáo = chọn đối tượng + mẫu + bảng</Tag>
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-lg-3">
                      <div className="fs-8 fw-semibold text-muted mb-2">Đối tượng báo cáo</div>
                      <Select value={reportObject} onChange={(value) => setReportObject(value)} className="w-100" size="large">
                        {REPORT_OBJECT_OPTIONS.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
                      </Select>
                    </div>
                    <div className="col-lg-5">
                      <div className="fs-8 fw-semibold text-muted mb-2">Mẫu báo cáo</div>
                      <Select value={reportTemplate} onChange={(value) => setReportTemplate(value)} className="w-100" size="large">
                        {templateOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label} - {option.desc}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-lg-2 d-flex align-items-end">
                      <div className="w-100">
                        <div className="fs-8 fw-semibold text-muted mb-2">Năm</div>
                        <Select value={year} onChange={changeYear} className="w-100" size="large">
                          <Option value={ALL_TIME}>Tất cả</Option>
                          {YEARS.map(y => <Option key={y} value={y}>{y}</Option>)}
                        </Select>
                      </div>
                    </div>
                    <div className="col-lg-2 d-flex align-items-end">
                      <div className="w-100">
                        <div className="fs-8 fw-semibold text-muted mb-2">Khoảng thời gian</div>
                        <RangePicker value={range as any} onChange={changeRange} className="w-100" size="large" allowClear format="DD/MM/YYYY" />
                      </div>
                    </div>
                  </div>

                  {/* Bộ lọc bổ sung: đơn vị, lĩnh vực, mức độ hiệu quả */}
                  <div className="row g-3 mb-4 p-3 rounded-3" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                    <div className="col-12">
                      <div className="fs-8 fw-semibold text-muted mb-2">
                        <i className="fa-regular fa-sliders me-1" />Bộ lọc bổ sung
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="fs-8 text-muted mb-1">Đơn vị</div>
                      <Select
                        value={filterDonVi}
                        onChange={setFilterDonVi}
                        className="w-100"
                        allowClear
                        placeholder="Tất cả đơn vị"
                      >
                        <Option value="">Tất cả đơn vị</Option>
                        <Option value="Ban Khai thác Bay">Ban Khai thác Bay</Option>
                        <Option value="Ban Dịch vụ Mặt đất">Ban Dịch vụ Mặt đất</Option>
                        <Option value="Trung tâm Kỹ thuật A76">Trung tâm Kỹ thuật A76</Option>
                        <Option value="Ban Kỹ thuật Bay">Ban Kỹ thuật Bay</Option>
                      </Select>
                    </div>
                    <div className="col-md-4">
                      <div className="fs-8 text-muted mb-1">Lĩnh vực</div>
                      <Select
                        value={filterLinhVuc}
                        onChange={setFilterLinhVuc}
                        className="w-100"
                        allowClear
                        placeholder="Tất cả lĩnh vực"
                      >
                        <Option value="">Tất cả lĩnh vực</Option>
                        <Option value="Khai thác bay">Khai thác bay</Option>
                        <Option value="Kỹ thuật bảo dưỡng">Kỹ thuật bảo dưỡng</Option>
                        <Option value="Dịch vụ hành khách">Dịch vụ hành khách</Option>
                        <Option value="Dịch vụ mặt đất">Dịch vụ mặt đất</Option>
                        <Option value="Công nghệ thông tin">Công nghệ thông tin</Option>
                        <Option value="Đào tạo nhân lực">Đào tạo nhân lực</Option>
                      </Select>
                    </div>
                    <div className="col-md-4">
                      <div className="fs-8 text-muted mb-1">Mức độ hiệu quả</div>
                      <Select
                        value={filterHieuQua}
                        onChange={setFilterHieuQua}
                        className="w-100"
                        allowClear
                        placeholder="Tất cả"
                      >
                        <Option value="">Tất cả</Option>
                        <Option value="Cao">Cao</Option>
                        <Option value="Trung bình">Trung bình</Option>
                        <Option value="Thấp">Thấp</Option>
                      </Select>
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="p-3 rounded-3 bg-light-primary h-100">
                        <div className="text-primary fw-semibold fs-8 mb-1">Đối tượng</div>
                        <div className="fs-5 fw-bold">{REPORT_OBJECT_OPTIONS.find(x => x.value === reportObject)?.label}</div>
                      </div>
                    </div>
                    <div className="col-md-5">
                      <div className="p-3 rounded-3 bg-light-warning h-100">
                        <div className="text-warning fw-semibold fs-8 mb-1">Mẫu hiện tại</div>
                        <div className="fs-6 fw-bold">{selectedTemplate.label}</div>
                        <div className="text-muted fs-8">{selectedTemplate.desc}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 rounded-3 bg-light-success h-100">
                        <div className="text-success fw-semibold fs-8 mb-1">Số dòng xem trước</div>
                        <div className="fs-4 fw-bold">{reportRows.length}</div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <div className="fw-bold text-gray-800">
                      <i className="fa-regular fa-table me-2 text-primary" />Bảng kết quả
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Tag color="geekblue">{selectedTemplate.group}</Tag>
                      <Tag color="cyan">{reportObject === 'YTuong' ? 'Ý tưởng' : reportObject === 'GiaiPhap' ? 'Giải pháp' : 'Sáng kiến'}</Tag>
                    </div>
                  </div>

                  <Table
                    columns={reportColumns as any}
                    dataSource={reportRows as any}
                    rowKey={(record: any, index?: number) => record.ten || record.thoiGian || record.loaiQuy || record.doiTuong || index}
                    size="small"
                    pagination={false}
                    locale={{ emptyText: <Empty description="Chưa có dữ liệu cho mẫu báo cáo này" /> }}
                  />

                  <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
                    <Button onClick={() => handleExport('csv')} loading={exporting && exportingFormat === 'csv'}>Xuất CSV</Button>
                    <Button onClick={() => handleExport('excel')} loading={exporting && exportingFormat === 'excel'}>Xuất Excel</Button>
                    <Button onClick={() => handleExport('pdf')} loading={exporting && exportingFormat === 'pdf'}>Xuất PDF</Button>
                    <Button onClick={() => handleExport('word')} loading={exporting && exportingFormat === 'word'}>Xuất Word</Button>
                  </div>
                </div>
              </div>

                  <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }} hidden={true}>
                    <div className="card-body p-5">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                        <div>
                          <div className="fw-bold text-gray-800 fs-4 mb-1">
                            <i className="fa-regular fa-layer-group text-primary me-2" />Báo cáo cũ - số liệu đầy đủ
                          </div>
                          <div className="text-muted fs-7">
                            Khôi phục các nhóm số liệu tổng hợp theo mẫu cũ: lĩnh vực, trạng thái, vai trò, hiệu quả, chiến dịch, quỹ, thưởng, ví và sử dụng hệ thống.
                          </div>
                        </div>
                      </div>

                      <Tabs
                        items={[
                          {
                            key: 'tong-quan',
                            label: 'Tổng quan',
                            children: (
                              <>
                                {dash && (
                                  <>
                                    <div className="row g-4 mb-4">
                                      <div className="col-6 col-xl-2"><KpiCard title="Tổng ý tưởng" value={fmtNum(dash.tongYTuong)} icon="fa-lightbulb" color="primary" /></div>
                                      <div className="col-6 col-xl-2"><KpiCard title="Đã nộp/Chờ xét duyệt" value={fmtNum(dash.soDaNop)} icon="fa-clock" color="warning" /></div>
                                      <div className="col-6 col-xl-2"><KpiCard title="Đã tiếp nhận" value={fmtNum(dash.soDaTiepNhan)} icon="fa-circle-check" color="info" /></div>
                                      <div className="col-6 col-xl-2"><KpiCard title="Được công nhận" value={fmtNum(dash.soDuocCongNhan)} icon="fa-medal" color="success" /></div>
                                      <div className="col-6 col-xl-2"><KpiCard title="Người tham gia" value={fmtNum(dash.soNguoiThamGia)} icon="fa-users" color="primary" /></div>
                                      <div className="col-6 col-xl-2"><KpiCard title="Đơn vị tham gia" value={fmtNum(dash.soDonViThamGia)} icon="fa-building" color="info" /></div>
                                    </div>

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

                                    <div className="row g-4 mb-4">
                                      <div className="col-6 col-xl-3">
                                        <KpiCard title={`Quá hạn tiếp nhận (>${dash.thoiHanTiepNhanNgay} ngày)`} icon="fa-hourglass-end" color="danger"
                                          value={fmtNum(dash.soQuaHanTiepNhan)}
                                          sub={dash.soQuaHanTiepNhan > 0 ? 'Chưa tiếp nhận' : 'Không có hồ sơ quá hạn'} />
                                      </div>
                                      <div className="col-6 col-xl-3">
                                        <KpiCard title={`Quá hạn kiểm duyệt (>${dash.thoiHanKiemDuyetCongNhanNgay} ngày)`} icon="fa-hourglass-end" color="danger"
                                          value={fmtNum(dash.soQuaHanKiemDuyet)}
                                          sub={dash.soQuaHanKiemDuyet > 0 ? 'Chưa có kết quả' : 'Không có hồ sơ quá hạn'} />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            ),
                          },
                          {
                            key: 'linh-vuc',
                            label: 'Theo lĩnh vực',
                            children: (
                              <Table
                                size="small"
                                pagination={false}
                                dataSource={REPORT_DATA}
                                rowKey="stt"
                                columns={[
                                  { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60, align: 'center' as const },
                                  { title: 'Lĩnh vực', dataIndex: 'linhVuc', key: 'linhVuc', render: (v: string) => <span className="fw-semibold">{v}</span> },
                                  { title: 'Tổng số', dataIndex: 'tongSo', key: 'tongSo', width: 90, align: 'center' as const },
                                  { title: 'Chờ duyệt', dataIndex: 'choDuyet', key: 'choDuyet', width: 100, align: 'center' as const, render: (v: number) => <Tag color="processing">{v}</Tag> },
                                  { title: 'Đã duyệt', dataIndex: 'daDuyet', key: 'daDuyet', width: 90, align: 'center' as const, render: (v: number) => <Tag color="success">{v}</Tag> },
                                  { title: 'Từ chối', dataIndex: 'tuChoi', key: 'tuChoi', width: 90, align: 'center' as const, render: (v: number) => <Tag color="error">{v}</Tag> },
                                  { title: 'Công nhận', dataIndex: 'congNhan', key: 'congNhan', width: 100, align: 'center' as const, render: (v: number) => <Tag color="purple">{v}</Tag> },
                                ]}
                              />
                            ),
                          },
                          {
                            key: 'trang-thai',
                            label: 'Theo trạng thái',
                            children: (
                              <Table
                                size="small"
                                pagination={false}
                                dataSource={REPORT_DATA.map(r => ({
                                  key: r.linhVuc,
                                  linhVuc: r.linhVuc,
                                  banNhap: Math.max(0, r.tongSo - r.choDuyet - r.daDuyet - r.tuChoi - r.congNhan),
                                  choDuyet: r.choDuyet,
                                  daDuyet: r.daDuyet,
                                  tuChoi: r.tuChoi,
                                  congNhan: r.congNhan,
                                }))}
                                rowKey="key"
                                columns={[
                                  { title: 'Lĩnh vực', dataIndex: 'linhVuc', key: 'linhVuc' },
                                  { title: 'Bản nháp', dataIndex: 'banNhap', key: 'banNhap', width: 90, align: 'center' as const },
                                  { title: 'Chờ duyệt', dataIndex: 'choDuyet', key: 'choDuyet', width: 90, align: 'center' as const },
                                  { title: 'Đã duyệt', dataIndex: 'daDuyet', key: 'daDuyet', width: 90, align: 'center' as const },
                                  { title: 'Từ chối', dataIndex: 'tuChoi', key: 'tuChoi', width: 90, align: 'center' as const },
                                  { title: 'Công nhận', dataIndex: 'congNhan', key: 'congNhan', width: 100, align: 'center' as const },
                                ]}
                              />
                            ),
                          },
                          {
                            key: 'vai-tro',
                            label: 'Theo vai trò',
                            children: (
                              <div className="row g-3">
                                {ROLE_VIEWS.map((role, idx) => (
                                  <div key={idx} className="col-sm-6 col-xl-3">
                                    <div className={`card bg-light-${role.color} h-100`}>
                                      <div className="card-body text-center py-4">
                                        <i className={`fa-regular ${role.icon} fs-2 text-${role.color} mb-2 d-block`} />
                                        <h5 className="fw-bold">{role.role}</h5>
                                        {role.kpis.map((kpi, i) => (
                                          <div key={i} className="text-muted fs-8">{kpi}</div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ),
                          },
                          {
                            key: 'hieu-qua',
                            label: 'Hiệu quả ĐMST',
                            children: (
                              <Table
                                size="small"
                                pagination={false}
                                dataSource={HIEU_QUA_DATA}
                                rowKey="ten"
                                columns={[
                                  { title: 'Sáng kiến / Ý tưởng', dataIndex: 'ten' },
                                  { title: 'Tiết kiệm chi phí', dataIndex: 'tietKiem', width: 150, render: fmtNum },
                                  { title: 'Tăng doanh thu', dataIndex: 'doanhThu', width: 150, render: fmtNum },
                                  { title: 'Nhân rộng', dataIndex: 'nhanRong', width: 100 },
                                  { title: 'Chất lượng', dataIndex: 'chatLuong', width: 120, render: (v: string) => <Tag color={v === 'Cao' ? 'green' : 'gold'}>{v}</Tag> },
                                ]}
                              />
                            ),
                          },
                          {
                            key: 'chien-dich',
                            label: 'Chiến dịch',
                            children: (
                              <Table
                                size="small"
                                pagination={false}
                                dataSource={CAMPAIGNS}
                                rowKey="ten"
                                columns={[
                                  { title: 'Chiến dịch', dataIndex: 'ten' },
                                  { title: 'Trạng thái', dataIndex: 'trangThai', width: 130, render: (v: string) => <Tag color={v === 'Đang diễn ra' ? 'processing' : 'default'}>{v}</Tag> },
                                  { title: 'Người tham gia', dataIndex: 'ngUoiThamGia', width: 120 },
                                  { title: 'Số nộp', dataIndex: 'soNop', width: 90 },
                                  { title: 'Hoàn thành', dataIndex: 'tyLeHoanThanh', width: 110, render: (v: number) => `${v}%` },
                                  { title: 'Tổng thưởng', dataIndex: 'tongThuong', width: 140, render: fmtNum },
                                  { title: 'Huy hiệu', dataIndex: 'huyHieu', width: 100 },
                                ]}
                              />
                            ),
                          },
                          {
                            key: 'chuong-trinh',
                            label: 'CĐS / R&D / Sandbox',
                            children: (
                              <Table
                                size="small"
                                pagination={false}
                                dataSource={CDS_PROGRAMS}
                                rowKey="ten"
                                columns={[
                                  { title: 'Chương trình / Dự án', dataIndex: 'ten' },
                                  { title: 'Trạng thái', dataIndex: 'trangThai', width: 120, render: (v: string) => <Tag color={v === 'Đúng hạn' ? 'green' : v === 'Rủi ro' ? 'gold' : 'red'}>{v}</Tag> },
                                  { title: 'Tiến độ', dataIndex: 'tienDo', width: 120, render: (v: number) => `${v}%` },
                                  { title: 'Ngân sách', dataIndex: 'nganSach', width: 120, render: (v: number) => `${v}%` },
                                  { title: 'Milestone', key: 'moc', width: 110, render: (_: unknown, r: typeof CDS_PROGRAMS[number]) => `${r.mocHoanThanh}/${r.mocTong}` },
                                ]}
                              />
                            ),
                          },
                          {
                            key: 'quy',
                            label: 'Quỹ / Chi thưởng',
                            children: (
                              <Tabs
                                items={[
                                  {
                                    key: 'quy-khcn',
                                    label: 'Quỹ phát triển KHCN',
                                    children: (
                                      <Table
                                        size="small"
                                        pagination={false}
                                        dataSource={QUY_KHCN}
                                        rowKey="loaiQuy"
                                        columns={[
                                          { title: 'Loại quỹ', dataIndex: 'loaiQuy' },
                                          { title: 'Ngân sách đầu', dataIndex: 'nganSachDau', width: 160, render: fmtNum },
                                          { title: 'Đã chi', dataIndex: 'daChi', width: 160, render: fmtNum },
                                          { title: 'Còn lại', key: 'conLai', width: 160, render: (_: unknown, r: typeof QUY_KHCN[number]) => fmtNum(r.nganSachDau - r.daChi) },
                                        ]}
                                      />
                                    ),
                                  },
                                  {
                                    key: 'chi-thuong',
                                    label: 'Chi thưởng',
                                    children: (
                                      <Table
                                        size="small"
                                        pagination={false}
                                        dataSource={CHI_THUONG}
                                        rowKey="doiTuong"
                                        columns={[
                                          { title: 'Đối tượng', dataIndex: 'doiTuong' },
                                          { title: 'Đơn vị', dataIndex: 'donVi', width: 180 },
                                          { title: 'Tiền thưởng', dataIndex: 'tienThuong', width: 150, render: fmtNum },
                                          { title: 'Điểm thưởng', dataIndex: 'diemThuong', width: 120 },
                                          { title: 'Kỳ thưởng', dataIndex: 'kyThuong', width: 120 },
                                        ]}
                                      />
                                    ),
                                  },
                                ]}
                              />
                            ),
                          },
                          {
                            key: 'vi-giao-dich',
                            label: 'Ví & Giao dịch',
                            children: (
                              <>
                                <Row gutter={[16, 16]} className="mb-3">
                                  <Col xs={12} md={6}><Statistic title="Số dư ví Cánh sen" value={2150} /></Col>
                                  <Col xs={12} md={6}><Statistic title="Số dư ví Bông sen" value={3400} /></Col>
                                </Row>
                                <Table
                                  size="small"
                                  pagination={false}
                                  dataSource={VI_GIAO_DICH}
                                  rowKey="thoiGian"
                                  columns={[
                                    { title: 'Thời gian', dataIndex: 'thoiGian', width: 160 },
                                    { title: 'Loại giao dịch', dataIndex: 'loai' },
                                    { title: 'Ví', dataIndex: 'vi', width: 110 },
                                    { title: 'Số tiền', dataIndex: 'soTien', width: 100, render: (v: string) => <span style={{ color: v.startsWith('+') ? '#16a34a' : '#dc2626' }}>{v}</span> },
                                    { title: 'Số dư sau GD', dataIndex: 'soDu', width: 120 },
                                  ]}
                                />
                              </>
                            ),
                          },
                          {
                            key: 'qua-tang',
                            label: 'Quy đổi quà tặng',
                            children: (
                              <Table
                                size="small"
                                pagination={false}
                                dataSource={QUA_TANG}
                                rowKey="ten"
                                columns={[
                                  { title: 'Quà tặng', dataIndex: 'ten' },
                                  { title: 'Đã quy đổi', dataIndex: 'daQuyDoi', width: 120 },
                                  { title: 'Tồn kho', dataIndex: 'tonKho', width: 100 },
                                  { title: 'Chi phí (điểm)', dataIndex: 'chiPhi', width: 140 },
                                ]}
                              />
                            ),
                          },
                          {
                            key: 'nguoi-dung',
                            label: 'Người dùng & sử dụng',
                            children: (
                              <Table
                                size="small"
                                pagination={false}
                                dataSource={USAGE_BY_DEPT}
                                rowKey="donVi"
                                columns={[
                                  { title: 'Đơn vị', dataIndex: 'donVi' },
                                  { title: 'Hoạt động', dataIndex: 'hoatDong', width: 120 },
                                  { title: 'Tần suất đăng nhập/tuần', dataIndex: 'tanSuatDangNhap', width: 180 },
                                  { title: 'Tỷ lệ sử dụng', dataIndex: 'tyLeSuDung', width: 140, render: (v: number) => `${v}%` },
                                ]}
                              />
                            ),
                          },
                        ]}
                      />
                    </div>
                  </div>

              {(!dash && !loading) && <Empty description="Chưa có dữ liệu" className="py-10" />}
        </Spin>
      </Content>
    </>
  );
};
