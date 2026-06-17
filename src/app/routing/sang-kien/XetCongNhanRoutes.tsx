
import { useAuth } from "@/app/modules/auth";
import { DanhGiaSangKienPage, GiayChungNhanSangKienPage, HoiDongSangKienPage, KetQuaSangKienPage } from "@/app/pages/sang-kien/xet-cong-nhan";

import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const XetCongNhanRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                {userType === UserType.Admin ? (
                    <Route
                        index
                        element={<Navigate to="hoi-dong-sang-kien" replace />}
                    />
                ) : userType === UserType.Specialist ? (
                    <Route
                        index
                        element={<Navigate to="danh-gia-sang-kien" replace />}
                    />
                ) :
                    (
                        <></>
                    )}


                <Route
                    path="hoi-dong-sang-kien"
                    element={<HoiDongSangKienPage />}
                />

                <Route
                    path="danh-gia-sang-kien"
                    element={<DanhGiaSangKienPage />}
                />

                <Route
                    path="ket-qua-sang-kien"
                    element={<KetQuaSangKienPage />}
                />

                <Route
                    path="giay-chung-nhan-sang-kien"
                    element={<GiayChungNhanSangKienPage />}
                />

                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

