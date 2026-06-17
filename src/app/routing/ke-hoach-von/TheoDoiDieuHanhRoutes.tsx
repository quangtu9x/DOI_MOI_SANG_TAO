import { useAuth } from "@/app/modules/auth";
import {
    TheoDoiDieuHanhDuAnPage,
    TheoDoiTinhHinhThucHienDuAnPage,
    TheoDoiTinhHinhKhoKhanVuongMacDuAnPage,
    TheoDoiTinhHinhNghiemThuHoanThanhDuAnPage,
    ThongBaoCapNhatXuLyChoBuocThucHienDuAnPage
} from "@/app/pages/ke-hoach-von/theo-doi-dieu-hanh";
import { NotificationContentPage } from "@/app/pages/admins/notifications";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";

export const TheoDoiDieuHanhRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<TheoDoiDieuHanhDuAnPage />}
                />
                <Route
                    path="theo-doi-tinh-hinh-thuc-hien-du-an"
                    element={<TheoDoiTinhHinhThucHienDuAnPage />}
                />
                <Route
                    path="theo-doi-tinh-hinh-kho-khan-vuong-mac-du-an"
                    element={<TheoDoiTinhHinhKhoKhanVuongMacDuAnPage />}
                />
                <Route
                    path="theo-doi-tinh-hinh-nghiem-thu-hoan-thanh-du-an"
                    element={<TheoDoiTinhHinhNghiemThuHoanThanhDuAnPage />}
                />
                <Route
                    path="quan-ly-noi-dung-thong-bao"
                    element={<NotificationContentPage />}
                />
                <Route
                    path="thong-bao-cap-nhat-xu-ly-cho-buoc-thuc-hien-du-an"
                    element={<ThongBaoCapNhatXuLyChoBuocThucHienDuAnPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};
