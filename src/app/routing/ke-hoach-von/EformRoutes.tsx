import { useAuth } from '@/app/modules/auth';
import { QLEformPage } from '@/app/pages/ke-hoach-von/eform/ql-eform/QLEformPage';
import { ThietKePage } from '@/app/pages/ke-hoach-von/eform/thiet-ke/ThietKePage';
import { UserType } from '@/models';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

export const EformRoutes = () => {
  const { currentUser } = useAuth();
  const userType = currentUser?.type;
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="ql-mau-eform" element={<QLEformPage />} />
        <Route path="thiet-ke" element={<ThietKePage />} />

        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>
    </Routes>
  );
};
