import { FC, lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import {
  HomePage,
  NopDuAnCNTTPage,
  NopNhiemVuPage,
  NopSangKienPage,
  NopYTuongPage,
  ProfilePage,
} from '../pages/portal';

const PortalRoutes = () => {
  const PortalLayout = lazy(() =>
    import('@/_metronic/layout/PortalLayout').then(module => ({ default: module.PortalLayout }))
  );

  return (
    <Routes>
      <Route element={
        <Suspense fallback={
          <div id="splash-screen" className="splash-screen">
            <img src="/media/logos/logo-minimize.png" className="dark-logo" alt="Logo" />
            <img src="/media/logos/logo-minimize.png" height="120px" className="light-logo" alt="Logo" />
            <div className="loader-wrapper">
              <span className="loader"></span>
              <span className="loading-text">Loading...</span>
            </div>
          </div>
        }>
          <PortalLayout />
        </Suspense>
      }>
        <Route path='home' element={<HomePage />} />
        <Route path='nhiem-vu' element={<NopNhiemVuPage />} />
        <Route path='y-tuong' element={<NopYTuongPage />} />
        <Route path='sang-kien' element={<NopSangKienPage />} />
        <Route path='du-an' element={<NopDuAnCNTTPage />} />
        <Route path='profile' element={<ProfilePage />} />
        <Route index element={<Navigate to='/portal/home' />} />
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes >
  );
};


export { PortalRoutes };
