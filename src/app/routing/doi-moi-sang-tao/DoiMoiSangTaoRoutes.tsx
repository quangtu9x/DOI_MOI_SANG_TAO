import { FC, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

const DashboardDoiMoiPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/dashboard/DashboardDoiMoiPage').then(m => ({ default: m.DashboardDoiMoiPage })));
const QuanLyYTuongDMSTPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/quan-ly-y-tuong/QuanLyYTuongDMSTPage').then(m => ({ default: m.QuanLyYTuongDMSTPage })));
const ChiTietYTuongPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/quan-ly-y-tuong/ChiTietYTuongPage').then(m => ({ default: m.ChiTietYTuongPage })));
const QuyTrinhDuyetPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/quy-trinh-duyet/QuyTrinhDuyetPage').then(m => ({ default: m.QuyTrinhDuyetPage })));
const SoDoQuyTrinhPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/quy-trinh-duyet/SoDoQuyTrinhPage').then(m => ({ default: m.SoDoQuyTrinhPage })));
const ThongBaoDMSTPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/thong-bao/ThongBaoDMSTPage').then(m => ({ default: m.ThongBaoDMSTPage })));
const KhoTriThucPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/kho-tri-thuc/KhoTriThucPage').then(m => ({ default: m.KhoTriThucPage })));
const ThuVienTaiLieuPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/kho-tri-thuc/thu-vien/ThuVienTaiLieuPage').then(m => ({ default: m.ThuVienTaiLieuPage })));
const DanhBaChuyenGiaPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/kho-tri-thuc/chuyen-gia/DanhBaChuyenGiaPage').then(m => ({ default: m.DanhBaChuyenGiaPage })));
const CongDongPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/kho-tri-thuc/cong-dong/CongDongPage').then(m => ({ default: m.CongDongPage })));
const NewsFeedPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/kho-tri-thuc/news-feed/NewsFeedPage').then(m => ({ default: m.NewsFeedPage })));
const NewsFeedV2Page = lazy(() => import('@/app/pages/doi-moi-sang-tao/kho-tri-thuc/news-feed-v2/NewsFeedV2Page').then(m => ({ default: m.NewsFeedV2Page })));
const NewsFeedAdminPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/kho-tri-thuc/news-feed/NewsFeedAdminPage').then(m => ({ default: m.NewsFeedAdminPage })));
const TimKiemPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/kho-tri-thuc/tim-kiem/TimKiemPage').then(m => ({ default: m.TimKiemPage })));
const KTAnalyticsPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/kho-tri-thuc/analytics/KTAnalyticsPage').then(m => ({ default: m.KTAnalyticsPage })));
const KTBaoCaoPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/kho-tri-thuc/bao-cao/KTBaoCaoPage').then(m => ({ default: m.KTBaoCaoPage })));
const BaoCaoPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/bao-cao/BaoCaoPage').then(m => ({ default: m.BaoCaoPage })));
const BaoCaoDayDuPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/bao-cao/BaoCaoDayDuPage').then(m => ({ default: m.BaoCaoDayDuPage })));
const QuanLyNguoiDungPage = lazy(() => import('@/app/pages/doi-moi-sang-tao/quan-ly-nguoi-dung/QuanLyNguoiDungPage').then(m => ({ default: m.QuanLyNguoiDungPage })));

/** Chỉ cho reviewer/admin qua, member → redirect dashboard */
const ReviewerRoute: FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isReviewer } = useDMSTRole();
  return isReviewer ? element : <Navigate to="/doi-moi-sang-tao/dashboard" replace />;
};

/** Chỉ cho admin qua, member/reviewer → redirect dashboard */
const AdminRoute: FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAdmin } = useDMSTRole();
  return isAdmin ? element : <Navigate to="/doi-moi-sang-tao/dashboard" replace />;
};

/** Form tạo/sửa ý tưởng dùng chung form portal /doi-moi/y-tuong (thống nhất một form duy nhất) */
const RedirectToPortalEdit: FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/doi-moi/y-tuong?ideaId=${id}`} replace />;
};

export const DoiMoiSangTaoRoutes: FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />

      {/* Dashboard */}
      <Route path="dashboard" element={<DashboardDoiMoiPage />} />

      {/* Quản lý ý tưởng */}
      <Route path="quan-ly-y-tuong/danh-sach" element={<ReviewerRoute element={<QuanLyYTuongDMSTPage />} />} />
      <Route path="quan-ly-y-tuong/cua-toi"   element={<QuanLyYTuongDMSTPage myIdeasOnly />} />
      {/* Tạo/sửa ý tưởng: dùng chung form portal /doi-moi/y-tuong */}
      <Route path="quan-ly-y-tuong/tao-moi"   element={<Navigate to="/doi-moi/y-tuong" replace />} />
      <Route path="quan-ly-y-tuong/chi-tiet/:id"  element={<ChiTietYTuongPage />} />
      <Route path="quan-ly-y-tuong/chinh-sua/:id" element={<RedirectToPortalEdit />} />
      <Route path="quan-ly-y-tuong" element={<Navigate to="quan-ly-y-tuong/danh-sach" replace />} />

      {/* Sơ đồ quy trình — thông tin, tất cả roles đều xem được */}
      <Route path="quy-trinh-duyet/so-do" element={<SoDoQuyTrinhPage />} />

      {/* Quy trình duyệt — reviewer + admin only */}
      <Route path="quy-trinh-duyet/cho-duyet" element={<ReviewerRoute element={<QuyTrinhDuyetPage mode="cho-duyet" />} />} />
      <Route path="quy-trinh-duyet/da-duyet"  element={<ReviewerRoute element={<QuyTrinhDuyetPage mode="da-duyet" />} />} />
      <Route path="quy-trinh-duyet/tu-choi"   element={<ReviewerRoute element={<QuyTrinhDuyetPage mode="tu-choi" />} />} />
      <Route path="quy-trinh-duyet" element={<ReviewerRoute element={<Navigate to="quy-trinh-duyet/cho-duyet" replace />} />} />

      {/* Thông báo */}
      <Route path="thong-bao" element={<ThongBaoDMSTPage />} />

      {/* Kho tri thức — shell + sub-routes */}
      <Route path="kho-tri-thuc" element={<KhoTriThucPage />}>
        <Route path="analytics"  element={<KTAnalyticsPage />} />
        <Route path="thu-vien"   element={<ThuVienTaiLieuPage />} />
        <Route path="chuyen-gia" element={<DanhBaChuyenGiaPage />} />
        <Route path="cong-dong"  element={<CongDongPage />} />
        <Route path="news-feed"    element={<NewsFeedPage />} />
        <Route path="news-feed-v2" element={<NewsFeedV2Page />} />
        {/* Quản trị News Feed: trọng số thuật toán + dashboard hiệu quả — admin only */}
        <Route path="news-feed-admin" element={<AdminRoute element={<NewsFeedAdminPage />} />} />
        <Route path="tim-kiem"   element={<TimKiemPage />} />
        <Route path="bao-cao"    element={<ReviewerRoute element={<KTBaoCaoPage />} />} />
      </Route>

      {/* Báo cáo — reviewer + admin only */}
      <Route path="bao-cao" element={<ReviewerRoute element={<BaoCaoPage />} />} />
      {/* Báo cáo tổng hợp đầy đủ IV.1–IV.19 (trang minh họa) — reviewer + admin only */}
      <Route path="bao-cao-day-du" element={<ReviewerRoute element={<BaoCaoDayDuPage />} />} />

      {/* Quản lý người dùng — admin only */}
      <Route path="quan-ly-nguoi-dung" element={<AdminRoute element={<QuanLyNguoiDungPage />} />} />

      <Route path="*" element={<Navigate to="/error/404" replace />} />
    </Routes>
  );
};
