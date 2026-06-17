import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ScrollTop } from './components/scroll-top';
import { PageDataProvider } from './core';
import { reInitMenu } from '../helpers';
import { PortalHeader, PortalNavbar } from './components/header';
import { PortalFooter } from './components/footer';
import tailwindHref from '@/_metronic/assets/tailwind/index.css?url';
import { useDynamicCSS } from '@/utils/utils';


const PortalLayout = () => {
  const location = useLocation();
  const cssLoaded = useDynamicCSS(tailwindHref, 'portal-tailwind');
  useEffect(() => {
    reInitMenu();
  }, [location.key]);

  if (!cssLoaded) {
    return (
      <div id="splash-screen" className="splash-screen">
        <img src="media/logos/logo-loading.png" className="dark-logo" alt="TD dark logo" />
        <img src="media/logos/logo-loading.png" height="120px" className="light-logo" alt="TD light logo" />
        <div className="loader-wrapper">
          <span className="loader"></span>
          <span className="loading-text">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <PageDataProvider>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PortalHeader />
        <PortalNavbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <PortalFooter />
      </div>

      <ScrollTop />
    </PageDataProvider>
  );
};

export { PortalLayout };
