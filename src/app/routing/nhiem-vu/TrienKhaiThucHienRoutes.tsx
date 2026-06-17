

import {
    BaoCaoGiaiNganPage,
    BaoCaoTienDoPage,
    DieuChinhHopDongPage,
    KeHoachHopDongPage,
    KiemTraDinhKyPage,
    NghiemThuKhoiLuongPage
} from "@/app/pages/nhiem-vu/trien-khai-thuc-hien";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const TrienKhaiThucHienRoutes = () => {
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="bao-cao-tien-do" replace />}
                />

                <Route
                    path="bao-cao-tien-do"
                    element={<BaoCaoTienDoPage />}
                />

                <Route
                    path="bao-cao-giai-ngan"
                    element={<BaoCaoGiaiNganPage />}
                />
                <Route
                    path="ke-hoach-hop-dong"
                    element={<KeHoachHopDongPage />}
                />
                <Route
                    path="dieu-chinh-hop-dong"
                    element={<DieuChinhHopDongPage />}
                />
                <Route
                    path="kiem-tra-dinh-ky"
                    element={<KiemTraDinhKyPage />}
                />
                <Route
                    path="nghiem-thu-khoi-luong"
                    element={<NghiemThuKhoiLuongPage />}
                />

                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

