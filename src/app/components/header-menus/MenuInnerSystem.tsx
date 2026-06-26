import { MenuItem } from '@/_metronic/layout/components/header/header-menus';
import { MenuInnerWithSub } from '@/_metronic/layout/components/header/header-menus';
import { useAuth } from '@/app/modules/auth';
import { useTourGuide } from '@/context/TourGuideProvider';
import { P, R } from '@/data';
import { UserType } from '@/models';
import { hasAll, uiManage } from '@/utils/utils';

// ===== Đổi mới sáng tạo menu config =====
const menuDoiMoiSangTaoConfig = [
  {
    key: 'dashboard',
    title: 'Trang chủ',
    to: '/admin-dashboard',
    fontIcon: 'fa-regular fa-house',
  },
  {
    key: 'doi-moi-sang-tao',
    title: 'Đổi mới sáng tạo',
    to: '/doi-moi-sang-tao',
    fontIcon: 'fa-regular fa-rocket',
    children: [
      {
        to: '/doi-moi-sang-tao/dashboard',
        title: 'Tổng quan',
        fontIcon: 'fa-regular fa-gauge-high',
      },
      {
        to: '/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach',
        title: 'Quản lý ý tưởng',
        fontIcon: 'fa-regular fa-lightbulb',
      },
      {
        to: '/doi-moi-sang-tao/quy-trinh-duyet/cho-duyet',
        title: 'Quy trình phê duyệt',
        fontIcon: 'fa-regular fa-circle-check',
      },
      {
        to: '/doi-moi-sang-tao/thong-bao',
        title: 'Thông báo hệ thống',
        fontIcon: 'fa-regular fa-bell',
      },
      {
        to: '/doi-moi-sang-tao/kho-tri-thuc',
        title: 'Kho tri thức',
        fontIcon: 'fa-regular fa-books',
      },
      {
        to: '/doi-moi-sang-tao/bao-cao',
        title: 'Báo cáo & thống kê',
        fontIcon: 'fa-regular fa-file-chart-column',
      },
    ],
  },
  {
    key: 'admin',
    title: 'Quản trị',
    to: '/admin',
    fontIcon: 'fa-regular fa-gear',
    permission: [
      ...uiManage(R.Catalogs),
      ...uiManage(R.DataSharings),
      ...uiManage(R.Users),
      ...uiManage(R.Roles),
      ...uiManage(R.OrganizationUnits),
    ],
    dataTour: 'menu-admin',
    children: [
      {
        to: '/admins/system-admins',
        title: 'Quản trị hệ thống',
        fontIcon: 'fa-regular fa-list-check',
        permission: [P.of(R.OrganizationUnits, 'View')],
        dataTour: 'menu-system-admin',
      },
      {
        to: '/admins/catalogs',
        title: 'Quản lý danh mục',
        fontIcon: 'fa-regular fa-grid-2',
        permission: [P.of(R.Catalogs, 'View')],
      },
      {
        to: '/admins/data-sharings',
        title: 'Quản lý tích hợp & chia sẻ dữ liệu',
        fontIcon: 'fa-regular fa-wifi',
      },
    ],
  },
];

export function MenuInnerSystem() {
  const { currentUser } = useAuth();
  const currentPermissions = new Set(currentUser?.permissions ?? []);
  const { isRunning } = useTourGuide();

  const renderMenuItem = item => {
    if (item.permission && !hasAll(currentPermissions, item.permission)) return null;

    if (item.children?.length) {
      return (
        <MenuInnerWithSub
          key={item.key}
          title={item.title}
          icon={item.icon}
          fontIcon={item.fontIcon}
          to={item.to}
          hasArrow
          menuPlacement="bottom-start"
          menuTrigger={isRunning ? `click` : `{default:'click', lg: 'hover'}`}
          dataTour={item.dataTour}
        >
          {item.children.map(child => {
            if (child.permission && !hasAll(currentPermissions, child.permission)) return null;
            return (
              <MenuItem
                key={child.to}
                to={child.to}
                title={child.title}
                icon={child.icon}
                fontIcon={child.fontIcon}
                classNameMenuItem="px-2"
                dataTour={child.dataTour}
              />
            );
          })}
        </MenuInnerWithSub>
      );
    }

    if (item.key === 'dashboard') {
      item.to = '/admin-dashboard';
    }

    return <MenuItem key={item.key} title={item.title} to={item.to} icon={item.icon} fontIcon={item.fontIcon} />;
  };

  return <>{menuDoiMoiSangTaoConfig.map(renderMenuItem)}</>;
}
