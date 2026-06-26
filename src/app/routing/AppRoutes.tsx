import { FC, lazy } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { PrivateRoutes } from './PrivateRoutes';
import { ErrorsPage } from '../modules/errors/ErrorsPage';
import { Logout, AuthPage, useAuth } from '../modules/auth';
import { App } from '../App';
import { PortalRoutes } from './PortalRoutes';

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const { BASE_URL } = import.meta.env;

const AppRoutes: FC = () => {
  const { currentUser } = useAuth();
  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path="error/*" element={<ErrorsPage />} />
          <Route path="logout" element={<Logout />} />
          <Route path="doi-moi/*" element={<PortalRoutes />} />
          {currentUser ? (
            <>
              <Route path="/*" element={<PrivateRoutes />} />
              <Route path="auth/*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="auth/*" element={<AuthPage />} />
            </>
          )}
          <Route index element={<Navigate to="/doi-moi/trang-chu" />} />
          <Route path="*" element={<Navigate to="/doi-moi/trang-chu" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export { AppRoutes };
