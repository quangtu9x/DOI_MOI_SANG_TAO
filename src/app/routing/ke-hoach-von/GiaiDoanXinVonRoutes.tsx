import { useAuth } from "@/app/modules/auth";
import { BangDinhMucPage, BangChiPhiPage, KeHoachPage, KeHoachChoDuyetPage } from "@/app/pages/ke-hoach-von/giai-doan-xin-von";

import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";

export const GiaiDoanXinVonRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="bang-dinh-muc" replace />}
                />

                <Route
                    path="bang-dinh-muc"
                    element={<BangDinhMucPage />}
                />

                <Route
                    path="khung-chi-phi"
                    element={<BangChiPhiPage />}
                />

                <Route
                    path="ke-hoach"
                    element={<KeHoachPage />}
                />
                <Route
                    path="ke-hoach-cho-duyet"
                    element={<KeHoachChoDuyetPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};
