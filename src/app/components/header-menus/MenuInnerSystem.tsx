import { MenuItem } from '@/_metronic/layout/components/header/header-menus';
import { MenuInnerWithSub } from '@/_metronic/layout/components/header/header-menus';
import { useAuth } from '@/app/modules/auth';
import { useTourGuide } from '@/context/TourGuideProvider';
import { P, R } from '@/data';
import { UserType } from '@/models';
import { hasAll, uiManage } from '@/utils/utils';



const menuConfig = [
  {
    key: 'dashboard',
    title: 'Trang chủ',
    to: '/admin-dashboard',
    fontIcon: 'fa-regular fa-house',

  },
  {
    key: 'nguon-luc',
    title: 'Nguồn lực của sở',
    to: '/nguon-luc/chuyen-gia-ngoai',
    permission: [
      ...uiManage(R.ChuyenGias),
    ],
    fontIcon: 'fa-regular fa-users',
  },
  {
    key: 'nhiem-vu',
    title: 'Nhiệm vụ KHCN',
    to: '/nhiem-vu',
    permission: [
    ],
    fontIcon: 'fa-regular fa-atom-simple',
    children: [
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu',
        title: 'Đăng ký nhiệm vụ KHCN',
        fontIcon: 'fa-regular fa-user-plus',
        permission: [P.of(R.DeXuatDeTais, 'View')]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem',
        title: 'Xét duyệt chủ nhiệm đề tài',
        fontIcon: 'fa-regular fa-user-check',
        permission: [P.of(R.PhieuDanhGiaNhanXets, 'View')]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu',
        title: 'Thực hiện nhiệm vụ NCKN',
        fontIcon: 'fa-regular fa-chart-user',
        permission: [P.of(R.HoSoThamDinhs, 'View')]
      },
      {
        to: '/nhiem-vu/trien-khai-thuc-hien',
        title: 'Triển khai thực hiện',
        fontIcon: 'fa-regular fa-clapperboard-play',
        permission: [P.of(R.DonViPhoiHops, 'Create')]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly',
        title: 'Nghiệm thu và thanh lý hợp đồng',
        fontIcon: 'fa-regular fa-money-check-dollar-pen',
        permission: [P.of(R.SanPhamNghiemThus, 'View')]
      },
      {
        to: '/nhiem-vu/ket-qua-hdkh',
        title: 'Kết quả hoạt động KHCN',
        fontIcon: 'fa-regular fa-clipboard-list-check',
        permission: [P.of(R.SanPhamKhoaHocs, 'View')]
      },
      {
        to: '/nhiem-vu/quan-ly-tai-chinh',
        title: 'Quản lý tài chính',
        fontIcon: 'fa-regular fa-money-bill-transfer',
        permission: [P.of(R.PhieuDeNghiTamUngs, 'View')]
      },
    ],
  },
  {
    key: 'sang-kien',
    title: 'Sáng kiến KHCN',
    to: '/sang-kien',
    permission: [
    ],
    fontIcon: 'fa-regular fa-lightbulb-on',
    children: [
      {
        to: '/sang-kien/dang-ky-sang-kien',
        title: 'Đăng ký xét hồ sơ sáng kiến',
        fontIcon: 'fa-regular fa-calendar-lines-pen',
        permission: [P.of(R.HoSoSangKiens, 'View')]
      },
      {
        to: '/sang-kien/tiep-nhan-xu-ly',
        title: 'Tiếp nhận và xử lý hồ sơ',
        fontIcon: 'fa-regular fa-file-arrow-up',
        permission: [P.of(R.HoSoSangKiens, 'View')]
      },
      // {
      //   to: '/sang-kien/kiem-tra-trung-lap',
      //   title: 'Kiểm tra trùng lặp sáng kiến',
      //   fontIcon: 'fa-regular fa-ballot-check',
      //   permission: [P.of(R.HoSoSangKiens, 'View')]
      // },
      {
        to: '/sang-kien/xet-cong-nhan',
        title: 'Xét công nhận hiệu quả và phạm vi sáng kiến',
        fontIcon: 'fa-regular fa-badge-check',
        permission: [
          ...uiManage(R.PhieuDanhGiaSangKiens),
        ]
      },
      {
        to: '/sang-kien/thong-ke-bao-cao',
        title: 'Thống kê báo cáo',
        fontIcon: 'fa-regular fa-file-chart-column',
        permission: [P.of(R.HoSoSangKiens, 'Approve')]
      },
    ],
  },
  {
    key: 'ke-hoach-von',
    title: 'Dự án CNTT',
    to: '/ke-hoach-von',
    fontIcon: 'fa-regular fa-money-bill-transfer',
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
        permission: [P.of(R.Catalogs, 'View')]
      },
      // {
      //   to: '/ke-hoach-von/danh-muc',
      //   title: 'Danh mục hệ thống',
      //   fontIcon: 'fa-regular fa-list-ul',
      // },
      {
        to: '/ke-hoach-von/lich-su',
        title: 'Lịch sử thao tác hệ thống',
        fontIcon: 'fa-regular fa-clock-rotate-left',
      },
      {
        to: '/ke-hoach-von/eform',
        title: 'Quản lý eform động',
        fontIcon: 'fa-regular fa-file-lines',
      },
      {
        to: '/admins/data-sharings',
        title: 'Quản lý tích hợp & chia sẻ dữ liệu',
        fontIcon: 'fa-regular fa-wifi',
      },
    ],
  },
];

const menuBasicConfig = [
  {
    key: 'dashboard',
    title: 'Trang chủ',
    to: '/admin-dashboard',
    fontIcon: 'fa-regular fa-house',

  },
  {
    key: 'nguon-luc',
    title: 'Nguồn lực của sở',
    to: '/nguon-luc/chuyen-gia-ngoai',
    permission: [
      ...uiManage(R.ChuyenGias),
    ],
    fontIcon: 'fa-regular fa-users',
  },
  {
    key: 'nhiem-vu',
    title: 'Nhiệm vụ KHCN',
    to: '/nhiem-vu',
    permission: [
    ],
    fontIcon: 'fa-regular fa-atom-simple',
    children: [
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu',
        title: 'Đăng ký nhiệm vụ KHCN',
        fontIcon: 'fa-regular fa-user-plus',
        permission: [P.of(R.DeXuatDeTais, 'View')]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem',
        title: 'Xét duyệt chủ nhiệm đề tài',
        fontIcon: 'fa-regular fa-user-check',
        permission: [P.of(R.PhieuDanhGiaNhanXets, 'View')]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu',
        title: 'Thực hiện nhiệm vụ NCKN',
        fontIcon: 'fa-regular fa-chart-user',
        permission: [P.of(R.HoSoThamDinhs, 'View')]
      },
      {
        to: '/nhiem-vu/trien-khai-thuc-hien',
        title: 'Triển khai thực hiện',
        fontIcon: 'fa-regular fa-clapperboard-play',
        permission: [P.of(R.DonViPhoiHops, 'Create')]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly',
        title: 'Nghiệm thu và thanh lý hợp đồng',
        fontIcon: 'fa-regular fa-money-check-dollar-pen',
        permission: [P.of(R.SanPhamNghiemThus, 'View')]
      },
      {
        to: '/nhiem-vu/ket-qua-hdkh',
        title: 'Kết quả hoạt động KHCN',
        fontIcon: 'fa-regular fa-clipboard-list-check',
        permission: [P.of(R.SanPhamKhoaHocs, 'View')]
      },
    ],
  },
  {
    key: 'sang-kien',
    title: 'Sáng kiến KHCN',
    to: '/sang-kien',
    permission: [
    ],
    fontIcon: 'fa-regular fa-lightbulb-on',
    children: [
      {
        to: '/sang-kien/tiep-nhan-xu-ly',
        title: 'Tiếp nhận và xử lý hồ sơ',
        fontIcon: 'fa-regular fa-file-arrow-up',
        permission: [P.of(R.HoSoSangKiens, 'View')]
      },
      {
        to: '/sang-kien/dang-ky-sang-kien',
        title: 'Đăng ký xét hồ sơ sáng kiến',
        fontIcon: 'fa-regular fa-calendar-lines-pen',
        permission: [P.of(R.HoSoSangKiens, 'View')]
      },

    ],
  },
  {
    key: 'ke-hoach-von',
    title: 'Dự án CNTT',
    to: '/ke-hoach-von',
    fontIcon: 'fa-regular fa-money-bill-transfer',
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
        permission: [P.of(R.Catalogs, 'View')]
      },
      // {
      //   to: '/ke-hoach-von/danh-muc',
      //   title: 'Danh mục hệ thống',
      //   fontIcon: 'fa-regular fa-list-ul',
      // },
      {
        to: '/ke-hoach-von/lich-su',
        title: 'Lịch sử thao tác hệ thống',
        fontIcon: 'fa-regular fa-clock-rotate-left',
      },
      {
        to: '/ke-hoach-von/eform',
        title: 'Quản lý eform động',
        fontIcon: 'fa-regular fa-file-lines',
      },
      {
        to: '/admins/data-sharings',
        title: 'Quản lý tích hợp & chia sẻ dữ liệu',
        fontIcon: 'fa-regular fa-wifi',
      },
    ],
  },
];

const menuSpecialistConfig = [
  {
    key: 'dashboard',
    title: 'Trang chủ',
    to: '/admin-dashboard',
    fontIcon: 'fa-regular fa-house',

  },
  {
    key: 'nguon-luc',
    title: 'Nguồn lực của sở',
    to: '/nguon-luc/chuyen-gia-ngoai',
    permission: [
      ...uiManage(R.ChuyenGias),
    ],
    fontIcon: 'fa-regular fa-users',
  },
  {
    key: 'nhiem-vu',
    title: 'Nhiệm vụ KHCN',
    to: '/nhiem-vu',
    permission: [
    ],
    fontIcon: 'fa-regular fa-atom-simple',
    children: [
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu',
        title: 'Đăng ký nhiệm vụ KHCN',
        fontIcon: 'fa-regular fa-user-plus',
        permission: [P.of(R.DeXuatDeTais, 'View')]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem',
        title: 'Xét duyệt chủ nhiệm đề tài',
        fontIcon: 'fa-regular fa-user-check',
        permission: [P.of(R.PhieuDanhGiaNhanXets, 'View')]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu',
        title: 'Thực hiện nhiệm vụ NCKN',
        fontIcon: 'fa-regular fa-chart-user',
        permission: [P.of(R.HoSoThamDinhs, 'View')]
      },
      {
        to: '/nhiem-vu/trien-khai-thuc-hien',
        title: 'Triển khai thực hiện',
        fontIcon: 'fa-regular fa-clapperboard-play',
        permission: [P.of(R.DonViPhoiHops, 'Create')]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly',
        title: 'Nghiệm thu và thanh lý hợp đồng',
        fontIcon: 'fa-regular fa-money-check-dollar-pen',
        permission: [P.of(R.SanPhamNghiemThus, 'View')]
      },
      {
        to: '/nhiem-vu/ket-qua-hdkh',
        title: 'Kết quả hoạt động KHCN',
        fontIcon: 'fa-regular fa-clipboard-list-check',
        permission: [P.of(R.SanPhamKhoaHocs, 'View')]
      },
      {
        to: '/nhiem-vu/quan-ly-tai-chinh',
        title: 'Quản lý tài chính',
        fontIcon: 'fa-regular fa-money-bill-transfer',
        permission: [P.of(R.PhieuDeNghiTamUngs, 'View')]
      },
    ],
  },
  {
    key: 'sang-kien',
    title: 'Sáng kiến KHCN',
    to: '/sang-kien',
    permission: [
    ],
    fontIcon: 'fa-regular fa-lightbulb-on',
    children: [
      {
        to: '/sang-kien/xet-cong-nhan',
        title: 'Xét công nhận hiệu quả và phạm vi sáng kiến',
        fontIcon: 'fa-regular fa-badge-check',
        permission: [
          ...uiManage(R.PhieuDanhGiaSangKiens),
        ]
      }
    ],
  },
  {
    key: 'ke-hoach-von',
    title: 'Dự án CNTT',
    to: '/ke-hoach-von',
    fontIcon: 'fa-regular fa-money-bill-transfer',
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
        permission: [P.of(R.Catalogs, 'View')]
      },
      // {
      //   to: '/ke-hoach-von/danh-muc',
      //   title: 'Danh mục hệ thống',
      //   fontIcon: 'fa-regular fa-list-ul',
      // },
      {
        to: '/ke-hoach-von/lich-su',
        title: 'Lịch sử thao tác hệ thống',
        fontIcon: 'fa-regular fa-clock-rotate-left',
      },
      {
        to: '/ke-hoach-von/eform',
        title: 'Quản lý eform động',
        fontIcon: 'fa-regular fa-file-lines',
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
  const userType = currentUser?.type;
  const currentPermissions = new Set(currentUser?.permissions ?? []);
  const { isRunning } = useTourGuide();

  const renderMenuItem = item => {
    // Check group permission
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
            // Child-level permission
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
    // if (item.key === 'dashboard') {
    //   item.to = isAdmin ? '/admin-dashboard' : '/business-dashboard';
    // }
    if (item.key === 'dashboard') {
      item.to = '/admin-dashboard';
    }

    return <MenuItem key={item.key} title={item.title} to={item.to} icon={item.icon} fontIcon={item.fontIcon} />;
  };

  return <>{userType === UserType.Basic ? menuBasicConfig.map(renderMenuItem) :
    userType === UserType.Specialist ? menuSpecialistConfig.map(renderMenuItem) :
      menuConfig.map(renderMenuItem)}</>
}
