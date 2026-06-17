import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu';

const sidebarLichSuConfig = [
  {
    to: '/ke-hoach-von/lich-su/lich-su-cap-nhat-thong-tin-du-an',
    title: 'Lịch sử cập nhật thông tin dự án',
  },
  {
    to: '/ke-hoach-von/lich-su/lich-su-cap-nhat-du-lieu-nguoi-dung',
    title: 'Lịch sử cập nhật dữ liệu người dùng',
  },
  // {
  //   to: '/ke-hoach-von/lich-su/lich-su-su-dung-he-thong',
  //   title: 'Lịch sử sử dụng hệ thống phần mềm',
  // },
];

const SidebarLichSuMenu = () => {
  return (
    <>
      <SidebarMenuItemWithSub
        to="/ke-hoach-von/lich-su"
        title="Lịch sử thao tác hệ thống"
        fontIcon="bi bi-clock-history"
      >
        {sidebarLichSuConfig.map((item, idx) => (
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

export { SidebarLichSuMenu };
