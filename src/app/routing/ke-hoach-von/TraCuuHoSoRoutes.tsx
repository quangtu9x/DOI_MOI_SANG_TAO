import { useAuth } from "@/app/modules/auth";
import {
    TraCuuHoSoDuAnPage,
    DanhSachDuAnPage,
    XemThongTinBuocThucHienGiaiDoanChuanBiDauTuPage,
    XemThongTinBuocThucHienGiaiDoanThucHienDauTuPage,
    XemThongTinBuocThucHienGiaiDoanKetThucDauTuPage
} from "@/app/pages/ke-hoach-von/tra-cuu-ho-so";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";

export const TraCuuHoSoRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="danh-sach-du-an" replace />}
                />
                <Route
                    path="danh-sach-du-an"
                    element={<DanhSachDuAnPage />}
                />
                <Route
                    path="xem-thong-tin-buoc-thuc-hien-giai-doan-chuan-bi-dau-tu"
                    element={<XemThongTinBuocThucHienGiaiDoanChuanBiDauTuPage />}
                />
                <Route
                    path="xem-thong-tin-buoc-thuc-hien-giai-doan-thuc-hien-dau-tu"
                    element={<XemThongTinBuocThucHienGiaiDoanThucHienDauTuPage />}
                />
                <Route
                    path="xem-thong-tin-buoc-thuc-hien-giai-doan-ket-thuc-dau-tu"
                    element={<XemThongTinBuocThucHienGiaiDoanKetThucDauTuPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};
