import { FC, Suspense, lazy, type ReactNode } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { Logout, useAuth } from '../modules/auth';
import { App } from '../App';

const PrivateRoutes = lazy(() => import('./PrivateRoutes').then(m => ({ default: m.PrivateRoutes })));
const ErrorsPage = lazy(() => import('../modules/errors/ErrorsPage').then(m => ({ default: m.ErrorsPage })));
const AuthPage = lazy(() => import('../modules/auth').then(m => ({ default: m.AuthPage })));
const PortalRoutes = lazy(() => import('./PortalRoutes').then(m => ({ default: m.PortalRoutes })));

const withSuspense = (node: ReactNode) => (
  <Suspense fallback={<div className="d-flex align-items-center justify-content-center py-10">Loading...</div>}>
    {node}
  </Suspense>
);

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const { BASE_URL } = import.meta.env;

const AppRoutes: FC = () => {
  const { auth, currentUser } = useAuth();
  const canAccessPrivate = !!(auth?.token || currentUser);
  const hasActiveUser = !!currentUser;
  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path="error/*" element={withSuspense(<ErrorsPage />)} />
          <Route path="logout" element={<Logout />} />
          <Route path="doi-moi/*" element={withSuspense(<PortalRoutes />)} />
          {canAccessPrivate && <Route path="/*" element={withSuspense(<PrivateRoutes />)} />}
          <Route path="auth/*" element={hasActiveUser ? <Navigate to="/" /> : withSuspense(<AuthPage />)} />
          <Route index element={<Navigate to="/doi-moi/trang-chu" />} />
          <Route path="*" element={<Navigate to="/doi-moi/trang-chu" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export { AppRoutes };
