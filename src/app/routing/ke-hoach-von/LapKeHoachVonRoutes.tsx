import { useAuth } from "@/app/modules/auth";
import {
    LapKeHoachVonHangNamPage,
    PhanBoVonKeHoachHangNamPage
} from "@/app/pages/ke-hoach-von/lap-ke-hoach-von";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";

export const LapKeHoachVonRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="lap-ke-hoach-von-hang-nam" replace />}
                />

                <Route
                    path="lap-ke-hoach-von-hang-nam"
                    element={<LapKeHoachVonHangNamPage />}
                />
                <Route
                    path="phan-bo-von-ke-hoach-hang-nam"
                    element={<PhanBoVonKeHoachHangNamPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};
