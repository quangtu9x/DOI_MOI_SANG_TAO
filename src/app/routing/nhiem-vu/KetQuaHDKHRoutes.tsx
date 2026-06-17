import {
  PhieuDangKyCapGCNKetQuaThucHienPage,
  TraCuuPhieuDangKyCapGCNKetQuaThucHienPage,
  QuyetDinhPhamViChuyenGiaoPage,
  SanPhamKhoaHocPage,
  ThongTinChuyenGiaoPage,
} from '@/app/pages/nhiem-vu/ket-qua-hdkh';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

const KetQuaHDKHRoutes = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to="thong-tin-chuyen-giao" replace />} />

        <Route path="thong-tin-chuyen-giao" element={<ThongTinChuyenGiaoPage />} />
        <Route path="quyet-dinh-pham-vi-chuyen-giao" element={<QuyetDinhPhamViChuyenGiaoPage />} />
        <Route path="san-pham-khoa-hoc" element={<SanPhamKhoaHocPage />} />
        <Route path="phieu-dang-ky-cap-gcn-ket-qua-thuc-hien" element={<PhieuDangKyCapGCNKetQuaThucHienPage />} />
        <Route path="tra-cuu-phieu-dang-ky-cap-gcn-ket-qua-thuc-hien" element={<TraCuuPhieuDangKyCapGCNKetQuaThucHienPage />} />

        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>
    </Routes>
  );
};

export default KetQuaHDKHRoutes;
