import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { useAuth } from '@/app/modules/auth';
import { P, R } from '@/data';
import { checkPermissions, hasAll, hasAny, uiManage } from '@/utils/utils';

const sidebarSystemConfig = [
  {
    to: '/admins/system-admins',
    title: 'Quản trị hệ thống',
    fontIcon: 'fa-regular fa-list-check',
    requiredAny: [
      ...uiManage(R.OrganizationUnits),
      ...uiManage(R.Positions),
      ...uiManage(R.Roles),
      ...uiManage(R.Permissions),
      ...uiManage(R.Users),
      P.of(R.Audits, 'View'),
      P.of(R.LoginLogs, 'View'),
    ],
    children: [
      {
        to: '/admins/system-admins/organization-units',
        title: 'Cơ cấu tổ chức',
        requiredAll: [P.of(R.OrganizationUnits, 'View')]
      },
      {
        to: '/admins/system-admins/positions',
        title: 'Chức vụ',
        requiredAll: [P.of(R.Positions, 'View')]
      },
      {
        to: '/admins/system-admins/roles',
        title: 'Vai trò người dùng',
        requiredAll: [P.of(R.Roles, 'View')]
      },
      {
        to: '/admins/system-admins/permissions',
        title: 'Quyền',
        requiredAll: [P.of(R.Permissions, 'View')]
      },
      {
        to: '/admins/system-admins/users',
        title: 'Người dùng',
        requiredAll: [P.of(R.Users, 'View')]
      },
      {
        to: '/admins/system-admins/audits',
        title: 'Nhật ký thao tác hệ thống',
        requiredAll: [P.of(R.Audits, 'View')]
      },
      {
        to: '/admins/system-admins/login-logs',
        title: 'Lịch sử sử dụng hệ thống phần mềm',
        requiredAll: [P.of(R.LoginLogs, 'View')]
      },
    ],
  },
  {
    to: '/admins/catalogs',
    title: 'Quản lý danh mục',
    fontIcon: 'fa-regular fa-grid-2',
    requiredAny: [
      ...uiManage(R.Catalogs),
    ],
    children: [
      {
        to: '/admins/catalogs/category-groups',
        title: 'Nhóm danh mục',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/categories',
        title: 'Danh mục',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      // {
      //   to: '/admins/catalogs/job-positions',
      //   title: 'Danh mục vị trí công việc',
      //   requiredAll: [P.of(R.Catalogs, 'View')]
      // },
      {
        to: '/admins/catalogs/template-files',
        title: 'Phôi nhập, xuất dữ liệu',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/app-configs',
        title: 'Cấu hình hệ thống',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/user-guides',
        title: 'Hướng dẫn sử dụng',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/chuong-trinh-nvkh',
        title: 'Chương trình NVKH',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/loai-nvkh',
        title: 'Loại hình NVKH',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/nguon-ngan-sach',
        title: 'Nguồn ngân sách',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/chuyen-nganh',
        title: 'Chuyên ngành',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/loai-tai-lieu-nvkh',
        title: 'Loại tài liệu NCKH',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/chu-dau-tu',
        title: 'Chủ đầu tư',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/tinh-thanh-pho',
        title: 'Danh mục tỉnh, thành phố',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/phuong-xa',
        title: 'Danh mục phường, xã',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/nha-thau',
        title: 'Danh mục nhà thầu',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/nguon-von-dau-tu',
        title: 'Danh mục nguồn vốn đầu tư',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/loai-du-an',
        title: 'Danh mục loại dự án',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/nhom-du-an',
        title: 'Danh mục nhóm dự án',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/linh-vuc-sang-kien',
        title: 'Lĩnh vực sáng kiến',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/don-vi-cong-nhan',
        title: 'Đơn vị công nhận sáng kiến',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/doi-tuong-nop-sang-kien',
        title: 'Đối tượng nộp sáng kiến',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/loai-sang-kien',
        title: 'Loại sáng kiến',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/tieu-chi-danh-gia',
        title: 'Tiêu chí đánh giá',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
      {
        to: '/admins/catalogs/thanh-phan-ho-so',
        title: 'Thành phần hồ sơ',
        requiredAll: [P.of(R.Catalogs, 'View')]
      },
    ],
  },
  {
    to: '/admins/data-sharings',
    title: 'Tích hợp và chia sẻ dữ liệu',
    fontIcon: 'fa-regular fa-wifi',
    requiredAny: [
      ...uiManage(R.DataSharings),
    ],
    children: [
      {
        to: '/admins/data-sharings/manage',
        title: 'Quản lý tích hợp và chia sẻ dữ liệu',
        requiredAll: [P.of(R.DataSharings, 'View')]
      },
      {
        to: '/admins/data-sharings/nhiem-vu-khoa-hoc',
        title: 'Tích hợp, chia sẻ dữ liệu về nhiệm vụ khoa học',
        requiredAll: [P.of(R.DataSharings, 'View')]
      },
      {
        to: '/admins/data-sharings/sang-kien-khoa-hoc',
        title: 'Tích hợp, chia sẻ dữ liệu về sáng kiến khoa học',
        requiredAll: [P.of(R.DataSharings, 'View')]
      },
      {
        to: '/admins/data-sharings/du-an-cntt',
        title: 'Tích hợp, chia sẻ dữ liệu về dự án CNTT',
        requiredAll: [P.of(R.DataSharings, 'View')]
      },
    ]
  },
];

const SidebarSystemMenu = () => {
  const { currentUser } = useAuth();
  const currentPermissions = new Set(currentUser?.permissions ?? []);

  const visibleSidebarItems = sidebarSystemConfig
    .filter(m => !m.requiredAny || hasAny(currentPermissions, m.requiredAny))
    .map(m => ({
      ...m,
      children: (m.children ?? []).filter(c =>
        !c.requiredAll || hasAll(currentPermissions, c.requiredAll)
      ),
    }));

  return (
    <>
      {visibleSidebarItems.map((menu, idx) => {
        if (menu.children?.length === 0) {
          return (
            <SidebarMenuItem
              key={idx}
              to={menu.to}
              title={menu.title}
              fontIcon={menu.fontIcon} />
          );
        }
        return (
          <SidebarMenuItemWithSub
            key={idx}
            to={menu.to}
            title={menu.title}
            fontIcon={menu.fontIcon}>
            {menu.children.map((child, cIdx) => {
              return (<SidebarMenuItem key={cIdx} to={child.to} title={child.title} hasBullet={true} />)
            })}
          </SidebarMenuItemWithSub>
        );
      })}
    </>
  );
};

export { SidebarSystemMenu };
