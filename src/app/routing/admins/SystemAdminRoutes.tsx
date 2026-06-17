
import {
    AuditPage,
    LoginLogPage,
    OrganizationUnitPage,
    PermissionPage,
    PositionPage,
    RolePage,
    UserPage
} from "@/app/pages/admins/system-admins";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const SystemAdminRoutes = () => {
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="organization-units" replace />}
                />
                <Route
                    path="audits"
                    element={<AuditPage />}
                />
                <Route
                    path="login-logs"
                    element={<LoginLogPage />}
                />

                <Route
                    path="organization-units"
                    element={<OrganizationUnitPage />}
                />
                {/* <Route
                    path="organization-unit-types"
                    element={<OrganizationUnitTypePage />}
                /> */}
                <Route
                    path="positions"
                    element={<PositionPage />}
                />
                <Route
                    path="users"
                    element={<UserPage />}
                />
                <Route
                    path="roles"
                    element={<RolePage />}
                />
                <Route
                    path="permissions"
                    element={<PermissionPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

