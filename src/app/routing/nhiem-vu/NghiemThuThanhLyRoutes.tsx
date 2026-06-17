

import { useAuth } from "@/app/modules/auth";
import {
    BienBanNghiemThuPage,
    GiayChungNhanPage,
    HDNTChinhThucPage,
    HDNTCoSoPage,
    TraCuuHDNTCoSoPage,
    HoSoNghiemThuPage,
    TraCuuHoSoNghiemThuPage,
    KQDGChinhThucPage,
    KQDGCoSoPage,
    SanPhamNghiemThuPage,
    ThamDinhSauNghiemThuPage
} from "@/app/pages/nhiem-vu/nghiem-thu-thanh-ly";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const NghiemThuThanhLyRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                {userType === UserType.Specialist ? (
                    <Route
                        index
                        element={<Navigate to="kqdg-co-so" replace />}
                    />
                ) : (<Route
                    index
                    element={<Navigate to="san-pham-nghiem-thu" replace />}
                />)}


                <Route
                    path="san-pham-nghiem-thu"
                    element={<SanPhamNghiemThuPage />}
                />

                <Route
                    path="hdnt-co-so"
                    element={<HDNTCoSoPage />}
                />
                <Route
                    path="tra-cuu-hdnt-co-so"
                    element={<TraCuuHDNTCoSoPage />}
                />
                <Route
                    path="hdnt-chinh-thuc"
                    element={<HDNTChinhThucPage />}
                />

                <Route
                    path="kqdg-co-so"
                    element={<KQDGCoSoPage />}
                />

                <Route
                    path="kqdg-chinh-thuc"
                    element={<KQDGChinhThucPage />}
                />

                <Route
                    path="bbnt-co-so"
                    element={<BienBanNghiemThuPage />}
                />

                <Route
                    path="td-sau-nghiem-thu"
                    element={<ThamDinhSauNghiemThuPage />}
                />

                <Route
                    path="hsnt-chinh-thuc"
                    element={<HoSoNghiemThuPage />}
                />
                <Route
                    path="tra-cuu-hsnt-chinh-thuc"
                    element={<TraCuuHoSoNghiemThuPage />}
                />

                <Route
                    path="giay-chung-nhan"
                    element={<GiayChungNhanPage />}
                />

                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};
