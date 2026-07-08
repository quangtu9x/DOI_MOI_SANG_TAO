import { FC, lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import {
  HomePage,
  // NopDuAnCNTTPage,   // ẩn - giai đoạn sau
  // NopNhiemVuPage,    // ẩn - giai đoạn sau
  // NopSangKienPage,   // ẩn - giai đoạn sau
  NopYTuongPage,
  ProfilePage,
  TraCuuHoSoPage,
  KhoTriThucPortalPage,
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
              <span className="loading-text"></span>
            </div>
          </div>
        }>
          <PortalLayout />
        </Suspense>
      }>
        <Route path='trang-chu' element={<HomePage />} />
        {/* <Route path='nhiem-vu' element={<NopNhiemVuPage />} /> ẩn - giai đoạn sau */}
        <Route path='y-tuong' element={<NopYTuongPage />} />
        {/* <Route path='sang-kien' element={<NopSangKienPage />} /> ẩn - giai đoạn sau */}
        {/* <Route path='du-an' element={<NopDuAnCNTTPage />} /> ẩn - giai đoạn sau */}
        <Route path='tra-cuu' element={<TraCuuHoSoPage />} />
        <Route path='kho-tri-thuc' element={<KhoTriThucPortalPage />} />
        <Route path='profile' element={<ProfilePage />} />
        <Route index element={<Navigate to='/doi-moi/trang-chu' />} />
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes >
  );
};

export { PortalRoutes };
