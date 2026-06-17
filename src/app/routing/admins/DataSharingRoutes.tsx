
import { DataSharingPage, NhiemVuKhoaHocPage } from "@/app/pages/admins/data-sharings";
import { DuAnCNTTPage } from "@/app/pages/admins/data-sharings/DuAnCNTTPage";
import { SangKienKhoaHocPage } from "@/app/pages/admins/data-sharings/SangKienKhoaHocPage";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const DataSharingRoutes = () => {
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="manage" replace />}
                />
                <Route
                    path="manage"
                    element={<DataSharingPage />}
                />
                <Route
                    path="nhiem-vu-khoa-hoc"
                    element={<NhiemVuKhoaHocPage />}
                />
                <Route
                    path="sang-kien-khoa-hoc"
                    element={<SangKienKhoaHocPage />}
                />
                <Route
                    path="du-an-cntt"
                    element={<DuAnCNTTPage />}
                />

                <Route path="*" element={<Navigate to="/error/404/system" replace />} />

            </Route>
        </Routes>
    );
};

