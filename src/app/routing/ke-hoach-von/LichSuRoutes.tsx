import { useAuth } from "@/app/modules/auth";
import {
    LichSuCapNhatThongTinDuAnPage,
    LichSuCapNhatDuLieuNguoiDungPage,
    LichSuSuDungHeThongPage
} from "@/app/pages/ke-hoach-von/lich-su";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";

export const LichSuRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="lich-su-cap-nhat-thong-tin-du-an" replace />}
                />

                <Route
                    path="lich-su-cap-nhat-thong-tin-du-an"
                    element={<LichSuCapNhatThongTinDuAnPage />}
                />
                <Route
                    path="lich-su-cap-nhat-du-lieu-nguoi-dung"
                    element={<LichSuCapNhatDuLieuNguoiDungPage />}
                />
                <Route
                    path="lich-su-su-dung-he-thong"
                    element={<LichSuSuDungHeThongPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};
