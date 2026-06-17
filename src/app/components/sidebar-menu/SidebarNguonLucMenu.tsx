import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { useAuth } from '@/app/modules/auth';
import { R } from '@/data';
import { hasAny, uiManage } from '@/utils/utils';

const sidebarNguonLucConfig = [
  {
    to: '/nguon-luc/chuyen-gia-ngoai',
    title: 'Thông tin chuyên gia bên ngoài',
    fontIcon: 'fa-regular fa-circle-user-circle-question',
    requiredAny: [
      ...uiManage(R.ChuyenGias),
    ],
  },
  {
    to: '/nguon-luc/thong-tin-chung',
    title: 'Thông tin chung lý lịch khoa học',
    fontIcon: 'fa-regular fa-user-hat-tie-magnifying-glass',
    requiredAny: [
      ...uiManage(R.ChuyenGias),
    ],
  },
  {
    to: '/nguon-luc/qua-trinh-dao-tao',
    title: 'Thông tin quá trình đào tạo và văn bằng được cấp',
    fontIcon: 'fa-regular fa-file-certificate',
    requiredAny: [
      ...uiManage(R.QuaTrinhDaoTaos),
    ],
  },
  {
    to: '/nguon-luc/qua-trinh-nghien-cuu',
    title: 'Thông tin quá trình nghiên cứu, nhiệm vụ KHCN đã thực hiện, công bố khoa học',
    fontIcon: 'fa-regular fa-file-circle-check',
    requiredAny: [
      ...uiManage(R.QuaTrinhNghienCuus),
    ],
  },
  {
    to: '/nguon-luc/giai-thuong',
    title: 'Thông tin giải thưởng đã đạt được',
    fontIcon: 'fa-regular fa-award',
    requiredAny: [
      ...uiManage(R.GiaiThuongs),
    ],
  },
  {
    to: '/nguon-luc/tra-cuu',
    title: 'Tra cứu lý lịch khoa học',
    fontIcon: 'fa-regular fa-file-magnifying-glass',
    requiredAny: [
      ...uiManage(R.ChuyenGias),
    ],
  },
];

const SidebarNguonLucMenu = () => {
  const { currentUser } = useAuth();
  const currentPermissions = new Set(currentUser?.permissions ?? []);

  const visibleSidebarItems = sidebarNguonLucConfig
    .filter(m => !m.requiredAny || hasAny(currentPermissions, m.requiredAny))
    .map(m => ({
      ...m,
      // children: (m.children ?? []).filter(c =>
      //   !c.requiredAll || hasAll(currentPermissions, c.requiredAll)
      // ),
    }));

  return (
    <>
      {visibleSidebarItems.map((menu, idx) => {
        return (
          <SidebarMenuItem
            key={idx}
            to={menu.to}
            title={menu.title}
            fontIcon={menu.fontIcon} />
        );
      })}
    </>
  );
};

export { SidebarNguonLucMenu };
