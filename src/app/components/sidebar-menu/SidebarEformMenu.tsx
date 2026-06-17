import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu';

const sidebarEformConfig = [
  {
    to: '/ke-hoach-von/eform/ql-mau-eform',
    title: 'Quản lý các mẫu eform động',
  },
  {
    to: '/ke-hoach-von/eform/thiet-ke',
    title: 'Thiết kế mẫu eform động',
  },
];

const SidebarEformMenu = () => {
  return (
    <>
      <SidebarMenuItemWithSub
        to="/ke-hoach-von/eform"
        title="Quản lý eform động"
        fontIcon="bi bi-file-earmark-text"
      >
        {sidebarEformConfig.map((item, idx) => (
          <SidebarMenuItem
            key={idx}
            to={item.to}
            title={item.title}
            hasBullet={true}
          />
        ))}
      </SidebarMenuItemWithSub>
    </>
  );
};

export { SidebarEformMenu };
