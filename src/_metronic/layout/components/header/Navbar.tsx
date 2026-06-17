import clsx from 'clsx';
import { KTIcon, toAbsoluteUrl } from '../../../helpers';
import { HeaderNotificationsMenu, HeaderUserMenu, Search, ThemeModeSwitcher } from '../../../partials';
import { useLayout } from '../../core';
import { useAuth } from '../../../../app/modules/auth';
import { API_URL, FILE_URL } from '@/utils/baseAPI';
import { NotificationButton } from '@/app/components';

const itemClass = 'ms-1 ms-md-4';
const btnClass = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px';
const userAvatarClass = 'symbol-35px';
const btnIconClass = 'fs-2';
const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { config } = useLayout();
  return (
    <div className="app-navbar flex-shrink-0">


      <div className={clsx('app-navbar-item', itemClass)}>
        <NotificationButton />
      </div>

      <HeaderUserMenu className={clsx('app-navbar-item', itemClass)} />

      {config.app?.header?.default?.menu?.display && (
        <div className="app-navbar-item d-lg-none ms-2 me-n3" title="Show header menu">
          <div className="btn btn-icon btn-active-color-primary w-35px h-35px" id="kt_app_header_menu_toggle">
            <KTIcon iconName="text-align-left" className={btnIconClass} />
          </div>
        </div>
      )}
    </div>
  );
};

export { Navbar };
