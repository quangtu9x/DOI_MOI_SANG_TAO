import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HeaderWrapper } from './components/header';
import { HeaderDashboardWrapper } from './components/header';

import { RightToolbar } from '../partials/layout/RightToolbar';
import { ScrollTop } from './components/scroll-top';
import { FooterWrapper } from './components/footer';
import { Sidebar, SidebarDashboard } from './components/sidebar';
import { ActivityDrawer, DrawerMessenger, InviteUsers, UpgradePlan } from '../partials';
import { PageDataProvider } from './core';
import { reInitMenu } from '../helpers';

const DashboardLayout = ({ menuInner }) => {
  const location = useLocation();
  useEffect(() => {
    reInitMenu();
  }, [location.key]);

  return (
    <PageDataProvider>
      <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
        <div className="app-page flex-column flex-column-fluid" id="kt_app_page">
          <HeaderWrapper menuInner={menuInner} />
          <div className="app-wrapper flex-column flex-row-fluid" id="kt_app_wrapper">
            <SidebarDashboard asideMenu={null} />
            <div className="app-main flex-column flex-row-fluid" id="kt_app_main">
              <div className="d-flex flex-column flex-column-fluid">
                <Outlet />
                {/* <Content>
                  <Outlet />
                </Content> */}
              </div>
              <FooterWrapper />
            </div>
          </div>
        </div>
      </div>

      {/* begin:: Drawers */}
      <ActivityDrawer />
      <RightToolbar />
      <DrawerMessenger />
      {/* end:: Drawers */}

      {/* begin:: Modals */}
      <InviteUsers />
      <UpgradePlan />
      {/* end:: Modals */}
      <ScrollTop />
    </PageDataProvider>
  );
};

export { DashboardLayout };
