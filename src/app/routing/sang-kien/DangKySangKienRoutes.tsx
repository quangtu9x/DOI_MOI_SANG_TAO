
import { useAuth } from "@/app/modules/auth";
import {
    DangKySangKienPage,
    DotXetSangKienPage,
    HoSoSangKienPage,
} from "@/app/pages/sang-kien/dang-ky-sang-kien";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const DangKySangKienRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                {userType === UserType.Admin ? (
                    <Route
                        index
                        element={<Navigate to="dot-xet-sang-kien" replace />}
                    />
                ) : (
                    <Route
                        index
                        element={<Navigate to="don-dang-ky" replace />}
                    />
                )}


                <Route
                    path="dot-xet-sang-kien"
                    element={<DotXetSangKienPage />}
                />


                <Route
                    path="don-dang-ky"
                    element={<DangKySangKienPage />}
                />

                <Route
                    path="ho-so-dang-ky"
                    element={<HoSoSangKienPage />}
                />

                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

