
import { useAuth } from "@/app/modules/auth";
import {
    BienBanKiemPhieuPage,
    BienBanMoHoSoPage,
    DanhGiaKHCNPage,
    DanhGiaXHNVPage,
    HoiDongTuyenChonPage,
    HopDongKhoaHocPage,
    KetQuaXetChonPage,
    NhanXetKHCNPage,
    NhanXetXHNVPage,
    QuyetDinhPheDuyetPage,
    RaSoatKHCNPage,
    RaSoatXHNVPage,
    ToTrinhPheDuyetPage,
    TuDanhGiaPage
} from "@/app/pages/nhiem-vu/xet-duyet-chu-nhiem";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const XetDuyetChuNhiemRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                {userType === UserType.Admin ? (
                    <Route
                        index
                        element={<Navigate to="bien-ban-mo-ho-so" replace />}
                    />) : userType == UserType.Specialist ? (
                        <Route
                            index
                            element={<Navigate to="danh-gia-khcn" replace />}
                        />
                    ) : (
                    <Route
                        index
                        element={<Navigate to="ra-soat-khcn" replace />}
                    />
                )}



                <Route
                    path="bien-ban-mo-ho-so"
                    element={<BienBanMoHoSoPage />}
                />

                <Route
                    path="hoi-dong-tuyen-chon"
                    element={<HoiDongTuyenChonPage />}
                />

                <Route
                    path="danh-gia-khcn"
                    element={<DanhGiaKHCNPage />}
                />

                <Route
                    path="danh-gia-xhnv"
                    element={<DanhGiaXHNVPage />}
                />

                <Route
                    path="nhan-xet-khcn"
                    element={<NhanXetKHCNPage />}
                />

                <Route
                    path="nhan-xet-xhnv"
                    element={<NhanXetXHNVPage />}
                />

                <Route
                    path="ra-soat-khcn"
                    element={<RaSoatKHCNPage />}
                />

                <Route
                    path="ra-soat-xhnv"
                    element={<RaSoatXHNVPage />}
                />

                <Route
                    path="bien-ban-kiem-phieu"
                    element={<BienBanKiemPhieuPage />}
                />

                <Route
                    path="ket-qua-xet-chon"
                    element={<KetQuaXetChonPage />}
                />

                <Route
                    path="tu-danh-gia"
                    element={<TuDanhGiaPage />}
                />

                <Route
                    path="to-trinh-phe-duyet"
                    element={<ToTrinhPheDuyetPage />}
                />

                <Route
                    path="quyet-dinh-phe-duyet"
                    element={<QuyetDinhPheDuyetPage />}
                />
                <Route
                    path="hop-dong-khoa-hoc"
                    element={<HopDongKhoaHocPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

