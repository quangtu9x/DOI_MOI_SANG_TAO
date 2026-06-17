import { useAuth } from "@/app/modules/auth";
import {
    DanhMucCoQuanDonViPage,
    DanhMucChuDauTuPage,
    DanhMucTinhThanhPhoPage,
    DanhMucPhuongXaPage,
    DanhMucNhaThauPage,
    DanhMucNguonVonDauTuPage,
    DanhMucLoaiDuAnPage,
    DanhMucNhomDuAnPage
} from "@/app/pages/ke-hoach-von/danh-muc";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";

export const DanhMucRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="co-quan-don-vi" replace />}
                />

                <Route
                    path="co-quan-don-vi"
                    element={<DanhMucCoQuanDonViPage />}
                />
                <Route
                    path="chu-dau-tu"
                    element={<DanhMucChuDauTuPage />}
                />
                <Route
                    path="tinh-thanh-pho"
                    element={<DanhMucTinhThanhPhoPage />}
                />
                <Route
                    path="phuong-xa"
                    element={<DanhMucPhuongXaPage />}
                />
                <Route
                    path="nha-thau"
                    element={<DanhMucNhaThauPage />}
                />
                <Route
                    path="nguon-von-dau-tu"
                    element={<DanhMucNguonVonDauTuPage />}
                />
                <Route
                    path="loai-du-an"
                    element={<DanhMucLoaiDuAnPage />}
                />
                <Route
                    path="nhom-du-an"
                    element={<DanhMucNhomDuAnPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};
