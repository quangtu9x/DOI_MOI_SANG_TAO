
import { useAuth } from "@/app/modules/auth";
import {
    TiepNhanHoSoPage,
    TongHopHoSoPage,
} from "@/app/pages/sang-kien/tiep-nhan-xu-ly";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const TiepNhanXuLyRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="tiep-nhan-ho-so" replace />}
                />


                <Route
                    path="tiep-nhan-ho-so"
                    element={<TiepNhanHoSoPage />}
                />


                <Route
                    path="tong-hop-ho-so"
                    element={<TongHopHoSoPage />}
                />


                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

