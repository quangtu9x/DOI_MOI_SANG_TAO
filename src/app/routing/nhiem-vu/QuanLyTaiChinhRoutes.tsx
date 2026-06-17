import { lazy } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

const PhieuDeNghiTamUngPage = lazy(() =>
  import('@/app/pages/nhiem-vu/quan-ly-tai-chinh/PhieuDeNghiTamUng/PhieuDeNghiTamUngPage').then(module => ({
    default: module.PhieuDeNghiTamUngPage,
  }))
);
const PhieuDeNghiThanhToanPage = lazy(() =>
  import('@/app/pages/nhiem-vu/quan-ly-tai-chinh/PhieuDeNghiThanhToan/PhieuDeNghiThanhToanPage').then(module => ({
    default: module.PhieuDeNghiThanhToanPage,
  }))
);
const TraCuuPhieuDeNghiThanhToanPage = lazy(() =>
  import('@/app/pages/nhiem-vu/quan-ly-tai-chinh/PhieuDeNghiThanhToan/TraCuuPhieuDeNghiThanhToanPage').then(module => ({
    default: module.TraCuuPhieuDeNghiThanhToanPage,
  }))
);
const ThongTinDaTamUngPage = lazy(() =>
  import('@/app/pages/nhiem-vu/quan-ly-tai-chinh/ThongTinDaTamUng/ThongTinDaTamUngPage').then(module => ({
    default: module.ThongTinDaTamUngPage,
  }))
);
const ThongTinDaThanhToanPage = lazy(() =>
  import('@/app/pages/nhiem-vu/quan-ly-tai-chinh/ThongTinDaThanhToan/ThongTinDaThanhToanPage').then(module => ({
    default: module.ThongTinDaThanhToanPage,
  }))
);

const QuanLyTaiChinhRoutes = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to="phieu-de-nghi-tam-ung" replace />} />

        <Route path="phieu-de-nghi-tam-ung" element={<PhieuDeNghiTamUngPage />} />
        <Route path="phieu-de-nghi-thanh-toan" element={<PhieuDeNghiThanhToanPage />} />
        <Route path="tra-cuu-phieu-de-nghi-thanh-toan" element={<TraCuuPhieuDeNghiThanhToanPage />} />
        <Route path="thong-tin-da-tam-ung" element={<ThongTinDaTamUngPage />} />
        <Route path="thong-tin-da-thanh-toan" element={<ThongTinDaThanhToanPage />} />

        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>
    </Routes>
  );
};

export default QuanLyTaiChinhRoutes;
