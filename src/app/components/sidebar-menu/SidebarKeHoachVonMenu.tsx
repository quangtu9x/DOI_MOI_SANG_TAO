import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { useAuth } from '@/app/modules/auth';
import { P, R } from '@/data';
import { hasAll, hasAny, uiManage } from '@/utils/utils';

const sidebarKeHoachVonConfig = [
  {
    to: '/ke-hoach-von/giai-doan-xin-von',
    title: 'Giai đoạn xin vốn',
    fontIcon: 'bi bi-cash-stack',
    requiredAny: [
      ...uiManage(R.KeHoachs),
    ],
    children: [
      {
        to: '/ke-hoach-von/giai-doan-xin-von/bang-dinh-muc',
        title: 'Bảng định mức',
        requiredAll: [
          ...uiManage(R.KeHoachs),
          P.of('KeHoachs', 'Approve'),
        ],
        children: []
      },
      {
        to: '/ke-hoach-von/giai-doan-xin-von/khung-chi-phi',
        title: 'Khung chi phí',
        requiredAll: [
          ...uiManage(R.KeHoachs),
          P.of('KeHoachs', 'Approve'),
        ],
      },
      {
        to: '/ke-hoach-von/giai-doan-xin-von/ke-hoach',
        title: 'Kế hoạch xin vốn',
        requiredAll: [
          ...uiManage(R.KeHoachs),
        ],
      },
      {
        to: '/ke-hoach-von/giai-doan-xin-von/ke-hoach-cho-duyet',
        title: 'Kế hoạch xin vốn chờ duyệt',
        requiredAll: [
          ...uiManage(R.KeHoachs),
          P.of('KeHoachs', 'Approve'),
        ],
      },
    ]
  },
  {
    to: '/ke-hoach-von/lap-ke-hoach-von',
    title: 'Phân hệ Quản lý kế hoạch vốn, phân bổ vốn',
    fontIcon: 'bi bi-cash-stack',
    children: [
      {
        to: '/ke-hoach-von/lap-ke-hoach-von/lap-ke-hoach-von-hang-nam',
        title: 'Lập kế hoạch vốn hàng năm',
      },
      {
        to: '/ke-hoach-von/lap-ke-hoach-von/phan-bo-von-ke-hoach-hang-nam',
        title: 'Phân bổ vốn kế hoạch hàng năm',
      },
    ]
  },
  {
    to: '/ke-hoach-von/quan-ly-tien-trinh',
    title: 'Quản lý tiến trình các bước thực hiện dự án',
    fontIcon: 'bi bi-diagram-3',
    children: [
      {
        to: '/ke-hoach-von/quan-ly-tien-trinh/quan-ly-thong-tin-du-an',
        title: 'Quản lý thông tin dự án',
      },
      {
        to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-chuan-bi-dau-tu',
        title: 'Giai đoạn chuẩn bị đầu tư',
        children: [
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-chuan-bi-dau-tu/bao-cao-nghien-cuu-tien-kha-thi',
            title: 'Quản lý thông tin bước thực hiện báo cáo nghiên cứu tiền khả thi dự án',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-chuan-bi-dau-tu/bao-cao-de-xuat-chu-truong',
            title: 'Quản lý thông tin bước thực hiện báo cáo đề xuất chủ trương đầu tư dự án',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-chuan-bi-dau-tu/quyet-dinh-chu-truong-dau-tu',
            title: 'Quản lý thông tin Quyết định chủ trương đầu tư dự án',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-chuan-bi-dau-tu/nhiem-vu-khao-sat',
            title: 'Quản lý thông tin bước thực hiện nhiệm vụ khảo sát',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-chuan-bi-dau-tu/bao-cao-nghien-cuu-kha-thi',
            title: 'Quản lý thông tin bước thực hiện báo cáo nghiên cứu khả thi dự án',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-chuan-bi-dau-tu/ho-so-thiet-ke-co-so',
            title: 'Quản lý thông tin bước thực hiện hồ sơ thiết kế cơ sở (2 bước)',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-chuan-bi-dau-tu/bao-cao-kinh-te-ky-thuat',
            title: 'Quản lý thông tin bước thực hiện báo cáo kinh tế kỹ thuật (1 bước)',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-chuan-bi-dau-tu/quyet-dinh-dau-tu-du-an',
            title: 'Quản lý thông tin Quyết định đầu tư dự án',
          },
        ],
      },
      {
        to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-thuc-hien-dau-tu',
        title: 'Giai đoạn thực hiện đầu tư',
        children: [
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-thuc-hien-dau-tu/ho-so-thiet-ke-chi-tiet-va-du-toan',
            title: 'Quản lý thông tin bước thực hiện hồ sơ thiết kế chi tiết và dự toán (2 bước)',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-thuc-hien-dau-tu/dau-thau-lua-chon-nha-thau',
            title: 'Quản lý thông tin bước thực hiện đấu thầu, lựa chọn nhà thầu',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-thuc-hien-dau-tu/hop-dong-thuc-hien-du-an',
            title: 'Quản lý thông tin hợp đồng thực hiện dự án',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-thuc-hien-dau-tu/tinh-hinh-thuc-hien-du-an-kho-khan-vuong-mac',
            title: 'Quản lý tình hình thực hiện dự án, các khó khăn, vướng mắc trong quá trình thực hiện dự án',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-thuc-hien-dau-tu/ket-qua-xu-ly-kho-khan-vuong-mac',
            title: 'Quản lý kết quả xử lý các khó khăn, vướng mắc trong quá trình thực hiện dự án',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-thuc-hien-dau-tu/nghiem-thu-ban-giao-san-pham-du-an',
            title: 'Quản lý thông tin nghiệm thu, bàn giao sản phẩm của dự án',
          },
        ],
      },
      {
        to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-ket-thuc-dau-tu',
        title: 'Giai đoạn kết thúc đầu tư',
        children: [
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-ket-thuc-dau-tu/quan-ly-thong-tin-thanh-toan-quyet-toan-du-an',
            title: 'Quản lý thông tin thanh toán, quyết toán dự án',
          },
          {
            to: '/ke-hoach-von/quan-ly-tien-trinh/giai-doan-ket-thuc-dau-tu/quan-ly-thong-tin-van-hanh-va-bao-tri-san-pham-du-an',
            title: 'Quản lý thông tin vận hành và bảo trì sản phẩm của dự án',
          },
        ],
      },
      {
        to: '/ke-hoach-von/quan-ly-tien-trinh/quan-ly-du-an-sau-dau-tu',
        title: 'Quản lý dự án sau đầu tư',
      },
    ]
  },
  {
    to: '/ke-hoach-von/tra-cuu-ho-so',
    title: 'Tra cứu hồ sơ dự án',
    fontIcon: 'bi bi-search',
    children: [
      {
        to: '/ke-hoach-von/tra-cuu-ho-so/danh-sach-du-an',
        title: 'Danh sách dự án',
      },
      {
        to: '/ke-hoach-von/tra-cuu-ho-so/xem-thong-tin-buoc-thuc-hien-giai-doan-chuan-bi-dau-tu',
        title: 'Xem thông tin các bước thực hiện của dự án ở Giai đoạn chuẩn bị đầu tư',
      },
      {
        to: '/ke-hoach-von/tra-cuu-ho-so/xem-thong-tin-buoc-thuc-hien-giai-doan-thuc-hien-dau-tu',
        title: 'Xem thông tin các bước thực hiện của dự án ở Giai đoạn thực hiện đầu tư',
      },
      {
        to: '/ke-hoach-von/tra-cuu-ho-so/xem-thong-tin-buoc-thuc-hien-giai-doan-ket-thuc-dau-tu',
        title: 'Xem thông tin các bước thực hiện của dự án ở Giai đoạn kết thúc đầu tư',
      },
    ],
  },
  {
    to: '/ke-hoach-von/theo-doi-dieu-hanh',
    title: 'Theo dõi điều hành dự án',
    fontIcon: 'bi bi-graph-up',
    children: [
      {
        to: '/ke-hoach-von/theo-doi-dieu-hanh/theo-doi-tinh-hinh-thuc-hien-du-an',
        title: 'Theo dõi tình hình thực hiện dự án',
      },
      {
        to: '/ke-hoach-von/theo-doi-dieu-hanh/theo-doi-tinh-hinh-kho-khan-vuong-mac-du-an',
        title: 'Theo dõi tình hình khó khăn, vướng mắc của dự án',
      },
      {
        to: '/ke-hoach-von/theo-doi-dieu-hanh/theo-doi-tinh-hinh-nghiem-thu-hoan-thanh-du-an',
        title: 'Theo dõi tình hình nghiệm thu hoàn thành dự án',
      },
      {
        to: '/ke-hoach-von/theo-doi-dieu-hanh/quan-ly-noi-dung-thong-bao',
        title: 'Quản lý nội dung thông báo',
      },
      {
        to: '/ke-hoach-von/theo-doi-dieu-hanh/thong-bao-cap-nhat-xu-ly-cho-buoc-thuc-hien-du-an',
        title: 'Thông báo cập nhật xử lý cho bước thực hiện dự án',
      },
    ],
  },
  // NOTE: "Danh mục hệ thống", "Lịch sử thao tác hệ thống", "Quản lý eform động"
  // đã được chuyển sang menu Quản trị ở header (MenuInnerSystem.tsx)
];

const SidebarKeHoachVonMenu = () => {
  const { currentUser } = useAuth();
  const currentPermissions = new Set(currentUser?.permissions ?? []);

  const visibleSidebarItems = sidebarKeHoachVonConfig
    .filter(m => !(m as any).requiredAny || hasAny(currentPermissions, (m as any).requiredAny))
    .map(m => ({
      ...m,
      children: (m.children ?? []).filter(c =>
        !(c as any).requiredAll || hasAll(currentPermissions, (c as any).requiredAll)
      ).map(c => ({
        ...c,
        children: (c?.children ?? []).filter(gc =>
          !(gc as any).requiredAll || hasAll(currentPermissions, (gc as any).requiredAll)
        ),
      })),
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
              if (child.children && child.children.length > 0) {
                return (
                  <SidebarMenuItemWithSub
                    key={cIdx}
                    to={child.to}
                    title={child.title}
                    hasBullet={true}>
                    {child.children.map((grandChild, gcIdx) => (
                      <SidebarMenuItem
                        key={gcIdx}
                        to={grandChild.to}
                        title={grandChild.title}
                        hasBullet={true}
                      />
                    ))}
                  </SidebarMenuItemWithSub>
                );
              }
              return (
                <SidebarMenuItem
                  key={cIdx}
                  to={child.to}
                  title={child.title}
                  hasBullet={true}
                />
              );
            })}
          </SidebarMenuItemWithSub>
        );
      })}
    </>
  );
};

export { SidebarKeHoachVonMenu };
