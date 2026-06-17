
import { useAuth } from "@/app/modules/auth";
import {
    DonViPhoiHopPage,
    DuToanKinhPhiPage,
    HoiDongThamDinhPage,
    HopDongTrienKhaiPage,
    KQTDKinhPhiPage,
    KQTDNoiDungPage,
    NoiDungPage,
    QuyetDinhTrienKhaiPage,
    TraCuuHopDongTrienKhaiPage
} from "@/app/pages/nhiem-vu/thuc-hien-nhiem-vu";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const ThucHienNhiemVuRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                {userType === UserType.Specialist ? (
                    <Route
                        index
                        element={<Navigate to="noi-dung" replace />}
                    />
                ) : (
                    <Route
                        index
                        element={<Navigate to="don-vi-phoi-hop" replace />}
                    />
                )}


                <Route
                    path="don-vi-phoi-hop"
                    element={<DonViPhoiHopPage />}
                />

                <Route
                    path="noi-dung"
                    element={<NoiDungPage />}
                />

                <Route
                    path="du-toan-kinh-phi"
                    element={<DuToanKinhPhiPage />}
                />
                <Route
                    path="hoi-dong-tham-dinh"
                    element={<HoiDongThamDinhPage />}
                />

                <Route
                    path="kqtd-noi-dung"
                    element={<KQTDNoiDungPage />}
                />
                <Route
                    path="kqtd-kinh-phi"
                    element={<KQTDKinhPhiPage />}
                />
                <Route
                    path="quyet-dinh-trien-khai"
                    element={<QuyetDinhTrienKhaiPage />}
                />
                <Route
                    path="hop-dong-trien-khai"
                    element={<HopDongTrienKhaiPage />}
                />
                <Route
                    path="tra-cuu-hop-dong-trien-khai"
                    element={<TraCuuHopDongTrienKhaiPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

