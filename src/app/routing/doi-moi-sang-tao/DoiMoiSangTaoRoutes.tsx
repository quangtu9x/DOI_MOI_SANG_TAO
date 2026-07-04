import { FC } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { DashboardDoiMoiPage } from '@/app/pages/doi-moi-sang-tao/dashboard/DashboardDoiMoiPage';
import { QuanLyYTuongDMSTPage } from '@/app/pages/doi-moi-sang-tao/quan-ly-y-tuong/QuanLyYTuongDMSTPage';
import { ChiTietYTuongPage } from '@/app/pages/doi-moi-sang-tao/quan-ly-y-tuong/ChiTietYTuongPage';
import { QuyTrinhDuyetPage } from '@/app/pages/doi-moi-sang-tao/quy-trinh-duyet/QuyTrinhDuyetPage';
import { ThongBaoDMSTPage } from '@/app/pages/doi-moi-sang-tao/thong-bao/ThongBaoDMSTPage';
import { KhoTriThucPage } from '@/app/pages/doi-moi-sang-tao/kho-tri-thuc/KhoTriThucPage';
import { ThuVienTaiLieuPage } from '@/app/pages/doi-moi-sang-tao/kho-tri-thuc/thu-vien/ThuVienTaiLieuPage';
import { DanhBaChuyenGiaPage } from '@/app/pages/doi-moi-sang-tao/kho-tri-thuc/chuyen-gia/DanhBaChuyenGiaPage';
import { CongDongPage } from '@/app/pages/doi-moi-sang-tao/kho-tri-thuc/cong-dong/CongDongPage';
import { NewsFeedPage } from '@/app/pages/doi-moi-sang-tao/kho-tri-thuc/news-feed/NewsFeedPage';
import { TimKiemPage } from '@/app/pages/doi-moi-sang-tao/kho-tri-thuc/tim-kiem/TimKiemPage';
import { KTAnalyticsPage } from '@/app/pages/doi-moi-sang-tao/kho-tri-thuc/analytics/KTAnalyticsPage';
import { KTBaoCaoPage } from '@/app/pages/doi-moi-sang-tao/kho-tri-thuc/bao-cao/KTBaoCaoPage';
import { BaoCaoPage } from '@/app/pages/doi-moi-sang-tao/bao-cao/BaoCaoPage';
import { QuanLyNguoiDungPage } from '@/app/pages/doi-moi-sang-tao/quan-ly-nguoi-dung/QuanLyNguoiDungPage';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

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
        <Route path="news-feed"  element={<NewsFeedPage />} />
        <Route path="tim-kiem"   element={<TimKiemPage />} />
        <Route path="bao-cao"    element={<ReviewerRoute element={<KTBaoCaoPage />} />} />
      </Route>

      {/* Báo cáo — reviewer + admin only */}
      <Route path="bao-cao" element={<ReviewerRoute element={<BaoCaoPage />} />} />

      {/* Quản lý người dùng — admin only */}
      <Route path="quan-ly-nguoi-dung" element={<AdminRoute element={<QuanLyNguoiDungPage />} />} />

      <Route path="*" element={<Navigate to="/error/404" replace />} />
    </Routes>
  );
};
