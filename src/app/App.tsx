import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { I18nProvider } from '../_metronic/i18n/i18nProvider';
import { LayoutProvider, LayoutSplashScreen } from '../_metronic/layout/core';
import { MasterInit } from '../_metronic/layout/MasterInit';
import { AuthInit } from './modules/auth';
import { ThemeModeProvider } from '../_metronic/partials';
import { NotificationProvider } from '../context/NotificationProvider';
import { TourGuideProvider } from '../context/TourGuideProvider';


const App = () => {

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nProvider>
        <LayoutProvider>
          <ThemeModeProvider>
            <NotificationProvider>
              <TourGuideProvider>
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={true}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
                <AuthInit>
                  <Outlet />
                  <MasterInit />
                </AuthInit>
              </TourGuideProvider>
            </NotificationProvider>
          </ThemeModeProvider>
        </LayoutProvider>
      </I18nProvider>
    </Suspense>
  );
};

export { App };
