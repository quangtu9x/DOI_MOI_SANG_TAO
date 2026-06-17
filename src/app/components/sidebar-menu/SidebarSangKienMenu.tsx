import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { useAuth } from '@/app/modules/auth';
import { P, R } from '@/data';
import { UserType } from '@/models';
import { hasAll, hasAny, uiManage } from '@/utils/utils';

const sidebarSangKienConfig = [
  {
    to: '/sang-kien/dang-ky-sang-kien',
    title: 'Đăng ký xét hồ sơ sáng kiến',
    fontIcon: 'fa-regular fa-calendar-lines-pen',
    requiredAny: [
      ...uiManage(R.HoSoSangKiens),
    ],
    children: [
      {
        to: '/sang-kien/dang-ky-sang-kien/dot-xet-sang-kien',
        title: 'Đợt xét sáng kiến',
        requiredAll: [...uiManage(R.DotXetSangKiens)]
      },
      {
        to: '/sang-kien/dang-ky-sang-kien/don-dang-ky',
        title: 'Đăng ký xét sáng kiến cấp tỉnh',
        requiredAll: [...uiManage(R.HoSoSangKiens)]
      },
      {
        to: '/sang-kien/dang-ky-sang-kien/ho-so-dang-ky',
        title: 'Quản lý hồ sơ sáng kiến',
        requiredAll: [...uiManage(R.HoSoSangKiens)]
      },
    ]
  },
  {
    to: '/sang-kien/tiep-nhan-xu-ly',
    title: 'Tiếp nhận và xử lý hồ sơ',
    fontIcon: 'fa-regular fa-file-arrow-up',
    requiredAny: [P.of(R.HoSoSangKiens, 'View')],
    children: [
      {
        to: '/sang-kien/tiep-nhan-xu-ly/tiep-nhan-ho-so',
        title: 'Tiếp nhận hồ sơ',
        requiredAll: [P.of(R.HoSoSangKiens, 'View')]
      },
      {
        to: '/sang-kien/tiep-nhan-xu-ly/tong-hop-ho-so',
        title: 'Tổng hợp hồ sơ',
        requiredAll: [P.of(R.HoSoSangKiens, 'Approve')]
      },
    ]
  },
  // {
  //   to: '/sang-kien/kiem-tra-trung-lap',
  //   title: 'Kiểm tra trùng lặp sáng kiến',
  //   fontIcon: 'fa-regular fa-ballot-check',
  //   requiredAny: [
  //     ...uiManage(R.HoSoSangKiens),
  //   ]
  // },
  {
    to: '/sang-kien/xet-cong-nhan',
    title: 'Xét công nhận hiệu quả và phạm vi sáng kiến',
    fontIcon: 'fa-regular fa-badge-check',
    requiredAll: [...uiManage(R.PhieuDanhGiaSangKiens),],
    children: [
      {
        to: '/sang-kien/xet-cong-nhan/hoi-dong-sang-kien',
        title: 'Tổ chức hội đồng sáng kiến',
        requiredAll: [
          ...uiManage(R.HoiDongDanhGias),
        ]
      },
      {
        to: '/sang-kien/xet-cong-nhan/danh-gia-sang-kien',
        title: 'Đánh giá sáng kiến',
        requiredAll: [
          ...uiManage(R.PhieuDanhGiaSangKiens),
        ]
      },
      {
        to: '/sang-kien/xet-cong-nhan/ket-qua-sang-kien',
        title: 'Kết quả sáng kiến',
        requiredAll: [
          ...uiManage(R.KetQuaSangKiens),
        ]
      },
      {
        to: '/sang-kien/xet-cong-nhan/giay-chung-nhan-sang-kien',
        title: 'Giấy chứng nhận sáng kiến',
        requiredAll: [
          ...uiManage(R.GiayChungNhanSangKiens),
        ]

      },
    ]
  },
  {
    to: '/sang-kien/thong-ke-bao-cao',
    title: 'Thống kê báo cáo',
    fontIcon: 'fa-regular fa-file-chart-column',
    requiredAny: [P.of(R.HoSoSangKiens, 'Approve')],
  },
];

const sidebarSangKienBasicConfig = [
  {
    to: '/sang-kien/tiep-nhan-xu-ly',
    title: 'Tiếp nhận và xử lý hồ sơ',
    fontIcon: 'fa-regular fa-file-arrow-up',
    requiredAny: [P.of(R.HoSoSangKiens, 'View')],
    children: [
      {
        to: '/sang-kien/tiep-nhan-xu-ly/tiep-nhan-ho-so',
        title: 'Tiếp nhận hồ sơ',
        requiredAll: [P.of(R.HoSoSangKiens, 'View')]
      },
    ]
  },
  {
    to: '/sang-kien/dang-ky-sang-kien',
    title: 'Đăng ký xét hồ sơ sáng kiến',
    fontIcon: 'fa-regular fa-calendar-lines-pen',
    requiredAny: [
      ...uiManage(R.HoSoSangKiens),
    ],
    children: [
      {
        to: '/sang-kien/dang-ky-sang-kien/don-dang-ky',
        title: 'Đăng ký xét sáng kiến cấp tỉnh',
        requiredAll: [...uiManage(R.HoSoSangKiens)]
      },
      {
        to: '/sang-kien/dang-ky-sang-kien/ho-so-dang-ky',
        title: 'Quản lý hồ sơ sáng kiến',
        requiredAll: [...uiManage(R.HoSoSangKiens)]
      },
    ]
  },
];

const sidebarSangKienSpecialistConfig = [
  {
    to: '/sang-kien/xet-cong-nhan',
    title: 'Xét công nhận hiệu quả và phạm vi sáng kiến',
    fontIcon: 'fa-regular fa-badge-check',
    requiredAll: [...uiManage(R.PhieuDanhGiaSangKiens),],
    children: [
      {
        to: '/sang-kien/xet-cong-nhan/danh-gia-sang-kien',
        title: 'Đánh giá sáng kiến',
        requiredAll: [
          ...uiManage(R.PhieuDanhGiaSangKiens),
        ]
      }
    ]
  }
];

const SidebarSangKienMenu = () => {
  const { currentUser } = useAuth();
  const userType = currentUser?.type;
  const currentPermissions = new Set(currentUser?.permissions ?? []);

  const visibleSidebarItems = userType == UserType.Basic ? sidebarSangKienBasicConfig :
    userType == UserType.Specialist ? sidebarSangKienSpecialistConfig : sidebarSangKienConfig
      .filter(m => !m.requiredAny || hasAny(currentPermissions, m.requiredAny))
      .filter(m => !m.requiredAll || hasAll(currentPermissions, m.requiredAll))
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

export { SidebarSangKienMenu };
