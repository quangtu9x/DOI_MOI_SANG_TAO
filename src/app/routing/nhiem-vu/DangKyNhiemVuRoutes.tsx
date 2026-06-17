
import { useAuth } from "@/app/modules/auth";
import {
    DangKyChuTriPage,
    DatHangNhiemVuPage,
    DeXuatDeTaiPage,
    DotDangKyPage,
    HoiDongTuVanPage,
    KetQuaTuVanPage,
    PheDuyetDeXuatDeTaiPage,
    ThuyetMinhKHCNPage,
    ThuyetMinhSXTNPage,
    ThuyetMinhXHNVPage,
    TraCuuDeXuatDeTaiPage,
    TraCuuDotDangKyPage,
    XuLyDatHangPage
} from "@/app/pages/nhiem-vu/dang-ky-nhiem-vu";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const DangKyNhiemVuRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                {userType === UserType.Admin ? (
                    <Route
                        index
                        element={<Navigate to="dot-dang-ky" replace />}
                    />
                ) : (
                    <Route
                        index
                        element={<Navigate to="tra-cuu-dot-dang-ky" replace />}
                    />
                )}


                <Route
                    path="dot-dang-ky"
                    element={<DotDangKyPage />}
                />
                <Route
                    path="tra-cuu-dot-dang-ky"
                    element={<TraCuuDotDangKyPage />}
                />
                <Route
                    path="dat-hang-nhiem-vu"
                    element={<DatHangNhiemVuPage />}
                />
                <Route
                    path="xu-ly-dat-hang"
                    element={<XuLyDatHangPage />}
                />
                <Route
                    path="de-xuat-de-tai"
                    element={<DeXuatDeTaiPage />}
                />
                <Route
                    path="tra-cuu-de-xuat-de-tai"
                    element={<TraCuuDeXuatDeTaiPage />}
                />
                <Route
                    path="phe-duyet-de-xuat-de-tai"
                    element={<PheDuyetDeXuatDeTaiPage />}
                />
                <Route
                    path="hoi-dong-tu-van"
                    element={<HoiDongTuVanPage />}
                />
                <Route
                    path="ket-qua-tu-van"
                    element={<KetQuaTuVanPage />}
                />
                <Route
                    path="dang-ky-chu-tri"
                    element={<DangKyChuTriPage />}
                />
                <Route
                    path="thuyet-minh-khcn"
                    element={<ThuyetMinhKHCNPage />}
                />
                <Route
                    path="thuyet-minh-xhnv"
                    element={<ThuyetMinhXHNVPage />}
                />
                <Route
                    path="thuyet-minh-sxtn"
                    element={<ThuyetMinhSXTNPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

