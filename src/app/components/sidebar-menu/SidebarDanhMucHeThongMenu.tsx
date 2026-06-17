import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu';

const sidebarDanhMucHeThongConfig = [
  {
    to: '/ke-hoach-von/danh-muc/co-quan-don-vi',
    title: 'Danh mục cơ quan đơn vị',
  },
  {
    to: '/ke-hoach-von/danh-muc/chu-dau-tu',
    title: 'Danh mục chủ đầu tư',
  },
  {
    to: '/ke-hoach-von/danh-muc/tinh-thanh-pho',
    title: 'Danh mục tỉnh, thành phố',
  },
  {
    to: '/ke-hoach-von/danh-muc/phuong-xa',
    title: 'Danh mục phường, xã',
  },
  {
    to: '/ke-hoach-von/danh-muc/nha-thau',
    title: 'Danh mục nhà thầu',
  },
  {
    to: '/ke-hoach-von/danh-muc/nguon-von-dau-tu',
    title: 'Danh mục nguồn vốn đầu tư',
  },
  {
    to: '/ke-hoach-von/danh-muc/loai-du-an',
    title: 'Danh mục loại dự án',
  },
  {
    to: '/ke-hoach-von/danh-muc/nhom-du-an',
    title: 'Danh mục nhóm dự án',
  },
];

const SidebarDanhMucHeThongMenu = () => {
  return (
    <>
      <SidebarMenuItemWithSub
        to="/ke-hoach-von/danh-muc"
        title="Danh mục hệ thống"
        fontIcon="bi bi-list-ul"
      >
        {sidebarDanhMucHeThongConfig.map((item, idx) => (
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

export { SidebarDanhMucHeThongMenu };
