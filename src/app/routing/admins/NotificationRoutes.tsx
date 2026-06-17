import {
    NotificationContentPage
} from "@/app/pages/admins/notifications";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";

export const NotificationRoutes = () => {
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="notification-contents" replace />}
                />

                <Route
                    path="notification-contents"
                    element={<NotificationContentPage />}
                />

                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};
