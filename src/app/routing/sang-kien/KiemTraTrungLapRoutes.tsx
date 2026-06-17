
import { useAuth } from "@/app/modules/auth";
import { KiemTraTrungLapPage } from "@/app/pages/sang-kien/kiem-tra-trung-lap/KiemTraTrungLapPage";
import { ThongKeBaoCaoPage } from "@/app/pages/sang-kien/thong-ke-bao-cao/ThongKeBaoCaoPage";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const KiemTraTrungLapRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="kiem-tra-trung-lap" replace />}
                />


                <Route
                    path="kiem-tra-trung-lap"
                    element={<KiemTraTrungLapPage />}
                />

                <Route
                    path="thong-ke-bao-cao"
                    element={<ThongKeBaoCaoPage />}
                />

                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

