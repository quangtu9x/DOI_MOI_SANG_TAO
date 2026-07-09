import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Select, DatePicker, message, Table, Tag, Spin, Empty, Tabs, Tooltip, Row, Col, Statistic, Segmented, AutoComplete } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import {
  getIdeaDashboard, getIdeaContributions, getIdeaTuongTacReport, getIdeaSlaReport,
  exportIdeaReport, exportIdeaReportExcel, exportIdeaReportPdf, exportIdeaReportWord,
  IKhoangThoiGian,
} from '@/app/services/ideaPortalApi';
import type { IIdeaDashboard, IIdeaContributionReport, IIdeaContribution, INhomSoLuong, IIdeaTuongTacReport, ITuongTacTheoNguoi, ITuongTacTheoDonVi, IIdeaSlaReport, ISlaTheoDonVi, ISlaCanhBao } from '@/models/idea-portal';
import { requestPOST } from '@/utils/baseAPI';
import type { IPaginationResponse } from '@/models';

const { Option } = Select;
const { RangePicker } = DatePicker;
type DateRange = [Dayjs, Dayjs] | null;
const toRangeParam = (r: DateRange): IKhoangThoiGian | undefined =>
  r ? { tuNgay: r[0].format('YYYY-MM-DD'), denNgay: r[1].format('YYYY-MM-DD') } : undefined;
// Báo cáo tương tác hệ thống & SLA chỉ nhận khoảng ngày (không nhận tham số "năm") — quy đổi năm sang khoảng ngày Jan 1 - Dec 31
const yearToRange = (y: number): DateRange =>
  y ? [dayjs(`${y}-01-01`), dayjs(`${y}-12-31`)] : null;

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
const LINH_VUC_OPTIONS = [
  'Khai thác bay',
  'Kỹ thuật bảo dưỡng',
  'Dịch vụ hành khách',
  'Dịch vụ mặt đất',
  'Đào tạo nhân lực',
  'Chuyển đổi số',
  'Cải cách hành chính',
  'An toàn hàng không',
  'Thương mại & Doanh thu',
  'Công nghệ thông tin',
].map(v => ({ value: v, label: v }));
// ── Mock: Dashboard theo vai trò (IV.2) ──────────────────────────────────────
const ROLE_VIEWS = [
  {
    role: 'CBNV', icon: 'fa-user', color: 'primary',
    kpis: ['Ý tưởng của tôi: 4', 'Điểm thưởng cá nhân: 850đ quy đổi', 'Huy hiệu đạt được: 2']
  },
  {
    role: 'Lãnh đạo đơn vị', icon: 'fa-user-tie', color: 'info',
    kpis: ['Ý tưởng đơn vị: 37', 'Tỷ lệ duyệt đơn vị: 62%', 'Xếp hạng đơn vị: #4/28']
  },
  {
    role: 'Lãnh đạo TCT', icon: 'fa-building-columns', color: 'success',
    kpis: ['Tổng ý tưởng toàn TCT: 512', 'Ngân sách quỹ đã dùng: 41%', 'Chiến dịch đang chạy: 3']
  },
  {
    role: 'Quản trị hệ thống', icon: 'fa-user-gear', color: 'danger',
    kpis: ['Người dùng hoạt động: 1.204', 'Tồn đọng quá hạn: 18 hồ sơ', 'Nhật ký đăng nhập: 8.2k/tháng']
  },
];

// ── Mock: Hiệu quả ĐMST (IV.5) ───────────────────────────────────────────────
const HIEU_QUA_DATA = [
  { ten: 'AI dự đoán nhu cầu nhiên liệu tối ưu theo tuyến bay', tietKiem: 6800000000, doanhThu: 0, nhanRong: 4, chatLuong: 'Cao', linhVuc: 'Khai thác bay', donVi: 'Ban Kế hoạch phát triển', ngayGhiNhan: '2026-01-20' },
  { ten: 'Số hóa check-in nội địa', tietKiem: 1200000000, doanhThu: 350000000, nhanRong: 8, chatLuong: 'Cao', linhVuc: 'Dịch vụ hành khách', donVi: 'Ban Dịch vụ Hành khách', ngayGhiNhan: '2026-02-10' },
  { ten: 'Blended learning đào tạo phi công & tiếp viên', tietKiem: 900000000, doanhThu: 0, nhanRong: 2, chatLuong: 'Trung bình', linhVuc: 'Đào tạo nhân lực', donVi: 'Ban Tổ chức và Nhân lực', ngayGhiNhan: '2026-03-05' },
  { ten: 'Hệ thống phản hồi hành khách qua QR', tietKiem: 250000000, doanhThu: 180000000, nhanRong: 12, chatLuong: 'Cao', linhVuc: 'Công nghệ thông tin', donVi: 'Ban Chuyển đổi số công nghệ', ngayGhiNhan: '2026-03-22' },
  { ten: 'Tối ưu lịch bảo dưỡng định kỳ động cơ', tietKiem: 3200000000, doanhThu: 0, nhanRong: 5, chatLuong: 'Cao', linhVuc: 'Kỹ thuật bảo dưỡng', donVi: 'Ban Kỹ thuật', ngayGhiNhan: '2026-04-08' },
  { ten: 'Tự động hóa đối soát công nợ đại lý', tietKiem: 680000000, doanhThu: 220000000, nhanRong: 3, chatLuong: 'Trung bình', linhVuc: 'Công nghệ thông tin', donVi: 'Ban Tài chính Kế toán', ngayGhiNhan: '2026-04-25' },
  { ten: 'Chuẩn hóa quy trình xử lý hành lý thất lạc', tietKiem: 150000000, doanhThu: 0, nhanRong: 6, chatLuong: 'Trung bình', linhVuc: 'Dịch vụ mặt đất', donVi: 'Ban Dịch vụ Hành khách', ngayGhiNhan: '2026-05-12' },
  { ten: 'Ứng dụng bán vé phụ trợ trên di động', tietKiem: 0, doanhThu: 1450000000, nhanRong: 1, chatLuong: 'Cao', linhVuc: 'Thương mại & Doanh thu', donVi: 'Ban Tiếp thị và Bán sản phẩm', ngayGhiNhan: '2026-05-30' },
  { ten: 'Sổ tay an toàn khai thác điện tử', tietKiem: 90000000, doanhThu: 0, nhanRong: 15, chatLuong: 'Thấp', linhVuc: 'An toàn hàng không', donVi: 'Ban An toàn Chất lượng', ngayGhiNhan: '2026-06-14' },
  { ten: 'Cổng dịch vụ công nội bộ một cửa', tietKiem: 320000000, doanhThu: 0, nhanRong: 7, chatLuong: 'Trung bình', linhVuc: 'Cải cách hành chính', donVi: 'Ban Pháp chế', ngayGhiNhan: '2026-06-28' },
];

// ── Mock: Ngân sách & ROI (so sánh chi phí quỹ khen thưởng với giá trị mang lại) ──
const NGAN_SACH_ROI = [
  { ten: 'AI dự đoán nhu cầu nhiên liệu', chiPhi: 45000000, tietKiem: 6800000000, doanhThu: 0, nhanRong: 4, chatLuong: 'Cao', donVi: 'Ban Kế hoạch phát triển', linhVuc: 'Khai thác bay', ngayGhiNhan: '2026-01-20' },
  { ten: 'Số hóa check-in nội địa', chiPhi: 30000000, tietKiem: 1200000000, doanhThu: 350000000, nhanRong: 8, chatLuong: 'Cao', donVi: 'Ban Dịch vụ Hành khách', linhVuc: 'Dịch vụ hành khách', ngayGhiNhan: '2026-02-10' },
  { ten: 'Blended learning đào tạo phi công', chiPhi: 25000000, tietKiem: 900000000, doanhThu: 0, nhanRong: 2, chatLuong: 'Trung bình', donVi: 'Ban Tổ chức và Nhân lực', linhVuc: 'Đào tạo nhân lực', ngayGhiNhan: '2026-03-05' },
  { ten: 'Hệ thống phản hồi hành khách QR', chiPhi: 20000000, tietKiem: 250000000, doanhThu: 180000000, nhanRong: 12, chatLuong: 'Cao', donVi: 'Ban Chuyển đổi số công nghệ', linhVuc: 'Công nghệ thông tin', ngayGhiNhan: '2026-03-22' },
  { ten: 'Cải tiến An toàn bay 2025', chiPhi: 60000000, tietKiem: 500000000, doanhThu: 0, nhanRong: 6, chatLuong: 'Cao', donVi: 'Ban An toàn Chất lượng', linhVuc: 'An toàn hàng không', ngayGhiNhan: '2025-11-15' },
  { ten: 'Chuyển đổi số Mặt đất', chiPhi: 35000000, tietKiem: 800000000, doanhThu: 120000000, nhanRong: 10, chatLuong: 'Cao', donVi: 'Ban Dịch vụ Hành khách', linhVuc: 'Dịch vụ mặt đất', ngayGhiNhan: '2026-04-18' },
];

// ── Mock: Chiến dịch ĐMST (IV.10) ────────────────────────────────────────────
const CAMPAIGNS = [
  { ten: 'Sáng kiến Xanh 2026', trangThai: 'Đang diễn ra', ngUoiThamGia: 218, soNop: 64, tyLeHoanThanh: 58, tongThuong: 45000000, huyHieu: 12, donVi: 'Ban Chuyển đổi số công nghệ', linhVuc: 'Chuyển đổi số', ngayGhiNhan: '2026-03-01' },
  { ten: 'Ngày hội Đổi mới sáng tạo Quý II', trangThai: 'Đã kết thúc', ngUoiThamGia: 340, soNop: 91, tyLeHoanThanh: 100, tongThuong: 72000000, huyHieu: 28, donVi: 'Ban Kế hoạch phát triển', linhVuc: 'Cải cách hành chính', ngayGhiNhan: '2026-04-15' },
  { ten: 'Chuyển đổi số Dịch vụ Mặt đất', trangThai: 'Đang diễn ra', ngUoiThamGia: 156, soNop: 39, tyLeHoanThanh: 41, tongThuong: 30000000, huyHieu: 6, donVi: 'Ban Dịch vụ Hành khách', linhVuc: 'Dịch vụ mặt đất', ngayGhiNhan: '2026-05-20' },
  { ten: 'Cải tiến An toàn bay 2025', trangThai: 'Đã kết thúc', ngUoiThamGia: 275, soNop: 80, tyLeHoanThanh: 100, tongThuong: 60000000, huyHieu: 20, donVi: 'Ban An toàn Chất lượng', linhVuc: 'An toàn hàng không', ngayGhiNhan: '2026-01-10' },
];

// ── Mock: Chương trình CĐS/R&D/Sandbox (IV.11, IV.12) ────────────────────────
// Xuất (export) để DashboardDoiMoiPage.tsx tái sử dụng cho ô "Chương trình/dự án CĐS".
export const CDS_PROGRAMS = [
  { ten: 'Nền tảng dữ liệu hành khách 360°', trangThai: 'Đúng hạn', tienDo: 72, nganSach: 65, mocTong: 8, mocHoanThanh: 6, donVi: 'Ban Chuyển đổi số công nghệ', linhVuc: 'Chuyển đổi số', ngayGhiNhan: '2026-01-15', tietKiem: 2400000000, chatLuong: 'Cao', hieuQuaMoTa: 'Rút ngắn 40% thời gian tổng hợp dữ liệu khách hàng, hỗ trợ cá nhân hóa dịch vụ' },
  { ten: 'Sandbox AI dự báo bảo trì động cơ', trangThai: 'Rủi ro', tienDo: 45, nganSach: 80, mocTong: 6, mocHoanThanh: 3, donVi: 'Ban Kỹ thuật', linhVuc: 'Kỹ thuật bảo dưỡng', ngayGhiNhan: '2026-02-01', tietKiem: 800000000, chatLuong: 'Trung bình', hieuQuaMoTa: 'Đang thử nghiệm mô hình dự báo, chưa đủ dữ liệu để đánh giá đầy đủ hiệu quả' },
  { ten: 'Ứng dụng di động cho phi hành đoàn', trangThai: 'Trễ tiến độ', tienDo: 30, nganSach: 55, mocTong: 5, mocHoanThanh: 2, donVi: 'Ban Chuyển đổi số công nghệ', linhVuc: 'Chuyển đổi số', ngayGhiNhan: '2026-03-10', tietKiem: 150000000, chatLuong: 'Thấp', hieuQuaMoTa: 'Chậm tiến độ ảnh hưởng đến hiệu quả sử dụng, cần rà soát lại phạm vi triển khai' },
  { ten: 'Tự động hóa quy trình kế toán (RPA)', trangThai: 'Đúng hạn', tienDo: 90, nganSach: 88, mocTong: 4, mocHoanThanh: 4, donVi: 'Ban Tài chính Kế toán', linhVuc: 'Chuyển đổi số', ngayGhiNhan: '2025-11-01', tietKiem: 1800000000, chatLuong: 'Cao', hieuQuaMoTa: 'Giảm 65% thời gian đối soát công nợ, hạn chế sai sót thủ công' },
  { ten: 'R&D vật liệu tiết kiệm nhiên liệu', trangThai: 'Đúng hạn', tienDo: 55, nganSach: 40, mocTong: 7, mocHoanThanh: 4, donVi: 'Ban Kỹ thuật', linhVuc: 'Kỹ thuật bảo dưỡng', ngayGhiNhan: '2026-01-01', tietKiem: 3500000000, chatLuong: 'Cao', hieuQuaMoTa: 'Giảm tiêu hao nhiên liệu ước tính 1.2% trên các chuyến bay thử nghiệm' },
];
export const CDS_STATUS_COLOR: Record<string, string> = { 'Đúng hạn': '#22c55e', 'Trễ tiến độ': '#ef4444', 'Rủi ro': '#f59e0b' };

// ── Mock: Quỹ phát triển KHCN (IV.13) ─────────────────────────────────────────
export const QUY_KHCN = [
  { loaiQuy: 'Quỹ phát triển KHCN Tổng công ty', nganSachDau: 20000000000, daChi: 8200000000, donVi: 'Tổng công ty', ngayGhiNhan: '2026-01-01' },
  { loaiQuy: 'Quỹ ĐMST cấp đơn vị', nganSachDau: 6000000000, daChi: 3450000000, donVi: 'Ban Chuyển đổi số công nghệ', ngayGhiNhan: '2026-02-01' },
  { loaiQuy: 'Quỹ khen thưởng sáng kiến', nganSachDau: 2500000000, daChi: 1780000000, donVi: 'Ban Tổ chức và Nhân lực', ngayGhiNhan: '2026-03-01' },
];

// ── Mock: Chi thưởng (IV.14) — chi tiết theo cá nhân/đơn vị/chiến dịch/sáng kiến/thời gian ──
export const CHI_THUONG = [
  { doiTuong: 'Trần Minh Hoàng', loaiDoiTuong: 'Cá nhân', donVi: 'Ban Kỹ thuật Bay', chienDich: 'Sáng kiến Xanh 2026', sangKien: 'Tối ưu lịch bảo dưỡng định kỳ động cơ', tienThuong: 25000000, diemThuong: 500, kyThuong: 'Q1/2026', ngayGhiNhan: '2026-03-15' },
  { doiTuong: 'Nguyễn Văn An', loaiDoiTuong: 'Cá nhân', donVi: 'Ban Dịch vụ Mặt đất', chienDich: 'Chuyển đổi số Dịch vụ Mặt đất', sangKien: 'Chuẩn hóa quy trình xử lý hành lý thất lạc', tienThuong: 12000000, diemThuong: 300, kyThuong: 'Q1/2026', ngayGhiNhan: '2026-03-20' },
  { doiTuong: 'Ban Khai thác Bay', loaiDoiTuong: 'Đơn vị', donVi: 'Ban Khai thác Bay', chienDich: null, sangKien: 'AI dự đoán nhu cầu nhiên liệu tối ưu theo tuyến bay', tienThuong: 40000000, diemThuong: 0, kyThuong: 'Năm 2025', ngayGhiNhan: '2025-12-20' },
  { doiTuong: 'Lê Thị Hồng', loaiDoiTuong: 'Cá nhân', donVi: 'Ban Dịch vụ Hành khách', chienDich: 'Ngày hội Đổi mới sáng tạo Quý II', sangKien: 'Số hóa check-in nội địa', tienThuong: 18000000, diemThuong: 400, kyThuong: 'Q2/2026', ngayGhiNhan: '2026-04-18' },
  { doiTuong: 'Phạm Quốc Bảo', loaiDoiTuong: 'Cá nhân', donVi: 'Ban Chuyển đổi số công nghệ', chienDich: 'Sáng kiến Xanh 2026', sangKien: 'Hệ thống phản hồi hành khách qua QR', tienThuong: 15000000, diemThuong: 350, kyThuong: 'Q1/2026', ngayGhiNhan: '2026-03-25' },
  { doiTuong: 'Ban An toàn Chất lượng', loaiDoiTuong: 'Đơn vị', donVi: 'Ban An toàn Chất lượng', chienDich: 'Cải tiến An toàn bay 2025', sangKien: 'Sổ tay an toàn khai thác điện tử', tienThuong: 22000000, diemThuong: 0, kyThuong: 'Năm 2025', ngayGhiNhan: '2025-11-20' },
  { doiTuong: 'Đỗ Thị Lan', loaiDoiTuong: 'Cá nhân', donVi: 'Ban Tài chính Kế toán', chienDich: null, sangKien: 'Tự động hóa đối soát công nợ đại lý', tienThuong: 10000000, diemThuong: 250, kyThuong: 'Q2/2026', ngayGhiNhan: '2026-04-28' },
  { doiTuong: 'Ban Dịch vụ Hành khách', loaiDoiTuong: 'Đơn vị', donVi: 'Ban Dịch vụ Hành khách', chienDich: 'Chuyển đổi số Dịch vụ Mặt đất', sangKien: null, tienThuong: 30000000, diemThuong: 0, kyThuong: 'Q2/2026', ngayGhiNhan: '2026-05-20' },
  { doiTuong: 'Vũ Đình Khang', loaiDoiTuong: 'Cá nhân', donVi: 'Ban Kỹ thuật', chienDich: null, sangKien: 'R&D vật liệu tiết kiệm nhiên liệu', tienThuong: 20000000, diemThuong: 450, kyThuong: 'Q1/2026', ngayGhiNhan: '2026-02-10' },
  { doiTuong: 'Ban Tổ chức và Nhân lực', loaiDoiTuong: 'Đơn vị', donVi: 'Ban Tổ chức và Nhân lực', chienDich: null, sangKien: 'Blended learning đào tạo phi công & tiếp viên', tienThuong: 8000000, diemThuong: 0, kyThuong: 'Q1/2026', ngayGhiNhan: '2026-03-05' },
];
export const CHI_THUONG_GROUP_OPTIONS: { value: 'ca-nhan' | 'don-vi' | 'chien-dich' | 'sang-kien' | 'thoi-gian'; label: string }[] = [
  { value: 'ca-nhan', label: 'Cá nhân' },
  { value: 'don-vi', label: 'Đơn vị' },
  { value: 'chien-dich', label: 'Chiến dịch' },
  { value: 'sang-kien', label: 'Sáng kiến' },
  { value: 'thoi-gian', label: 'Thời gian' },
];

// ── Mock: Ví và giao dịch (IV.15) — số dư hiện tại theo loại ví (Cánh sen/Bông sen) ──
export const VI_GIAO_DICH = [
  { thoiGian: '05/07/2026 09:12', loai: 'Nhận thưởng sáng kiến', vi: 'Cánh sen', soTien: '+500', soDu: 2150, donVi: 'Ban Kỹ thuật', ngayGhiNhan: '2026-07-05' },
  { thoiGian: '02/07/2026 14:30', loai: 'Quy đổi quà tặng', vi: 'Bông sen', soTien: '-1200', soDu: 3400, donVi: 'Ban Dịch vụ Hành khách', ngayGhiNhan: '2026-07-02' },
  { thoiGian: '28/06/2026 08:05', loai: 'Nhận thưởng chiến dịch', vi: 'Cánh sen', soTien: '+300', soDu: 1650, donVi: 'Ban Chuyển đổi số công nghệ', ngayGhiNhan: '2026-06-28' },
];

// ── Mock: Quy đổi quà tặng (IV.16) ────────────────────────────────────────────
const QUA_TANG = [
  { ten: 'Voucher nghỉ dưỡng 2N1Đ', loaiQua: 'Trải nghiệm & Du lịch', daQuyDoi: 34, tonKho: 6, chiPhi: 200, donVi: 'Ban Tổ chức và Nhân lực', ngayGhiNhan: '2026-04-10' },
  { ten: 'Tai nghe không dây', loaiQua: 'Thiết bị công nghệ', daQuyDoi: 58, tonKho: 12, chiPhi: 80, donVi: 'Ban Chuyển đổi số công nghệ', ngayGhiNhan: '2026-05-05' },
  { ten: 'Vé máy bay khứ hồi nội địa', loaiQua: 'Di chuyển', daQuyDoi: 15, tonKho: 3, chiPhi: 600, donVi: 'Ban Dịch vụ Hành khách', ngayGhiNhan: '2026-06-01' },
  { ten: 'Đồng hồ thông minh', loaiQua: 'Thiết bị công nghệ', daQuyDoi: 22, tonKho: 5, chiPhi: 450, donVi: 'Ban Kỹ thuật', ngayGhiNhan: '2026-05-18' },
  { ten: 'Voucher ăn uống nhà hàng', loaiQua: 'Ẩm thực', daQuyDoi: 71, tonKho: 20, chiPhi: 60, donVi: 'Ban Truyền thông', ngayGhiNhan: '2026-06-10' },
  { ten: 'Balo du lịch cao cấp', loaiQua: 'Trải nghiệm & Du lịch', daQuyDoi: 41, tonKho: 9, chiPhi: 120, donVi: 'Ban Tổ chức và Nhân lực', ngayGhiNhan: '2026-06-20' },
];

// ── Danh sách phòng ban (đã ghi nhớ) ──────────────────────────────────────────
const DEPARTMENTS = [
  'Ban kiểm tra - Kiểm toán',
  'Ban Chuyển đổi số công nghệ',
  'Ban An ninh hàng không',
  'Ban Pháp chế',
  'Ban Tổ chức và Nhân lực',
  'Ban Đầu tư - Mua sắm',
  'Ban Tài chính Kế toán',
  'Ban An toàn Chất lượng',
  'Ban Truyền thông',
  'Ban Kế hoạch phát triển',
  'Ban Tiếp thị và Bán sản phẩm',
  'Ban Kế hoạch và Tiếp thị hàng hóa',
  'Trung tâm Điều hành khai thác',
  'Ban Dịch vụ Hành khách',
  'Ban Quản lý vật tư',
  'Ban Kỹ thuật',
];

// ── Mock: Người dùng & sử dụng hệ thống (IV.18) ──────────────────────────────
const USAGE_BY_DEPT = DEPARTMENTS.map((name, i) => ({
  donVi: name,
  maDonVi: `DV-${String(i + 1).padStart(2, '0')}`,
  nguoiDungHoatDong: Math.round(40 + Math.random() * 120),
  tanSuatDangNhap: +(2 + Math.random() * 5).toFixed(1),
  tyLeSuDungTinhNang: Math.round(40 + Math.random() * 55),
  mucDoTuongTac: (['Cao', 'Cao', 'Trung bình', 'Trung bình', 'Thấp'] as const)[Math.floor(Math.random() * 5)],
  soYTuongDaNop: Math.round(5 + Math.random() * 45),
  xepHang: i + 1,
}));

// Dữ liệu demo cố định cho báo cáo Người dùng & sử dụng hệ thống
const USAGE_DEMO_DATA = [
  { donVi: 'Ban Chuyển đổi số công nghệ', nguoiDungHoatDong: 156, tanSuatDangNhap: 4.5, tyLeSuDungTinhNang: 92, mucDoTuongTac: 'Cao', soYTuongDaNop: 38 },
  { donVi: 'Ban Khai thác Bay', nguoiDungHoatDong: 134, tanSuatDangNhap: 3.8, tyLeSuDungTinhNang: 85, mucDoTuongTac: 'Cao', soYTuongDaNop: 29 },
  { donVi: 'Ban Dịch vụ Hành khách', nguoiDungHoatDong: 98, tanSuatDangNhap: 3.2, tyLeSuDungTinhNang: 78, mucDoTuongTac: 'Trung bình', soYTuongDaNop: 22 },
  { donVi: 'Ban Tài chính Kế toán', nguoiDungHoatDong: 72, tanSuatDangNhap: 2.8, tyLeSuDungTinhNang: 68, mucDoTuongTac: 'Trung bình', soYTuongDaNop: 15 },
  { donVi: 'Ban Kỹ thuật', nguoiDungHoatDong: 118, tanSuatDangNhap: 3.5, tyLeSuDungTinhNang: 81, mucDoTuongTac: 'Cao', soYTuongDaNop: 26 },
  { donVi: 'Ban Tổ chức và Nhân lựu', nguoiDungHoatDong: 65, tanSuatDangNhap: 2.5, tyLeSuDungTinhNang: 62, mucDoTuongTac: 'Trung bình', soYTuongDaNop: 11 },
  { donVi: 'Ban An ninh hàng không', nguoiDungHoatDong: 45, tanSuatDangNhap: 2.1, tyLeSuDungTinhNang: 55, mucDoTuongTac: 'Thấp', soYTuongDaNop: 8 },
  { donVi: 'Trung tâm Điều hành khai thác', nguoiDungHoatDong: 142, tanSuatDangNhap: 4.2, tyLeSuDungTinhNang: 88, mucDoTuongTac: 'Cao', soYTuongDaNop: 35 },
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

// ── Mock Dashboard fallback (khi API không có dữ liệu) ─────────────────────────
const MOCK_DASH: IIdeaDashboard = {
  nam: 2026,
  tongYTuong: 512,
  soBanNhap: 89,
  soDaNop: 156,
  soDaTiepNhan: 98,
  soTraLai: 34,
  soDaHuy: 12,
  soDuocCongNhan: 123,
  soNguoiThamGia: 467,
  soDonViThamGia: 28,
  nopTheoThang: [12, 18, 25, 32, 41, 38, 45, 52, 48, 55, 60, 86],
  theoLinhVuc: [
    { ten: 'Khai thác bay', soLuong: 52, soDuocDuyet: 34, soDuocCongNhan: 5 },
    { ten: 'Kỹ thuật bảo dưỡng', soLuong: 45, soDuocDuyet: 28, soDuocCongNhan: 4 },
    { ten: 'Dịch vụ hành khách', soLuong: 38, soDuocDuyet: 24, soDuocCongNhan: 3 },
    { ten: 'Công nghệ thông tin', soLuong: 27, soDuocDuyet: 17, soDuocCongNhan: 3 },
    { ten: 'Đào tạo nhân lực', soLuong: 20, soDuocDuyet: 12, soDuocCongNhan: 3 },
  ],
  theoDonVi: [
    { ten: 'Ban CNTT', soLuong: 78, soDuocDuyet: 62, soDuocCongNhan: 28 },
    { ten: 'Ban Khai thác Bay', soLuong: 92, soDuocDuyet: 71, soDuocCongNhan: 32 },
    { ten: 'Ban Dịch vụ Mặt đất', soLuong: 145, soDuocDuyet: 98, soDuocCongNhan: 41 },
  ],
  gioXuLyTrungBinh: 36,
  tyLeDungHan: 78.5,
  slaGio: 72,
  soTonDong: 18,
  soChoXuLy: 42,
  thoiHanTiepNhanNgay: 5,
  thoiHanKiemDuyetCongNhanNgay: 15,
  soQuaHanTiepNhan: 8,
  soQuaHanKiemDuyet: 6,
};

// ── Mock Contribution Report fallback ──────────────────────────────────────────
const MOCK_LB: IIdeaContributionReport = {
  ky: 'Năm 2026',
  caNhan: [
    { ten: 'Nguyễn Văn An', donVi: 'Ban CNTT', soNop: 24, soDuocDuyet: 18, soDuocCongNhan: 12, xepHang: 1 },
    { ten: 'Trần Minh Hoàng', donVi: 'Ban Khai thác Bay', soNop: 20, soDuocDuyet: 16, soDuocCongNhan: 10, xepHang: 2 },
    { ten: 'Lê Thị Hương', donVi: 'Ban Dịch vụ Mặt đất', soNop: 18, soDuocDuyet: 14, soDuocCongNhan: 9, xepHang: 3 },
    { ten: 'Phạm Quốc Bảo', donVi: 'Trung tâm Điều hành khai thác', soNop: 15, soDuocDuyet: 12, soDuocCongNhan: 7, xepHang: 4 },
    { ten: 'Đặng Thị Mai', donVi: 'Ban Tổ chức và Nhân lực', soNop: 12, soDuocDuyet: 10, soDuocCongNhan: 5, xepHang: 5 },
  ],
  donVi: [
    { ten: 'Ban Chuyển đổi số công nghệ', donVi: null, soNop: 62, soDuocDuyet: 48, soDuocCongNhan: 24, xepHang: 1 },
    { ten: 'Ban Khai thác Bay', donVi: null, soNop: 52, soDuocDuyet: 41, soDuocCongNhan: 18, xepHang: 2 },
    { ten: 'Ban Dịch vụ Hành khách', donVi: null, soNop: 45, soDuocDuyet: 35, soDuocCongNhan: 15, xepHang: 3 },
  ],
};

type ReportObjectType = 'TatCa' | 'YTuong' | 'GiaiPhap' | 'SangKien';
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
  | 'roi'
  | 'y-tuong-giai-phap-sang-kien';

const REPORT_OBJECT_OPTIONS: { value: ReportObjectType; label: string }[] = [
  { value: 'TatCa', label: 'Tất cả' },
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
  { value: 'y-tuong-giai-phap-sang-kien', label: 'Báo cáo Ý tưởng/Giải pháp/Sáng kiến', group: 'Ý tưởng/Giải pháp/Sáng kiến', desc: 'Cho phép thống kê số lượng theo trạng thái (nháp, đã nộp, phê duyệt, triển khai, không thông qua), theo đơn vị, lĩnh vực, thời gian và mức độ hiệu quả' },
];

export const BaoCaoPage: React.FC = () => {
  // Mặc định "Tất cả" (không lọc theo năm) — tránh trường hợp năm hiện tại chưa có ý tưởng nào
  // mà hiển thị nhầm thành "chưa có dữ liệu" khi mở trang lần đầu.
  const [year, setYear] = useState<number>(ALL_TIME);
  const [range, setRange] = useState<DateRange>(null);
  const [loading, setLoading] = useState(false);
  const [dash, setDash] = useState<IIdeaDashboard | null>(null);

  // Leaderboard
  const [lbPeriod, setLbPeriod] = useState<'nam' | 'quy' | 'thang'>('nam');
  const [lbValue, setLbValue] = useState<number>(1);
  const [lbTop, setLbTop] = useState<number>(10); // lựa chọn nhanh Top 5/10/20
  const [lbLoading, setLbLoading] = useState(false);
  const [lb, setLb] = useState<IIdeaContributionReport | null>(null);

  // Báo cáo tương tác hệ thống (lượt xem/thích/bình luận + mức độ sử dụng)
  const [tuongTacLoading, setTuongTacLoading] = useState(false);
  const [tuongTac, setTuongTac] = useState<IIdeaTuongTacReport | null>(null);

  const [exporting, setExporting] = useState(false);

  // ── Bộ lọc bổ sung cho báo cáo ──────────────────────────────────────────────
  const [filterDonVi, setFilterDonVi] = useState<string>('');
  const [filterLinhVuc, setFilterLinhVuc] = useState<string>('');
  const [filterHieuQua, setFilterHieuQua] = useState<string>('');
  const [orgUnitOptions, setOrgUnitOptions] = useState<{ value: string; label: string }[]>([]);
  // Nhóm thống kê cho Báo cáo chi thưởng: cá nhân/đơn vị/chiến dịch/sáng kiến/thời gian
  const [chiThuongGroupBy, setChiThuongGroupBy] = useState<'ca-nhan' | 'don-vi' | 'chien-dich' | 'sang-kien' | 'thoi-gian'>('ca-nhan');

  // Tải danh sách đơn vị thật từ API
  useEffect(() => {
    requestPOST<IPaginationResponse<any[]>>('organizationunits/search', {
      pageNumber: 1,
      pageSize: 200,
      advancedSearch: { fields: ['name', 'code'], keyword: null },
    })
      .then(res => {
        const list = res?.data?.data ?? [];
        if (Array.isArray(list)) {
          setOrgUnitOptions(list.map((x: any) => ({ value: x.name ?? x.ten ?? '', label: x.name ?? x.ten ?? '' })));
        }
      })
      .catch(() => { });
  }, []);

  const loadDash = useCallback(async (y = year, r = range) => {
    setLoading(true);
    try {
      const res = await getIdeaDashboard(y === ALL_TIME ? undefined : y, 72, toRangeParam(r));
      const data = safeItem<IIdeaDashboard>(res);
      setDash(data ?? MOCK_DASH); // fallback mock khi API null
    } catch {
      setDash(MOCK_DASH); // fallback mock khi API lỗi
    }
    finally { setLoading(false); }
  }, [year, range]);

  const loadLb = useCallback(async (y = year, period = lbPeriod, value = lbValue, r = range, top = lbTop) => {
    setLbLoading(true);
    try {
      const res = await getIdeaContributions({
        nam: y === ALL_TIME ? undefined : y,
        quy: period === 'quy' ? value : undefined,
        thang: period === 'thang' ? value : undefined,
        top,
        ...toRangeParam(r),
      });
      const data = safeItem<IIdeaContributionReport>(res);
      const mock = { ...MOCK_LB, caNhan: MOCK_LB.caNhan.slice(0, top), donVi: MOCK_LB.donVi.slice(0, top) };
      setLb(data ?? mock); // fallback mock khi API null
    } catch {
      setLb({ ...MOCK_LB, caNhan: MOCK_LB.caNhan.slice(0, top), donVi: MOCK_LB.donVi.slice(0, top) }); // fallback mock khi API lỗi
    }
    finally { setLbLoading(false); }
  }, [year, lbPeriod, lbValue, range, lbTop]);

  const loadTuongTac = useCallback(async (r = range) => {
    setTuongTacLoading(true);
    try {
      const res = await getIdeaTuongTacReport({ top: 50, ...toRangeParam(r) });
      setTuongTac(safeItem<IIdeaTuongTacReport>(res) ?? null);
    } catch {
      setTuongTac(null);
    } finally { setTuongTacLoading(false); }
  }, [range]);

  // Báo cáo quy trình xử lý & SLA (thời gian từng bước, đúng hạn/quá hạn, điểm nghẽn, tồn đọng theo đơn vị)
  const [slaLoading, setSlaLoading] = useState(false);
  const [slaReport, setSlaReport] = useState<IIdeaSlaReport | null>(null);

  const loadSlaReport = useCallback(async (r = range) => {
    setSlaLoading(true);
    try {
      const res = await getIdeaSlaReport({ slaGio: 72, topCanhBao: 20, ...toRangeParam(r) });
      setSlaReport(safeItem<IIdeaSlaReport>(res) ?? null);
    } catch {
      setSlaReport(null);
    } finally { setSlaLoading(false); }
  }, [range]);

  // ── Điều khiển bảng xếp hạng: kỳ (năm/quý/tháng) + Top nhanh ──────────────
  const changeLbPeriod = (period: 'nam' | 'quy' | 'thang') => {
    // Quý/Tháng cần chọn 1 năm cụ thể và không dùng khoảng ngày tùy chỉnh (không lọc được khi đang ở "Tất cả"
    // hoặc đang chọn khoảng ngày) → tự động chuyển sang năm hiện tại, bỏ khoảng ngày, để xem được ngay
    // thay vì disable im lặng.
    const needYear = period !== 'nam' && (year === ALL_TIME || !!range);
    const y = needYear ? THIS_YEAR : year;
    const r = needYear ? null : range;
    setLbPeriod(period);
    setLbValue(1);
    if (needYear) { setYear(y); setRange(null); }
    loadLb(y, period, 1, r, lbTop);
  };
  const changeLbValue = (value: number) => {
    setLbValue(value);
    loadLb(year, lbPeriod, value, range, lbTop);
  };
  const changeLbTop = (top: number) => {
    setLbTop(top);
    loadLb(year, lbPeriod, lbValue, range, top);
  };

  useEffect(() => { loadDash(); loadLb(); loadTuongTac(); loadSlaReport(); }, []);

  const changeYear = (y: number) => {
    setYear(y);
    setRange(null);
    // "Tất cả" không hỗ trợ lọc theo quý/tháng cụ thể → về lại chế độ theo năm
    const period = y === ALL_TIME ? 'nam' : lbPeriod;
    if (period !== lbPeriod) { setLbPeriod(period); setLbValue(1); }
    loadDash(y, null);
    loadLb(y, period, period === lbPeriod ? lbValue : 1, null);
    // Báo cáo tương tác hệ thống & SLA không nhận tham số "năm" trực tiếp → quy đổi năm sang khoảng ngày
    const yRange = y === ALL_TIME ? null : yearToRange(y);
    loadTuongTac(yRange);
    loadSlaReport(yRange);
  };

  const changeRange = (dates: any) => {
    const r: DateRange = dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null;
    setRange(r);
    // Khoảng ngày tùy chỉnh được ưu tiên hơn Quý/Tháng ở backend — về lại chế độ theo năm
    // để tránh chọn Quý/Tháng mà không thấy có tác dụng (dễ gây hiểu nhầm là lỗi).
    const period = r ? 'nam' : lbPeriod;
    if (period !== lbPeriod) { setLbPeriod(period); setLbValue(1); }
    loadDash(year, r);
    loadLb(year, period, period === lbPeriod ? lbValue : 1, r);
    loadTuongTac(r);
    loadSlaReport(r);
  };

  const [exportingFormat, setExportingFormat] = useState<'csv' | 'excel' | 'pdf' | 'word' | null>(null);
  const [reportObject, setReportObject] = useState<ReportObjectType>('TatCa');

  // Gọi lại API tương ứng khi người dùng chọn mẫu báo cáo, để luôn có dữ liệu mới nhất
  // và không phụ thuộc hoàn toàn vào lần tải lúc mở trang.
  const changeReportTemplate = (value: ReportTemplateKey) => {
    setReportTemplate(value);
    switch (value) {
      case 'trang-thai':
      case 'hieu-qua':
        loadDash();
        break;
      case 'sla':
        loadSlaReport();
        break;
      case 'dong-gop':
      case 'leaderboard':
        loadLb();
        break;
      case 'tuong-tac':
        loadTuongTac();
        break;
      default:
        break;
    }
  };

  // Cho phép deep-link chọn sẵn mẫu báo cáo qua query string, vd: /doi-moi-sang-tao/bao-cao?template=chuong-trinh
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template') as ReportTemplateKey | null;
  const [reportTemplate, setReportTemplate] = useState<ReportTemplateKey>(
    (templateParam && REPORT_TEMPLATES.some(t => t.value === templateParam)) ? templateParam : 'trang-thai'
  );

  useEffect(() => {
    if (templateParam && REPORT_TEMPLATES.some(t => t.value === templateParam)) {
      setReportTemplate(templateParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateParam]);

  const templateOptions = useMemo(() => {
    // Tất cả mẫu báo cáo đều khả dụng cho mọi đối tượng
    return REPORT_TEMPLATES;
  }, []);

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
    // Lọc theo khoảng thời gian đã chọn ở bộ lọc chính (range) — dùng ngày ghi nhận (ngayGhiNhan)
    const filterByRange = (items: any[]) => {
      if (!range) return items;
      const from = range[0].startOf('day').valueOf();
      const to = range[1].endOf('day').valueOf();
      return items.filter(x => {
        if (!x.ngayGhiNhan) return true;
        const t = new Date(x.ngayGhiNhan).getTime();
        return t >= from && t <= to;
      });
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
        let data = filterByRange(HIEU_QUA_DATA).map(x => ({
          ten: x.ten,
          soLuong: x.tietKiem,
          tietKiem: x.tietKiem,
          doanhThu: x.doanhThu,
          nhanRong: x.nhanRong,
          chatLuong: x.chatLuong,
          ghiChu: `${fmtNum(x.nhanRong)} lần nhân rộng • Chất lượng: ${x.chatLuong} • Ghi nhận: ${new Date(x.ngayGhiNhan).toLocaleDateString('vi-VN')}`,
          linhVuc: x.linhVuc,
          donVi: x.donVi,
        }));
        data = filterByDonVi(data);
        data = filterByLinhVuc(data);
        data = filterByHieuQua(data);
        return data;
      }
      case 'sla': {
        // Dữ liệu thật: theo đơn vị, từ báo cáo quy trình xử lý & SLA
        let data = (slaReport?.theoDonVi ?? []).map(x => ({
          ten: x.donVi,
          soLuong: x.gioTrungBinh ?? 0,
          ghiChu: `Tỷ lệ đúng hạn: ${x.tyLeDungHan ?? '—'}% • ${x.tongHoSo} hồ sơ • ${x.soTonDongQuaHan} tồn đọng quá hạn`,
          linhVuc: '',
          donVi: x.donVi,
          chatLuong: '',
        }));
        data = filterByDonVi(data);
        return data;
      }
      case 'dong-gop':
      case 'leaderboard': {
        // Gộp cả 2 bảng "Cá nhân tiêu biểu" + "Đơn vị tiêu biểu" để xuất file đầy đủ (trước đây 'dong-gop' chỉ có cá nhân)
        let data = [
          ...(lb?.caNhan ?? []).map(x => ({ ...x, loai: 'Cá nhân', donVi: x.donVi || '' })),
          ...(lb?.donVi ?? []).map(x => ({ ...x, loai: 'Đơn vị', donVi: x.ten })),
        ].map(x => ({
          ...x,
          diem: x.diemThuong,
          linhVuc: '',
          chatLuong: '',
        }));
        data = filterByDonVi(data);
        return data;
      }
      case 'tuong-tac': {
        // Dữ liệu thật: lượt xem/thích/bình luận (Ý tưởng + Tài liệu) + mức độ sử dụng, theo cả người dùng và đơn vị
        const theoNguoi = (tuongTac?.theoNguoiDung ?? []).map(x => ({
          nhom: 'Người dùng',
          ten: x.tenNguoiDung,
          donVi: x.donVi || '',
          luotXem: x.luotXem,
          luotThich: x.luotThich,
          binhLuan: x.binhLuan,
          soLanDangNhap: x.soLanDangNhap,
          soNguoiSuDung: null as number | null,
          mucDoSuDung: x.mucDoSuDung,
        }));
        const theoDonVi = (tuongTac?.theoDonVi ?? []).map(x => ({
          nhom: 'Đơn vị',
          ten: x.donViCode,
          donVi: x.donViCode,
          luotXem: x.luotXem,
          luotThich: x.luotThich,
          binhLuan: x.binhLuan,
          soLanDangNhap: x.soLanDangNhap,
          soNguoiSuDung: x.soNguoiSuDung,
          mucDoSuDung: x.mucDoSuDung,
        }));
        let data = [...theoNguoi, ...theoDonVi];
        data = filterByDonVi(data);
        return data;
      }
      case 'chien-dich':
        return filterByRange(filterByLinhVuc(filterByDonVi(CAMPAIGNS)));
      case 'chuong-trinh':
        return filterByHieuQua(filterByRange(filterByLinhVuc(filterByDonVi(CDS_PROGRAMS))));
      case 'quy':
        return filterByRange(filterByDonVi(QUY_KHCN.map(x => ({ ...x, ten: x.loaiQuy }))));
      case 'chi-thuong': {
        // Thống kê chi tiết các khoản chi tiền thưởng/điểm thưởng, nhóm theo cá nhân/đơn vị/chiến dịch/sáng kiến/thời gian
        let base = filterByRange(filterByDonVi(CHI_THUONG));
        if (chiThuongGroupBy === 'ca-nhan') base = base.filter(x => x.loaiDoiTuong === 'Cá nhân');

        const keyOf = (x: typeof CHI_THUONG[number]): string => {
          switch (chiThuongGroupBy) {
            case 'ca-nhan': return x.doiTuong;
            case 'don-vi': return x.donVi;
            case 'chien-dich': return x.chienDich || 'Không thuộc chiến dịch';
            case 'sang-kien': return x.sangKien || 'Không gắn sáng kiến';
            case 'thoi-gian': return x.kyThuong;
            default: return x.doiTuong;
          }
        };

        const groups = new Map<string, { ten: string; soLuong: number; diemThuong: number; soLuot: number; donVi: Set<string>; ky: Set<string> }>();
        base.forEach(x => {
          const key = keyOf(x);
          if (!groups.has(key)) groups.set(key, { ten: key, soLuong: 0, diemThuong: 0, soLuot: 0, donVi: new Set(), ky: new Set() });
          const g = groups.get(key)!;
          g.soLuong += x.tienThuong;
          g.diemThuong += x.diemThuong;
          g.soLuot += 1;
          g.donVi.add(x.donVi);
          g.ky.add(x.kyThuong);
        });

        return Array.from(groups.values())
          .sort((a, b) => b.soLuong - a.soLuong)
          .map(g => ({
            ten: g.ten,
            soLuong: g.soLuong,
            diemThuong: g.diemThuong,
            soLuot: g.soLuot,
            donVi: Array.from(g.donVi).join(', '),
            ghiChu: `${g.soLuot} lượt chi • Kỳ: ${Array.from(g.ky).join(', ')}`,
          }));
      }
      case 'vi-giao-dich':
        return filterByRange(filterByDonVi(VI_GIAO_DICH.map(x => ({ ...x, ten: x.loai }))));
      case 'qua-tang': {
        let data = QUA_TANG.map(x => ({
          ten: x.ten,
          loaiQua: x.loaiQua,
          daQuyDoi: x.daQuyDoi,
          tonKho: x.tonKho,
          chiPhi: x.chiPhi,
          soLuong: x.daQuyDoi,
          ghiChu: `${x.loaiQua} • ${x.tonKho} quà còn lại • ${fmtNum(x.chiPhi)} đ/lượt`,
          donVi: x.donVi,
          ngayGhiNhan: x.ngayGhiNhan,
        }));
        data = filterByDonVi(data);
        data = filterByRange(data);

        // Xác định loại quà phổ biến nhất (tổng số lượt quy đổi cao nhất) trong tập đang hiển thị
        const tongTheoLoai = new Map<string, number>();
        data.forEach(x => tongTheoLoai.set(x.loaiQua, (tongTheoLoai.get(x.loaiQua) ?? 0) + x.daQuyDoi));
        let loaiPhoBienNhat = '';
        let maxSoLuong = -1;
        tongTheoLoai.forEach((soLuong, loai) => { if (soLuong > maxSoLuong) { maxSoLuong = soLuong; loaiPhoBienNhat = loai; } });

        return data.map(x => ({ ...x, laLoaiPhoBien: x.loaiQua === loaiPhoBienNhat }));
      }
      case 'roi': {
        let data = NGAN_SACH_ROI.map(x => {
          const giaTri = x.tietKiem + x.doanhThu;
          const roi = x.chiPhi > 0 ? ((giaTri - x.chiPhi) / x.chiPhi) * 100 : 0;
          return {
            ten: x.ten,
            chiPhi: x.chiPhi,
            tietKiem: x.tietKiem,
            doanhThu: x.doanhThu,
            giaTri,
            roi,
            nhanRong: x.nhanRong,
            chatLuong: x.chatLuong,
            donVi: x.donVi,
            linhVuc: x.linhVuc,
            ngayGhiNhan: x.ngayGhiNhan,
          };
        });
        data = filterByDonVi(data);
        data = filterByLinhVuc(data);
        data = filterByHieuQua(data);
        data = filterByRange(data);
        return data;
      }
      case 'usage': {
        let data = USAGE_DEMO_DATA.map(x => ({
          ten: x.donVi,
          soLuong: x.nguoiDungHoatDong,
          ghiChu: `${x.tanSuatDangNhap} lần/tuần • ${x.tyLeSuDungTinhNang}% sử dụng • ${x.mucDoTuongTac}`,
          linhVuc: '',
          donVi: x.donVi,
          chatLuong: x.mucDoTuongTac,
          tanSuatDangNhap: x.tanSuatDangNhap,
          tyLeSuDungTinhNang: x.tyLeSuDungTinhNang,
          mucDoTuongTac: x.mucDoTuongTac,
          soYTuongDaNop: x.soYTuongDaNop,
        }));
        data = filterByDonVi(data);
        data = filterByHieuQua(data);
        return data;
      }
      case 'y-tuong-giai-phap-sang-kien': {
        // Thống kê số lượng theo trạng thái (tổng số/đã phê duyệt/được công nhận), theo cả lĩnh vực và đơn vị.
        // Thời gian đã được áp dụng sẵn ở tầng API (dash được tải lại theo range đang chọn).
        const tyLe = (tu: number, mau: number) => (mau > 0 ? Math.round((tu / mau) * 100) : 0);
        const xepHieuQua = (tyLeCongNhan: number) => (tyLeCongNhan >= 40 ? 'Cao' : tyLeCongNhan >= 20 ? 'Trung bình' : 'Thấp');
        const theoLinhVucRows = (dash?.theoLinhVuc ?? []).map(x => {
          const tyLeCongNhan = tyLe(x.soDuocCongNhan, x.soLuong);
          return {
            nhom: 'Lĩnh vực',
            ten: x.ten,
            linhVuc: x.ten,
            donVi: '',
            tongSo: x.soLuong,
            daDuyet: x.soDuocDuyet,
            congNhan: x.soDuocCongNhan,
            tyLeDuyet: tyLe(x.soDuocDuyet, x.soLuong),
            tyLeCongNhan,
            chatLuong: xepHieuQua(tyLeCongNhan),
          };
        });
        const theoDonViRows = (dash?.theoDonVi ?? []).map(x => {
          const tyLeCongNhan = tyLe(x.soDuocCongNhan, x.soLuong);
          return {
            nhom: 'Đơn vị',
            ten: x.ten,
            linhVuc: '',
            donVi: x.ten,
            tongSo: x.soLuong,
            daDuyet: x.soDuocDuyet,
            congNhan: x.soDuocCongNhan,
            tyLeDuyet: tyLe(x.soDuocDuyet, x.soLuong),
            tyLeCongNhan,
            chatLuong: xepHieuQua(tyLeCongNhan),
          };
        });
        let data = [...theoLinhVucRows, ...theoDonViRows];
        data = filterByDonVi(data);
        data = filterByLinhVuc(data);
        data = filterByHieuQua(data);
        return data;
      }
      default:
        return [];
    }
  }, [reportTemplate, dash, lb, tuongTac, slaReport, filterDonVi, filterLinhVuc, filterHieuQua, range, chiThuongGroupBy]);

  const mucDoTuongTacColor = (v: string) => {
    if (v === 'Cao') return 'green';
    if (v === 'Trung bình') return 'gold';
    return 'red';
  };

  const reportColumns = useMemo(() => {
    const baseColumns = [
      { title: 'Chỉ tiêu', dataIndex: 'ten', key: 'ten', ellipsis: true, render: (value: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
      { title: 'Giá trị', dataIndex: 'soLuong', key: 'soLuong', width: 150, align: 'center' as const, render: (value: any) => <span style={{ fontWeight: 800, fontSize: 18, color: '#003087' }}>{typeof value === 'number' ? fmtNum(value) : (value ?? '—')}</span> },
      { title: 'Ghi chú', dataIndex: 'ghiChu', key: 'ghiChu', width: 250, render: (value: string) => <span style={{ fontSize: 13, color: '#444' }}>{value || '—'}</span> },
    ];

    if (reportTemplate === 'leaderboard' || reportTemplate === 'dong-gop') {
      return [
        {
          title: 'Hạng', dataIndex: 'xepHang', key: 'xepHang', width: 75, align: 'center' as const,
          render: (v: number) =>
            v === 1 ? <i className="fa-solid fa-trophy text-warning" style={{ fontSize: 20 }} />
              : v === 2 ? <i className="fa-solid fa-trophy text-secondary" style={{ fontSize: 20 }} />
                : v === 3 ? <i className="fa-solid fa-trophy" style={{ color: '#cd7f32', fontSize: 20 }} />
                  : <span style={{ fontWeight: 800, fontSize: 15 }}>{v}</span>,
        },
        { title: 'Loại', dataIndex: 'loai', key: 'loai', width: 100, render: (value: string) => <Tag color={value === 'Đơn vị' ? 'purple' : 'blue'}>{value}</Tag> },
        { title: 'Họ tên / Đơn vị', dataIndex: 'ten', key: 'ten', ellipsis: true, render: (value: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', width: 200, ellipsis: true, render: (value: string) => <span style={{ fontSize: 14, color: '#333' }}>{value || '—'}</span> },
        { title: 'Số nộp', dataIndex: 'soNop', key: 'soNop', width: 95, align: 'center' as const, render: (v: any) => <span style={{ fontWeight: 600, fontSize: 14 }}>{v ?? 0}</span> },
        { title: 'Duyệt', dataIndex: 'soDuocDuyet', key: 'soDuocDuyet', width: 85, align: 'center' as const, render: (v: any) => <span style={{ fontWeight: 600, fontSize: 14 }}>{v ?? 0}</span> },
        {
          title: 'Công nhận', dataIndex: 'soDuocCongNhan', key: 'soDuocCongNhan', width: 105, align: 'center' as const,
          render: (v: number) => v > 0 ? <Tag color="purple" style={{ fontSize: 13, fontWeight: 700, padding: '2px 10px' }}>{v}</Tag> : <span style={{ fontSize: 14, color: '#888' }}>0</span>
        },
        { title: 'Điểm', dataIndex: 'diem', key: 'diem', width: 110, align: 'right' as const, render: (value: any) => <span style={{ fontWeight: 800, fontSize: 15, color: '#003087' }}>{fmtNum(value)}</span> },
        { title: 'Lượt tương tác', dataIndex: 'luotTuongTac', key: 'luotTuongTac', width: 120, align: 'center' as const, render: (v: number) => <span style={{ fontWeight: 600, fontSize: 14 }}>{fmtNum(v ?? 0)}</span> },
        { title: 'Huy hiệu', dataIndex: 'huyHieu', key: 'huyHieu', width: 130, render: (v?: string | null) => v || '—' },
      ];
    }

    if (reportTemplate === 'chien-dich') {
      return [
        { title: 'Chiến dịch', dataIndex: 'ten', key: 'ten', ellipsis: true, render: (value: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 135, render: (value: string) => <Tag color={value === 'Đang diễn ra' ? 'blue' : 'green'} style={{ fontSize: 13, fontWeight: 700, padding: '2px 10px' }}>{value}</Tag> },
        { title: 'Số người tham gia', dataIndex: 'ngUoiThamGia', key: 'ngUoiThamGia', width: 130, align: 'center' as const, render: (v: any) => <span style={{ fontWeight: 700, fontSize: 14, color: '#003087' }}>{fmtNum(v ?? 0)}</span> },
        { title: 'Số nộp', dataIndex: 'soNop', key: 'soNop', width: 95, align: 'center' as const, render: (v: any) => <span style={{ fontWeight: 600, fontSize: 14 }}>{v ?? 0}</span> },
        { title: 'Hoàn thành', dataIndex: 'tyLeHoanThanh', key: 'tyLeHoanThanh', width: 115, align: 'center' as const, render: (value: number) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}%</span> },
        { title: 'Thưởng', dataIndex: 'tongThuong', key: 'tongThuong', width: 140, align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 700, fontSize: 14, color: '#17a2b8' }}>{fmtNum(v)}</span> },
        { title: 'Huy hiệu', dataIndex: 'huyHieu', key: 'huyHieu', width: 95, align: 'center' as const, render: (v: any) => <span style={{ fontWeight: 600, fontSize: 14 }}>{v ?? 0}</span> },
      ];
    }




    if (reportTemplate === 'chuong-trinh') {
      return [
        { title: 'Chương trình / Dự án', dataIndex: 'ten', key: 'ten', ellipsis: true, render: (value: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 130, render: (value: string) => <span style={{ color: CDS_STATUS_COLOR[value], fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Tiến độ', dataIndex: 'tienDo', key: 'tienDo', width: 95, align: 'center' as const, render: (value: number) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}%</span> },
        { title: 'Ngân sách', dataIndex: 'nganSach', key: 'nganSach', width: 105, align: 'center' as const, render: (value: number) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}%</span> },
        { title: 'Milestone', key: 'moc', width: 105, align: 'center' as const, render: (_: unknown, r: typeof CDS_PROGRAMS[number]) => <span style={{ fontWeight: 600, fontSize: 14 }}>{r.mocHoanThanh}/{r.mocTong}</span> },
        {
          title: 'Hiệu quả đạt được', key: 'hieuQua', width: 260,
          render: (_: unknown, r: typeof CDS_PROGRAMS[number]) => (
            <div>
              <div style={{ marginBottom: 4 }}>
                <Tag color={r.chatLuong === 'Cao' ? 'green' : r.chatLuong === 'Trung bình' ? 'gold' : 'red'} style={{ fontSize: 13, fontWeight: 700, padding: '2px 10px' }}>{r.chatLuong}</Tag>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#16a34a', marginLeft: 6 }}>{fmtNum(r.tietKiem)}</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#5e6278' }}>{r.hieuQuaMoTa}</div>
            </div>
          ),
        },
      ];
    }

    if (reportTemplate === 'chi-thuong') {
      const groupLabel = CHI_THUONG_GROUP_OPTIONS.find(o => o.value === chiThuongGroupBy)?.label || 'Đối tượng';
      return [
        { title: groupLabel, dataIndex: 'ten', key: 'ten', ellipsis: true, render: (value: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Đơn vị liên quan', dataIndex: 'donVi', key: 'donVi', ellipsis: true, render: (value: string) => <span style={{ fontSize: 13 }}>{value || '—'}</span> },
        { title: 'Tổng tiền thưởng', dataIndex: 'soLuong', key: 'soLuong', width: 170, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 800, fontSize: 15, color: '#16a34a' }}>{fmtNum(value)}</span> },
        { title: 'Tổng điểm thưởng', dataIndex: 'diemThuong', key: 'diemThuong', width: 150, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 700, fontSize: 14, color: '#7239EA' }}>{fmtNum(value)}</span> },
        { title: 'Số lượt chi', dataIndex: 'soLuot', key: 'soLuot', width: 110, align: 'center' as const, render: (value: number) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Ghi chú', dataIndex: 'ghiChu', key: 'ghiChu', ellipsis: true },
      ];
    }

    if (reportTemplate === 'quy') {
      return [
        { title: 'Loại quỹ', dataIndex: 'loaiQuy', key: 'loaiQuy', ellipsis: true, render: (value: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Ngân sách đầu', dataIndex: 'nganSachDau', key: 'nganSachDau', width: 160, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 700, fontSize: 14 }}>{fmtNum(value)}</span> },
        { title: 'Đã chi', dataIndex: 'daChi', key: 'daChi', width: 160, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 700, fontSize: 14 }}>{fmtNum(value)}</span> },
        { title: 'Còn lại', key: 'conLai', width: 160, align: 'right' as const, render: (_: unknown, row: any) => <span style={{ fontWeight: 800, fontSize: 16, color: '#16a34a' }}>{fmtNum(row.nganSachDau - row.daChi)}</span> },
      ];
    }

    if (reportTemplate === 'qua-tang') {
      return [
        {
          title: 'Quà tặng', dataIndex: 'ten', key: 'ten', ellipsis: true,
          render: (value: string, r: any) => (
            <div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span>
              {r.laLoaiPhoBien && <Tag color="gold" className="ms-2">Loại phổ biến nhất</Tag>}
            </div>
          ),
        },
        { title: 'Loại quà', dataIndex: 'loaiQua', key: 'loaiQua', width: 180, render: (v: string) => <Tag color="blue">{v}</Tag> },
        { title: 'Số lượng quy đổi', dataIndex: 'daQuyDoi', key: 'daQuyDoi', width: 140, align: 'center' as const, render: (v: number) => <span style={{ fontWeight: 800, fontSize: 15, color: '#003087' }}>{fmtNum(v)}</span> },
        { title: 'Tồn kho', dataIndex: 'tonKho', key: 'tonKho', width: 110, align: 'center' as const, render: (v: number) => <span style={{ fontWeight: 700, fontSize: 14, color: v <= 5 ? '#dc2626' : '#333' }}>{fmtNum(v)}</span> },
        { title: 'Chi phí quy đổi (điểm)', dataIndex: 'chiPhi', key: 'chiPhi', width: 160, align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 700, fontSize: 14 }}>{fmtNum(v)}</span> },
      ];
    }

    if (reportTemplate === 'vi-giao-dich') {
      return [
        { title: 'Thời gian', dataIndex: 'thoiGian', key: 'thoiGian', width: 160, render: (v: string) => <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span> },
        { title: 'Loại giao dịch', dataIndex: 'loai', key: 'loai', ellipsis: true, render: (v: string) => <span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span> },
        { title: 'Ví', dataIndex: 'vi', key: 'vi', width: 110, render: (v: string) => <span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span> },
        { title: 'Số tiền', dataIndex: 'soTien', key: 'soTien', width: 120, align: 'right' as const, render: (value: string) => <span style={{ fontWeight: 800, fontSize: 15, color: value.startsWith('+') ? '#16a34a' : '#dc2626' }}>{value}</span> },
        { title: 'Số dư', dataIndex: 'soDu', key: 'soDu', width: 120, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 800, fontSize: 15 }}>{fmtNum(value)}</span> },
      ];
    }

    if (reportTemplate === 'hieu-qua') {
      return [
        { title: 'Sáng kiến / Ý tưởng', dataIndex: 'ten', key: 'ten', ellipsis: true, render: (value: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Tiết kiệm chi phí', dataIndex: 'tietKiem', key: 'tietKiem', width: 170, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 800, fontSize: 15, color: '#16a34a' }}>{fmtNum(value)}</span> },
        { title: 'Tăng doanh thu', dataIndex: 'doanhThu', key: 'doanhThu', width: 170, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 800, fontSize: 15, color: '#003087' }}>{fmtNum(value)}</span> },
        { title: 'Nhân rộng', dataIndex: 'nhanRong', key: 'nhanRong', width: 100, align: 'center' as const, render: (v: any) => <span style={{ fontWeight: 700, fontSize: 14 }}>{v ?? 0}</span> },
        { title: 'Chất lượng', dataIndex: 'chatLuong', key: 'chatLuong', width: 120, align: 'center' as const, render: (v: string) => <Tag color={v === 'Cao' ? 'green' : 'gold'} style={{ fontSize: 13, fontWeight: 700, padding: '2px 10px' }}>{v}</Tag> },
      ];
    }

    if (reportTemplate === 'roi') {
      return [
        { title: 'Sáng kiến / Ý tưởng', dataIndex: 'ten', key: 'ten', ellipsis: true, render: (value: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Chi phí quỹ', dataIndex: 'chiPhi', key: 'chiPhi', width: 140, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 700, fontSize: 14, color: '#dc2626' }}>{fmtNum(value)}</span> },
        { title: 'Tiết kiệm chi phí', dataIndex: 'tietKiem', key: 'tietKiem', width: 170, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 800, fontSize: 15, color: '#16a34a' }}>{fmtNum(value)}</span> },
        { title: 'Tăng doanh thu', dataIndex: 'doanhThu', key: 'doanhThu', width: 170, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 800, fontSize: 15, color: '#003087' }}>{fmtNum(value)}</span> },
        { title: 'Giá trị hiệu quả', dataIndex: 'giaTri', key: 'giaTri', width: 160, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 800, fontSize: 15, color: '#003087' }}>{fmtNum(value)}</span> },
        { title: 'ROI', dataIndex: 'roi', key: 'roi', width: 110, align: 'right' as const, render: (value: number) => <span style={{ fontWeight: 800, fontSize: 16, color: value >= 1000 ? '#16a34a' : value >= 100 ? '#f59e0b' : '#ef4444' }}>{value.toFixed(0)}%</span> },
        { title: 'Nhân rộng', dataIndex: 'nhanRong', key: 'nhanRong', width: 100, align: 'center' as const, render: (v: any) => <span style={{ fontWeight: 700, fontSize: 14 }}>{v ?? 0}</span> },
        { title: 'Chất lượng', dataIndex: 'chatLuong', key: 'chatLuong', width: 120, align: 'center' as const, render: (v: string) => <Tag color={v === 'Cao' ? 'green' : 'gold'} style={{ fontSize: 13, fontWeight: 700, padding: '2px 10px' }}>{v}</Tag> },
      ];
    }

    if (reportTemplate === 'y-tuong-giai-phap-sang-kien') {
      return [
        { title: 'Lĩnh vực / Đơn vị', dataIndex: 'ten', key: 'ten', ellipsis: true, render: (value: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Tổng số', dataIndex: 'tongSo', key: 'tongSo', width: 100, align: 'center' as const, render: (v: number) => <span style={{ fontWeight: 700, fontSize: 14 }}>{fmtNum(v)}</span> },
        { title: 'Đã phê duyệt', dataIndex: 'daDuyet', key: 'daDuyet', width: 110, align: 'center' as const, render: (v: number) => <Tag color="success">{fmtNum(v)}</Tag> },
        { title: 'Được công nhận', dataIndex: 'congNhan', key: 'congNhan', width: 120, align: 'center' as const, render: (v: number) => <Tag color="purple">{fmtNum(v)}</Tag> },
        { title: 'Tỷ lệ duyệt', dataIndex: 'tyLeDuyet', key: 'tyLeDuyet', width: 100, align: 'center' as const, render: (v: number) => `${v}%` },
        { title: 'Tỷ lệ công nhận', dataIndex: 'tyLeCongNhan', key: 'tyLeCongNhan', width: 120, align: 'center' as const, render: (v: number) => `${v}%` },
        { title: 'Mức độ hiệu quả', dataIndex: 'chatLuong', key: 'chatLuong', width: 130, align: 'center' as const, render: (v: string) => <Tag color={v === 'Cao' ? 'green' : v === 'Trung bình' ? 'gold' : 'red'} style={{ fontSize: 13, fontWeight: 700 }}>{v}</Tag> },
      ];
    }

    if (reportTemplate === 'tuong-tac') {
      return [
        { title: 'Tác nhân', dataIndex: 'nhom', key: 'nhom', width: 110, render: (v: string) => <Tag color={v === 'Đơn vị' ? 'blue' : 'default'} style={{ fontSize: 12, fontWeight: 700 }}>{v}</Tag> },
        { title: 'Người dùng / Đơn vị', dataIndex: 'ten', key: 'ten', ellipsis: true, render: (value: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span> },
        { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', width: 180, ellipsis: true, render: (v: string) => v || '—' },
        { title: 'Số người SD', dataIndex: 'soNguoiSuDung', key: 'soNguoiSuDung', width: 100, align: 'center' as const, render: (v: number | null) => v == null ? '—' : fmtNum(v) },
        { title: 'Lượt xem', dataIndex: 'luotXem', key: 'luotXem', width: 100, align: 'center' as const, render: (v: number) => fmtNum(v) },
        { title: 'Lượt thích', dataIndex: 'luotThich', key: 'luotThich', width: 100, align: 'center' as const, render: (v: number) => fmtNum(v) },
        { title: 'Bình luận', dataIndex: 'binhLuan', key: 'binhLuan', width: 100, align: 'center' as const, render: (v: number) => fmtNum(v) },
        { title: 'Đăng nhập', dataIndex: 'soLanDangNhap', key: 'soLanDangNhap', width: 100, align: 'center' as const, render: (v: number) => fmtNum(v) },
        { title: 'Mức độ SD', dataIndex: 'mucDoSuDung', key: 'mucDoSuDung', width: 110, align: 'center' as const, render: (v: string) => <Tag color={mucDoTuongTacColor(v)} style={{ fontSize: 12, fontWeight: 700 }}>{v}</Tag> },
      ];
    }

    if (reportTemplate === 'usage') {
      return [
        {
          title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', width: 220, fixed: 'left' as const,
          render: (value: string) => <span className="fw-semibold">{value}</span>,
        },
        {
          title: 'Người dùng hoạt động', dataIndex: 'nguoiDungHoatDong', key: 'nguoiDungHoatDong', width: 150, align: 'center' as const,
          render: (v: number) => <span className="fw-bold" style={{ color: '#003087' }}>{fmtNum(v)}</span>,
        },
        {
          title: 'Tần suất ĐN (lần/tuần)', dataIndex: 'tanSuatDangNhap', key: 'tanSuatDangNhap', width: 150, align: 'center' as const,
          render: (v: number) => <span className="fw-semibold">{v}</span>,
        },
        {
          title: 'Tỷ lệ SD tính năng', dataIndex: 'tyLeSuDungTinhNang', key: 'tyLeSuDungTinhNang', width: 140, align: 'center' as const,
          render: (v: number) => (
            <span className="fw-bold" style={{ color: v >= 80 ? '#22c55e' : v >= 60 ? '#f59e0b' : '#ef4444' }}>{v}%</span>
          ),
        },
        {
          title: 'Mức độ tương tác', dataIndex: 'mucDoTuongTac', key: 'mucDoTuongTac', width: 130, align: 'center' as const,
          render: (v: string) => <Tag color={mucDoTuongTacColor(v)} style={{ fontSize: 12, fontWeight: 700 }}>{v}</Tag>,
        },
        {
          title: 'Ý tưởng đã nộp', dataIndex: 'soYTuongDaNop', key: 'soYTuongDaNop', width: 120, align: 'center' as const,
          render: (v: number) => <span className="fw-semibold">{v}</span>,
        },
      ];
    }

    return baseColumns;
  }, [reportTemplate, chiThuongGroupBy]);

  // Chỉ các mẫu báo cáo có dữ liệu lĩnh vực/mức độ hiệu quả mới nên bật 2 bộ lọc này —
  // tránh trường hợp người dùng đổi bộ lọc nhưng chỉ số không đổi vì mẫu báo cáo không có dữ liệu tương ứng.
  const supportsLinhVuc = ['hieu-qua', 'chien-dich', 'chuong-trinh', 'roi'].includes(reportTemplate);
  const supportsHieuQua = ['hieu-qua', 'chuong-trinh', 'roi', 'usage'].includes(reportTemplate);

  const EXPORT_CONFIG = {
    csv: { fn: exportIdeaReport, ext: 'csv', label: 'CSV — mở bằng Excel' },
    excel: { fn: exportIdeaReportExcel, ext: 'xlsx', label: 'Excel' },
    pdf: { fn: exportIdeaReportPdf, ext: 'pdf', label: 'PDF' },
    word: { fn: exportIdeaReportWord, ext: 'docx', label: 'Word' },
  } as const;

  const getTemplateFileName = () => {
    const objLabel = REPORT_OBJECT_OPTIONS.find(x => x.value === reportObject)?.label ?? 'baoCao';
    const tmplLabel = selectedTemplate.label.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
    const timeLabel = year === ALL_TIME ? 'tat-ca' : String(year);
    return `bao-cao-dmst-${objLabel}-${tmplLabel}-${timeLabel}`;
  };

  /** Lưu Blob về máy với đúng tên file */
  const saveBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' | 'word') => {
    setExporting(true);
    setExportingFormat(format);
    try {
      const { label } = EXPORT_CONFIG[format];
      const fileName = getTemplateFileName();

      // Tất cả định dạng đều xuất theo bảng của mẫu đang chọn (tạo file ngay tại FE)
      if (reportRows.length === 0) {
        message.warning('Không có dữ liệu để xuất cho mẫu báo cáo này!');
        return;
      }

      // Tạo dữ liệu CSV/Excel từ bảng hiện tại (chỉ 1 sheet tương ứng với mẫu đang chọn)
      const headers = reportColumns.map((c: any) => c.title);
      const dataRows = reportRows.map((row: any) => {
        return reportColumns.map((col: any) => {
          const val = row[col.dataIndex ?? col.key];
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return val;
          return val ?? '';
        });
      });

      if (format === 'csv') {
        // Xuất CSV (luôn là 1 sheet)
        const csvHeaders = headers.join(',');
        const csvRows = dataRows.map((row: any[]) => {
          return row.map((val: any) => {
            const strVal = String(val ?? '').replace(/"/g, '""');
            return `"${strVal}"`;
          }).join(',');
        });
        const csv = `\uFEFF${csvHeaders}\n${csvRows.join('\n')}`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${fileName}.csv`; a.click();
        URL.revokeObjectURL(url);
        message.success(`Đã xuất báo cáo "${selectedTemplate.label}" (CSV)`);
      } else if (format === 'excel') {
        // Xuất .xlsx ngay tại FE bằng exceljs: Times New Roman, tiêu đề bảng
        // in đậm + căn giữa + nền mờ, border đầy đủ mọi ô
        const em: any = await import('exceljs');
        // Interop CJS/ESM: Workbook có thể nằm ở namespace, .default hoặc .default.default
        const ExcelJS = em?.Workbook ? em : em?.default?.Workbook ? em.default : em?.default?.default;
        if (!ExcelJS?.Workbook) throw new Error('Không tải được thư viện exceljs — hãy chạy pnpm install và khởi động lại dev server');
        const wb = new ExcelJS.Workbook();
        const sheetName = selectedTemplate.label.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31).trim() || 'BaoCao';
        const ws = wb.addWorksheet(sheetName);
        const soCot = headers.length;
        const FONT = 'Times New Roman';
        const borderAll = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' },
        } as const;

        // Tiêu đề + phụ đề + ngày xuất (merge ngang)
        ws.mergeCells(1, 1, 1, soCot);
        Object.assign(ws.getCell(1, 1), {
          value: selectedTemplate.label.toUpperCase(),
          font: { name: FONT, size: 14, bold: true },
          alignment: { horizontal: 'center' },
        });
        ws.mergeCells(2, 1, 2, soCot);
        Object.assign(ws.getCell(2, 1), {
          value: `Đối tượng: ${REPORT_OBJECT_OPTIONS.find(x => x.value === reportObject)?.label ?? 'Tất cả'} | ${year === ALL_TIME ? 'Tất cả năm' : `Năm ${year}`}`,
          font: { name: FONT, size: 12 },
          alignment: { horizontal: 'center' },
        });
        ws.mergeCells(3, 1, 3, soCot);
        Object.assign(ws.getCell(3, 1), {
          value: `Xuất ngày: ${new Date().toLocaleString('vi-VN')}`,
          font: { name: FONT, size: 10, italic: true },
          alignment: { horizontal: 'center' },
        });

        // Hàng tiêu đề bảng (dòng 5): in đậm, căn giữa, nền mờ, border
        const headerRowIdx = 5;
        headers.forEach((h: any, i: number) => {
          const c = ws.getCell(headerRowIdx, i + 1);
          c.value = String(h ?? '');
          c.font = { name: FONT, size: 12, bold: true };
          c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E2F3' } };
          c.border = borderAll as any;
        });

        // Dữ liệu: giữ số là số, border đầy đủ
        dataRows.forEach((row: any[], r: number) => {
          row.forEach((val: any, i: number) => {
            const c = ws.getCell(headerRowIdx + 1 + r, i + 1);
            c.value = typeof val === 'number' ? val : String(val ?? '');
            c.font = { name: FONT, size: 12 };
            c.border = borderAll as any;
          });
        });

        // Độ rộng cột theo nội dung (tối đa 60)
        for (let i = 0; i < soCot; i++) {
          const maxLen = Math.max(String(headers[i] ?? '').length,
            ...dataRows.map((r: any[]) => String(r[i] ?? '').length));
          ws.getColumn(i + 1).width = Math.min(60, maxLen + 4);
        }

        const buf = await wb.xlsx.writeBuffer();
        saveBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${fileName}.xlsx`);
        message.success(`Đã xuất báo cáo "${selectedTemplate.label}" (Excel .xlsx)`);
      } else if (format === 'word') {
        // Word (.docx) tạo ngay tại FE bằng thư viện `docx`: Times New Roman,
        // header đậm + căn giữa + nền mờ, bảng full-width có border đầy đủ
        const dm: any = await import('docx');
        // Interop CJS/ESM tương tự exceljs
        const dx = dm?.Document ? dm : dm?.default?.Document ? dm.default : dm?.default?.default;
        if (!dx?.Document) throw new Error('Không tải được thư viện docx — hãy chạy pnpm install và khởi động lại dev server');
        const {
          Document, Packer, Paragraph, TextRun, Table: DxTable, TableRow: DxRow,
          TableCell: DxCell, WidthType, AlignmentType, BorderStyle, ShadingType,
        } = dx;

        const FONT = 'Times New Roman';
        const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
        const lamPara = (text: string, opts: { bold?: boolean; size?: number; center?: boolean; italics?: boolean } = {}) =>
          new Paragraph({
            alignment: opts.center ? AlignmentType.CENTER : undefined,
            children: [new TextRun({ text, font: FONT, bold: opts.bold, italics: opts.italics, size: opts.size ?? 24 })],
          });

        const headerRow = new DxRow({
          tableHeader: true,
          children: headers.map((h: any) => new DxCell({
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'D9E2F3' },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: String(h ?? ''), font: FONT, bold: true, size: 24 })],
            })],
          })),
        });

        const bodyRows = dataRows.map((row: any[]) => new DxRow({
          children: row.map((val: any) => new DxCell({
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [lamPara(String(val ?? ''))],
          })),
        }));

        const doc = new Document({
          sections: [{
            children: [
              lamPara(selectedTemplate.label.toUpperCase(), { bold: true, size: 28, center: true }),
              lamPara(`Đối tượng: ${REPORT_OBJECT_OPTIONS.find(x => x.value === reportObject)?.label ?? 'Tất cả'} | ${year === ALL_TIME ? 'Tất cả năm' : `Năm ${year}`}`, { center: true }),
              lamPara(`Xuất ngày: ${new Date().toLocaleString('vi-VN')}`, { center: true, size: 20, italics: true }),
              lamPara(' '),
              new DxTable({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: border, bottom: border, left: border, right: border,
                  insideHorizontal: border, insideVertical: border,
                },
                rows: [headerRow, ...bodyRows],
              }),
            ],
          }],
        });

        const docxBlob: Blob = await Packer.toBlob(doc);
        saveBlob(docxBlob, `${fileName}.docx`);
        message.success(`Đã xuất báo cáo "${selectedTemplate.label}" (Word .docx)`);
      } else {
        // PDF tạo ngay tại FE bằng pdfmake (font Roboto kèm sẵn — hỗ trợ tiếng Việt)
        // @ts-ignore — pdfmake không kèm type declaration cho deep import
        const pdfMakeModule: any = await import('pdfmake/build/pdfmake');
        // @ts-ignore
        const pdfFontsModule: any = await import('pdfmake/build/vfs_fonts');
        const pdfMake = pdfMakeModule.default ?? pdfMakeModule;
        pdfMake.vfs = pdfFontsModule.default?.pdfMake?.vfs
          ?? pdfFontsModule.pdfMake?.vfs
          ?? pdfFontsModule.default?.vfs
          ?? pdfFontsModule.vfs;

        const soCot = headers.length;
        const docDefinition: any = {
          pageOrientation: soCot > 6 ? 'landscape' : 'portrait',
          content: [
            { text: selectedTemplate.label.toUpperCase(), bold: true, fontSize: 14, alignment: 'center' },
            { text: `Đối tượng: ${REPORT_OBJECT_OPTIONS.find(x => x.value === reportObject)?.label ?? 'Tất cả'} | ${year === ALL_TIME ? 'Tất cả năm' : `Năm ${year}`}`, alignment: 'center', margin: [0, 2, 0, 0] },
            { text: `Xuất ngày: ${new Date().toLocaleString('vi-VN')}`, alignment: 'center', fontSize: 9, italics: true, margin: [0, 2, 0, 10] },
            {
              table: {
                headerRows: 1,
                widths: Array(soCot).fill('*'),
                body: [
                  // Hàng tiêu đề: in đậm, căn giữa, nền mờ
                  headers.map((h: any) => ({ text: String(h ?? ''), bold: true, alignment: 'center', fillColor: '#D9E2F3' })),
                  ...dataRows.map((row: any[]) => row.map((val: any) => ({ text: String(val ?? '') }))),
                ],
              },
              // layout mặc định của pdfmake đã kẻ border đầy đủ mọi ô
            },
          ],
          defaultStyle: { fontSize: 10 },
        };

        pdfMake.createPdf(docDefinition).download(`${fileName}.pdf`);
        message.success(`Đã xuất báo cáo "${selectedTemplate.label}" (${label})`);
      }
    } catch (e: any) {
      console.error('[BaoCao] export error:', e);
      message.error(`Không xuất được báo cáo: ${e?.message ?? e}`);
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
    {
      title: 'Điểm thưởng', dataIndex: 'diemThuong', key: 'diemThuong', width: 110, align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 700, color: '#003087' }}>{fmtNum(v ?? 0)}</span>,
    },
    {
      title: 'Lượt tương tác', dataIndex: 'luotTuongTac', key: 'luotTuongTac', width: 120, align: 'center' as const,
      render: (v?: number) => <span className="fw-semibold">{fmtNum(v ?? 0)}</span>,
    },
    {
      title: 'Huy hiệu', dataIndex: 'huyHieu', key: 'huyHieu', width: 130, align: 'center' as const,
      render: (v?: string | null) => v
        ? <Tag color={v.includes('Vàng') ? 'gold' : v.includes('Bạc') ? 'default' : 'orange'}>{v}</Tag>
        : <span className="text-muted">—</span>,
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
                  {/* <Tag color="blue">Dashboard = số liệu tổng quan</Tag> */}
                  <Tag color="gold">Báo cáo = chọn đối tượng + mẫu + bảng</Tag>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-lg-3">
                  <div className="fs-8 fw-semibold text-muted mb-2">Đối tượng báo cáo</div>
                  <Select
                    value={reportObject}
                    onChange={(value) => setReportObject(value ?? 'TatCa')}
                    className="w-100"
                    size="large"
                    allowClear
                    placeholder="Tất cả (không bắt buộc)"
                  >
                    {REPORT_OBJECT_OPTIONS.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
                  </Select>
                </div>
                <div className="col-lg-5">
                  <div className="fs-8 fw-semibold text-muted mb-2">Mẫu báo cáo</div>
                  <Select value={reportTemplate} onChange={(value) => changeReportTemplate(value)} className="w-100" size="large">
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
                    showSearch
                    optionFilterProp="label"
                  >
                    <Option value="">Tất cả đơn vị</Option>
                    {orgUnitOptions.map(opt => (
                      <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                  </Select>
                </div>
                <div className="col-md-4">
                  <div className="fs-8 text-muted mb-1">Lĩnh vực</div>
                  <Tooltip title={!supportsLinhVuc ? 'Mẫu báo cáo này không có dữ liệu theo lĩnh vực' : undefined}>
                    <AutoComplete
                      value={filterLinhVuc}
                      onChange={setFilterLinhVuc}
                      onSelect={setFilterLinhVuc}
                      options={LINH_VUC_OPTIONS}
                      placeholder="Chọn hoặc nhập lĩnh vực"
                      filterOption={(input, option) =>
                        (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                      allowClear
                      disabled={!supportsLinhVuc}
                      className="w-100"
                    />
                  </Tooltip>
                </div>
                <div className="col-md-4">
                  <div className="fs-8 text-muted mb-1">Mức độ hiệu quả</div>
                  <Tooltip title={!supportsHieuQua ? 'Mẫu báo cáo này không có dữ liệu theo mức độ hiệu quả' : undefined}>
                    <Select
                      value={filterHieuQua}
                      onChange={setFilterHieuQua}
                      className="w-100"
                      allowClear
                      disabled={!supportsHieuQua}
                      placeholder="Tất cả"
                    >
                      <Option value="">Tất cả</Option>
                      <Option value="Cao">Cao</Option>
                      <Option value="Trung bình">Trung bình</Option>
                      <Option value="Thấp">Thấp</Option>
                    </Select>
                  </Tooltip>
                </div>
              </div>

              {reportTemplate === 'chi-thuong' && (
                <div className="row g-3 mb-4 p-3 rounded-3" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <div className="col-12">
                    <div className="fs-8 fw-semibold text-muted mb-2">
                      <i className="fa-regular fa-layer-group me-1" />Thống kê chi thưởng theo
                    </div>
                    <Segmented
                      value={chiThuongGroupBy}
                      onChange={v => setChiThuongGroupBy(v as typeof chiThuongGroupBy)}
                      options={CHI_THUONG_GROUP_OPTIONS.map(o => ({ label: o.label, value: o.value }))}
                    />
                  </div>
                </div>
              )}

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

              {reportTemplate === 'chien-dich' && (
                <div className="row g-2 mb-4">
                  {[
                    { label: 'Tổng chiến dịch', value: fmtNum(reportRows.length), color: '#003087' },
                    { label: 'Tổng người tham gia', value: fmtNum(reportRows.reduce((s: number, r: any) => s + (r.ngUoiThamGia ?? 0), 0)), color: '#7239EA' },
                    { label: 'Tổng số nộp', value: fmtNum(reportRows.reduce((s: number, r: any) => s + (r.soNop ?? 0), 0)), color: '#F59F00' },
                    {
                      label: 'Tỷ lệ hoàn thành TB',
                      value: reportRows.length > 0
                        ? `${Math.round(reportRows.reduce((s: number, r: any) => s + (r.tyLeHoanThanh ?? 0), 0) / reportRows.length)}%`
                        : '—',
                      color: '#17C653',
                    },
                    { label: 'Tổng thưởng đã chi', value: fmtNum(reportRows.reduce((s: number, r: any) => s + (r.tongThuong ?? 0), 0)), color: '#F1416C' },
                    { label: 'Tổng huy hiệu đã trao', value: fmtNum(reportRows.reduce((s: number, r: any) => s + (r.huyHieu ?? 0), 0)), color: '#B5179E' },
                  ].map((k, i) => (
                    <div key={i} className="col-6 col-md-4 col-xl-2">
                      <div className="card card-flush h-100" style={{ borderLeft: `3px solid ${k.color}` }}>
                        <div className="card-body py-2 px-3">
                          <div className="fs-9 fw-semibold text-gray-600 mb-1 text-truncate">{k.label}</div>
                          <div className="fs-4 fw-bold" style={{ color: k.color }}>{k.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div className="fw-bold text-gray-800">
                  <i className="fa-regular fa-table me-2 text-primary" />Bảng kết quả
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <Tag color="geekblue">{selectedTemplate.group}</Tag>
                  <Tag color="cyan">{REPORT_OBJECT_OPTIONS.find(x => x.value === reportObject)?.label ?? 'Tất cả'}</Tag>
                </div>
              </div>

              {(reportTemplate === 'leaderboard' || reportTemplate === 'dong-gop') ? (
                /* ── Mẫu "Bảng xếp hạng" / "Đóng góp cá nhân/đơn vị": kỳ tháng/quý/năm + Top nhanh + Cá nhân/Đơn vị ── */
                <>
                  <div className="d-flex gap-2 flex-wrap align-items-center mb-4">
                    <Segmented
                      value={lbPeriod}
                      onChange={v => changeLbPeriod(v as 'nam' | 'quy' | 'thang')}
                      options={[
                        { label: 'Năm', value: 'nam' },
                        { label: 'Quý', value: 'quy' },
                        { label: 'Tháng', value: 'thang' },
                      ]}
                    />
                    {lbPeriod === 'quy' && (
                      <Select value={lbValue} onChange={changeLbValue} style={{ width: 100 }}>
                        {[1, 2, 3, 4].map(q => <Option key={q} value={q}>Quý {q}</Option>)}
                      </Select>
                    )}
                    {lbPeriod === 'thang' && (
                      <Select value={lbValue} onChange={changeLbValue} style={{ width: 110 }}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(t => <Option key={t} value={t}>Tháng {t}</Option>)}
                      </Select>
                    )}
                    <Segmented
                      value={lbTop}
                      onChange={v => changeLbTop(v as number)}
                      options={[
                        { label: 'Top 5', value: 5 },
                        { label: 'Top 10', value: 10 },
                        { label: 'Top 20', value: 20 },
                        { label: 'Top 50', value: 50 },
                      ]}
                    />
                    {lb?.ky && <Tag color="gold">{lb.ky}</Tag>}
                  </div>

                  <Spin spinning={lbLoading}>
                    <div className="row g-4">
                      <div className="col-12 mb-4">
                        <div className="fw-bold text-gray-700 fs-7 mb-2">
                          <i className="fa-regular fa-user me-2 text-primary" />Cá nhân tiêu biểu
                        </div>
                        <Table
                          columns={lbColumns(false) as any}
                          dataSource={(lb?.caNhan ?? []).filter(r => !filterDonVi
                            || (r.donVi || '').toLowerCase().includes(filterDonVi.toLowerCase())
                            || r.ten.toLowerCase().includes(filterDonVi.toLowerCase()))}
                          rowKey={(r: IIdeaContribution) => `cn-${r.xepHang}-${r.ten}`}
                          size="small"
                          pagination={false}
                          scroll={{ x: 'max-content' }}
                          locale={{ emptyText: <Empty description="Chưa có dữ liệu xếp hạng cá nhân trong kỳ" /> }}
                        />
                      </div>
                      <div className="col-12">
                        <div className="fw-bold text-gray-700 fs-7 mb-2">
                          <i className="fa-regular fa-building me-2 text-info" />Đơn vị tiêu biểu
                        </div>
                        <Table
                          columns={lbColumns(true) as any}
                          dataSource={(lb?.donVi ?? []).filter(r => !filterDonVi || r.ten.toLowerCase().includes(filterDonVi.toLowerCase()))}
                          rowKey={(r: IIdeaContribution) => `dv-${r.xepHang}-${r.ten}`}
                          size="small"
                          pagination={false}
                          scroll={{ x: 'max-content' }}
                          locale={{ emptyText: <Empty description="Chưa có dữ liệu xếp hạng đơn vị trong kỳ" /> }}
                        />
                      </div>
                    </div>
                  </Spin>
                </>
              ) : reportTemplate === 'tuong-tac' ? (
                /* ── Mẫu "Báo cáo tương tác hệ thống": lượt xem/thích/bình luận + mức độ sử dụng ── */
                <>
                  {tuongTac?.ky && <Tag color="gold" className="mb-3">{tuongTac.ky}</Tag>}
                  <Spin spinning={tuongTacLoading}>
                    <div className="row g-4">
                      <div className="col-xl-7">
                        <div className="fw-bold text-gray-700 fs-7 mb-2">
                          <i className="fa-regular fa-user me-2 text-primary" />Theo người dùng
                        </div>
                        <Table
                          columns={[
                            { title: 'Người dùng', dataIndex: 'tenNguoiDung', key: 'tenNguoiDung', ellipsis: true, render: (v: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{v}</span> },
                            { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', width: 180, ellipsis: true, render: (v: string) => v || '—' },
                            { title: 'Lượt xem', dataIndex: 'luotXem', key: 'luotXem', width: 100, align: 'center' as const, render: (v: number) => fmtNum(v) },
                            { title: 'Lượt thích', dataIndex: 'luotThich', key: 'luotThich', width: 100, align: 'center' as const, render: (v: number) => fmtNum(v) },
                            { title: 'Bình luận', dataIndex: 'binhLuan', key: 'binhLuan', width: 100, align: 'center' as const, render: (v: number) => fmtNum(v) },
                            { title: 'Đăng nhập', dataIndex: 'soLanDangNhap', key: 'soLanDangNhap', width: 100, align: 'center' as const, render: (v: number) => fmtNum(v) },
                            { title: 'Mức độ SD', dataIndex: 'mucDoSuDung', key: 'mucDoSuDung', width: 110, align: 'center' as const, render: (v: string) => <Tag color={mucDoTuongTacColor(v)} style={{ fontSize: 12, fontWeight: 700 }}>{v}</Tag> },
                          ] as any}
                          dataSource={(tuongTac?.theoNguoiDung ?? []).filter(r => !filterDonVi
                            || (r.donVi || '').toLowerCase().includes(filterDonVi.toLowerCase())
                            || r.tenNguoiDung.toLowerCase().includes(filterDonVi.toLowerCase()))}
                          rowKey={(r: ITuongTacTheoNguoi) => r.userId}
                          size="small"
                          pagination={{ pageSize: 10 }}
                          scroll={{ x: 'max-content' }}
                          locale={{ emptyText: <Empty description="Chưa có dữ liệu tương tác theo người dùng" /> }}
                        />
                      </div>
                      <div className="col-xl-5">
                        <div className="fw-bold text-gray-700 fs-7 mb-2">
                          <i className="fa-regular fa-building me-2 text-info" />Theo đơn vị
                        </div>
                        <Table
                          columns={[
                            { title: 'Đơn vị', dataIndex: 'donViCode', key: 'donViCode', ellipsis: true, render: (v: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{v}</span> },
                            { title: 'Số người SD', dataIndex: 'soNguoiSuDung', key: 'soNguoiSuDung', width: 100, align: 'center' as const, render: (v: number) => fmtNum(v) },
                            { title: 'Lượt xem', dataIndex: 'luotXem', key: 'luotXem', width: 90, align: 'center' as const, render: (v: number) => fmtNum(v) },
                            { title: 'Lượt thích', dataIndex: 'luotThich', key: 'luotThich', width: 90, align: 'center' as const, render: (v: number) => fmtNum(v) },
                            { title: 'Bình luận', dataIndex: 'binhLuan', key: 'binhLuan', width: 90, align: 'center' as const, render: (v: number) => fmtNum(v) },
                            { title: 'Mức độ SD', dataIndex: 'mucDoSuDung', key: 'mucDoSuDung', width: 110, align: 'center' as const, render: (v: string) => <Tag color={mucDoTuongTacColor(v)} style={{ fontSize: 12, fontWeight: 700 }}>{v}</Tag> },
                          ] as any}
                          dataSource={(tuongTac?.theoDonVi ?? []).filter(r => !filterDonVi || r.donViCode.toLowerCase().includes(filterDonVi.toLowerCase()))}
                          rowKey={(r: ITuongTacTheoDonVi) => r.donViCode}
                          size="small"
                          pagination={{ pageSize: 10 }}
                          scroll={{ x: 'max-content' }}
                          locale={{ emptyText: <Empty description="Chưa có dữ liệu tương tác theo đơn vị" /> }}
                        />
                      </div>
                    </div>
                  </Spin>
                </>
              ) : reportTemplate === 'y-tuong-giai-phap-sang-kien' ? (
                /* ── Mẫu "Báo cáo Ý tưởng/Giải pháp/Sáng kiến": trạng thái theo lĩnh vực/đơn vị, tách 2 tab ── */
                <Tabs
                  items={[
                    {
                      key: 'don-vi',
                      label: <span><i className="fa-regular fa-building me-2 text-info" />Theo đơn vị</span>,
                      children: (
                        <Table
                          columns={reportColumns.map((c: any) => c.key === 'ten' ? { ...c, title: 'Đơn vị' } : c) as any}
                          dataSource={(reportRows as any[]).filter(r => r.nhom === 'Đơn vị')}
                          rowKey={(r: any) => r.ten}
                          size="small"
                          pagination={false}
                          scroll={{ x: 'max-content' }}
                          locale={{ emptyText: <Empty description="Chưa có dữ liệu theo đơn vị" /> }}
                        />
                      ),
                    },
                    {
                      key: 'linh-vuc',
                      label: <span><i className="fa-regular fa-diagram-project me-2 text-primary" />Theo lĩnh vực</span>,
                      children: (
                        <Table
                          columns={reportColumns.map((c: any) => c.key === 'ten' ? { ...c, title: 'Lĩnh vực' } : c) as any}
                          dataSource={(reportRows as any[]).filter(r => r.nhom === 'Lĩnh vực')}
                          rowKey={(r: any) => r.ten}
                          size="small"
                          pagination={false}
                          scroll={{ x: 'max-content' }}
                          locale={{ emptyText: <Empty description="Chưa có dữ liệu theo lĩnh vực" /> }}
                        />
                      ),
                    },
                  ]}
                />
              ) : reportTemplate === 'sla' ? (
                /* ── Mẫu "Quy trình xử lý & SLA": thời gian từng bước, đúng hạn, điểm nghẽn, tồn đọng ── */
                <>
                  <Spin spinning={slaLoading}>
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <div className="p-3 rounded-3 bg-light-primary h-100">
                          <div className="text-primary fw-semibold fs-8 mb-1">Tỷ lệ đúng hạn chung</div>
                          <div className="fs-4 fw-bold">{slaReport?.tyLeDungHanChung ?? '—'}{slaReport?.tyLeDungHanChung != null ? '%' : ''}</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 rounded-3 bg-light-success h-100">
                          <div className="text-success fw-semibold fs-8 mb-1">Hồ sơ đã xử lý</div>
                          <div className="fs-4 fw-bold">{fmtNum(slaReport?.tongHoSoDaXuLy ?? 0)}</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 rounded-3 bg-light-warning h-100">
                          <div className="text-warning fw-semibold fs-8 mb-1">Ngưỡng SLA tiếp nhận</div>
                          <div className="fs-4 fw-bold">{slaReport?.thoiHanTiepNhanNgay ?? '—'} ngày</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 rounded-3 bg-light-danger h-100">
                          <div className="text-danger fw-semibold fs-8 mb-1">Ngưỡng SLA kiểm duyệt</div>
                          <div className="fs-4 fw-bold">{slaReport?.thoiHanKiemDuyetCongNhanNgay ?? '—'} ngày</div>
                        </div>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      {(slaReport?.cacBuoc ?? []).map((b, i) => (
                        <div key={i} className="col-md-6">
                          <div className="card h-100" style={{ borderLeft: `3px solid ${b.laDiemNghen ? '#F1416C' : '#17C653'}` }}>
                            <div className="card-body py-3 px-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold text-gray-800">{b.tenBuoc}</span>
                                {b.laDiemNghen && <Tag color="error">Điểm nghẽn</Tag>}
                              </div>
                              <div className="d-flex gap-4">
                                <div>
                                  <div className="fs-9 text-muted">Thời gian TB</div>
                                  <div className="fs-5 fw-bold">{b.gioTrungBinh ?? '—'} giờ</div>
                                </div>
                                <div>
                                  <div className="fs-9 text-muted">Tỷ lệ đúng hạn</div>
                                  <div className="fs-5 fw-bold">{b.tyLeDungHan ?? '—'}{b.tyLeDungHan != null ? '%' : ''}</div>
                                </div>
                                <div>
                                  <div className="fs-9 text-muted">Quá hạn</div>
                                  <div className="fs-5 fw-bold" style={{ color: '#F1416C' }}>{b.soQuaHan}</div>
                                </div>
                                <div>
                                  <div className="fs-9 text-muted">Số hồ sơ</div>
                                  <div className="fs-5 fw-bold">{b.soHoSo}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(slaReport?.diemNghen?.length ?? 0) > 0 && (
                      <div className="card mb-4">
                        <div className="card-header border-0 pt-3 pb-1">
                          <h4 className="card-title fw-semibold text-gray-700 fs-7 mb-0">
                            <i className="fa-regular fa-triangle-exclamation me-2 text-warning" />Điểm nghẽn quy trình
                          </h4>
                        </div>
                        <div className="card-body pt-1 pb-3">
                          {slaReport!.diemNghen.map((d, i) => (
                            <div key={i} className="d-flex gap-2 align-items-start mb-2 p-2 rounded" style={{ background: '#f1416c12', borderLeft: '3px solid #F1416C' }}>
                              <i className="fa-regular fa-circle-exclamation mt-1" style={{ color: '#F1416C' }} />
                              <span className="fs-8 text-gray-700">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="row g-4">
                      <div className="col-xl-6">
                        <div className="fw-bold text-gray-700 fs-7 mb-2">
                          <i className="fa-regular fa-building me-2 text-info" />Theo đơn vị
                        </div>
                        <Table
                          columns={[
                            { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', ellipsis: true, render: (v: string) => <span style={{ fontWeight: 700, fontSize: 14 }}>{v}</span> },
                            { title: 'Hồ sơ', dataIndex: 'tongHoSo', key: 'tongHoSo', width: 80, align: 'center' as const },
                            { title: 'TB (giờ)', dataIndex: 'gioTrungBinh', key: 'gioTrungBinh', width: 90, align: 'center' as const, render: (v: number) => v ?? '—' },
                            { title: 'Đúng hạn', dataIndex: 'tyLeDungHan', key: 'tyLeDungHan', width: 100, align: 'center' as const, render: (v: number) => <span style={{ color: v != null && v < 70 ? '#F1416C' : '#17C653', fontWeight: 700 }}>{v != null ? `${v}%` : '—'}</span> },
                            { title: 'Tồn đọng', dataIndex: 'soTonDongQuaHan', key: 'soTonDongQuaHan', width: 90, align: 'center' as const, render: (v: number) => v > 0 ? <Tag color="error">{v}</Tag> : 0 },
                          ] as any}
                          dataSource={(slaReport?.theoDonVi ?? []).filter(r => !filterDonVi || r.donVi.toLowerCase().includes(filterDonVi.toLowerCase()))}
                          rowKey={(r: ISlaTheoDonVi) => r.donVi}
                          size="small"
                          pagination={{ pageSize: 8 }}
                          scroll={{ x: 'max-content' }}
                          locale={{ emptyText: <Empty description="Chưa có dữ liệu SLA theo đơn vị" /> }}
                        />
                      </div>
                      <div className="col-xl-6">
                        <div className="fw-bold text-gray-700 fs-7 mb-2">
                          <i className="fa-regular fa-bell-exclamation me-2 text-danger" />Cảnh báo tồn đọng hồ sơ
                        </div>
                        <Table
                          columns={[
                            { title: 'Mã hồ sơ', dataIndex: 'code', key: 'code', width: 110, render: (v: string) => <span className="fw-bold text-primary">{v}</span> },
                            { title: 'Tên ý tưởng', dataIndex: 'title', key: 'title', ellipsis: true },
                            { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi', width: 150, ellipsis: true, render: (v: string) => v || '—' },
                            { title: 'Bước', dataIndex: 'buoc', key: 'buoc', width: 120 },
                            { title: 'Tồn đọng (giờ)', dataIndex: 'soGioTonDong', key: 'soGioTonDong', width: 110, align: 'center' as const, render: (v: number) => <Tag color="error">{fmtNum(v)}</Tag> },
                          ] as any}
                          dataSource={(slaReport?.canhBaoTonDong ?? []).filter(r => !filterDonVi || (r.donVi || '').toLowerCase().includes(filterDonVi.toLowerCase()))}
                          rowKey={(r: ISlaCanhBao) => r.ideaId}
                          size="small"
                          pagination={{ pageSize: 8 }}
                          scroll={{ x: 'max-content' }}
                          locale={{ emptyText: <Empty description="Không có hồ sơ tồn đọng quá hạn" /> }}
                        />
                      </div>
                    </div>
                  </Spin>
                </>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <Table
                    columns={reportColumns as any}
                    dataSource={reportRows as any}
                    rowKey={(record: any, index?: number) => record.ten || record.thoiGian || record.loaiQuy || record.doiTuong || index}
                    size="small"
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    locale={{ emptyText: <Empty description="Chưa có dữ liệu cho mẫu báo cáo này" /> }}
                  />
                </div>
              )}

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
                          { title: 'Hiệu quả đạt được', dataIndex: 'chatLuong', width: 130, render: (v: string) => <Tag color={v === 'Cao' ? 'green' : v === 'Trung bình' ? 'gold' : 'red'}>{v}</Tag> },
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
                                  { title: 'Loại', dataIndex: 'loaiDoiTuong', width: 100, render: (v: string) => <Tag color={v === 'Cá nhân' ? 'blue' : 'purple'}>{v}</Tag> },
                                  { title: 'Đơn vị', dataIndex: 'donVi', width: 180 },
                                  { title: 'Chiến dịch', dataIndex: 'chienDich', width: 180, render: (v: string | null) => v || '—' },
                                  { title: 'Sáng kiến', dataIndex: 'sangKien', width: 200, ellipsis: true, render: (v: string | null) => v || '—' },
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
