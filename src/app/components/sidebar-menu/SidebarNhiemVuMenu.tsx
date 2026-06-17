import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { useAuth } from '@/app/modules/auth';
import { P, R } from '@/data';
import { hasAll, hasAny, uiManage } from '@/utils/utils';

const sidebarNhiemVuConfig = [
  {
    to: '/nhiem-vu/dang-ky-nhiem-vu',
    title: 'Đăng ký nhiệm vụ KHCN',
    fontIcon: 'fa-regular fa-user-plus',
    requiredAny: [
      ...uiManage(R.DotDangKys),
    ],
    children: [
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/dot-dang-ky',
        title: 'Đợt đăng ký nhiệm vụ KHCN',
        requiredAll: [...uiManage(R.DotDangKys)]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/tra-cuu-dot-dang-ky',
        title: 'Tra cứu Đợt đăng ký nhiệm vụ KHCN',
        requiredAll: [P.of(R.DotDangKys, 'View')]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/dat-hang-nhiem-vu',
        title: 'Đăng ký đề xuất/ đặt hàng nhiệm vụ',
        requiredAll: [...uiManage(R.DatHangNhiemVus)]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/xu-ly-dat-hang',
        title: 'Tiếp nhận/ xử lý đơn đăng ký đề xuất/ đặt hàng',
        requiredAll: [P.of(R.DatHangNhiemVus, 'Approve')]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/de-xuat-de-tai',
        title: 'Đề xuất Danh sách đề tài, nhiệm vụ khoa học',
        requiredAll: [...uiManage(R.DeXuatDeTais)]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/tra-cuu-de-xuat-de-tai',
        title: 'Tra cứu Đề xuất đề tài, nhiệm vụ khoa học',
        requiredAll: [P.of(R.DeXuatDeTais, 'View')]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/phe-duyet-de-xuat-de-tai',
        title: 'Phê duyệt danh sách đề tài, nhiệm vụ khoa học',
        requiredAll: [P.of(R.DeXuatDeTais, 'Approve')]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/hoi-dong-tu-van',
        title: 'Thông tin hội đồng/chuyên gia tư vấn xác định nhiệm vụ KH',
        requiredAll: [...uiManage(R.HoiDongTuVans)]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/ket-qua-tu-van',
        title: 'Thông tin Kết quả xác định nhiệm vụ khoa học của Hội đồng tư vấn/Chuyên gia',
        requiredAll: [...uiManage(R.HoiDongTuVans)]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/dang-ky-chu-tri',
        title: 'Đăng ký chủ trì nhiệm vụ KHCN',
        requiredAll: [...uiManage(R.DangKyChuTris)]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/thuyet-minh-khcn',
        title: 'Thông tin thuyết minh nhiệm vụ KHCN',
        requiredAll: [...uiManage(R.ThuyetMinhNhiemVus)]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/thuyet-minh-xhnv',
        title: 'Thông tin thuyết minh nhiệm vụ KHCN XHNV',
        requiredAll: [...uiManage(R.ThuyetMinhNhiemVus)]
      },
      {
        to: '/nhiem-vu/dang-ky-nhiem-vu/thuyet-minh-sxtn',
        title: 'Thông tin thuyết minh dự án sản xuất thử nghiệm',
        requiredAll: [...uiManage(R.ThuyetMinhNhiemVus)]
      },
    ]
  },

  {
    to: '/nhiem-vu/xet-duyet-chu-nhiem',
    title: 'Xét duyệt chủ nhiệm đề tài',
    fontIcon: 'fa-regular fa-user-check',
    requiredAny: [
      ...uiManage(R.PhieuDanhGiaNhanXets),
    ],
    children: [
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/bien-ban-mo-ho-so',
        title: 'Thông tin Biên bản mở hồ sơ đăng ký tuyển chọn tổ chức/ cá nhân chủ trì nhiệm vụ KH&CN',
        requiredAll: [...uiManage(R.BienBanMoHoSos)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/hoi-dong-tuyen-chon',
        title: 'Thông tin Hội đồng xét tuyển chủ nhiệm đề tài, nhiệm vụ KHCN',
        requiredAll: [...uiManage(R.HoiDongTuyenChons)]
      },

      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/danh-gia-khcn',
        title: 'Thông tin Đánh giá hồ sơ nhiệm vụ KH&CN',
        requiredAll: [...uiManage(R.PhieuDanhGiaNhanXets)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/danh-gia-xhnv',
        title: 'Thông tin Đánh giá hồ sơ nhiệm vụ XHNV',
        requiredAll: [...uiManage(R.PhieuDanhGiaNhanXets)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/nhan-xet-khcn',
        title: 'Thông tin Nhận xét hồ sơ nhiệm vụ KHCN',
        requiredAll: [...uiManage(R.PhieuDanhGiaNhanXets)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/nhan-xet-xhnv',
        title: 'Thông tin Nhận xét hồ sơ nhiệm vụ XHNV',
        requiredAll: [...uiManage(R.PhieuDanhGiaNhanXets)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/ra-soat-khcn',
        title: 'Thông tin Xác nhận rà soát, chỉnh sửa, hồ sơ nhiệm vụ KH&CN',
        requiredAll: [...uiManage(R.HoanThienHoSos)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/ra-soat-xhnv',
        title: 'Thông tin Xác nhận rà soát, chỉnh sửa, hồ sơ nhiệm vụ XHNV',
        requiredAll: [...uiManage(R.HoanThienHoSos)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/bien-ban-kiem-phieu',
        title: 'Thông tin Kiểm phiếu đánh giá hồ sơ đăng ký tuyển chọn/ giao trực tiếp tổ chức và cá nhân thực hiện nhiệm vụ KH&CN',
        requiredAll: [...uiManage(R.BienBanKiemPhieus)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/ket-qua-xet-chon',
        title: 'Thông tin Kết quả xét chọn chủ nhiệm',
        requiredAll: [...uiManage(R.BienBanKiemPhieus)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/tu-danh-gia',
        title: 'Thông tin Kết quả tự đánh giá đề tài NCKH',
        requiredAll: [...uiManage(R.HoanThienHoSos)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/to-trinh-phe-duyet',
        title: 'Thông tin Tờ trình phê duyệt đề tài, nhiệm vụ khoa học và chỉ định/xét tuyển chủ nhiệm đề tài',
        requiredAll: [...uiManage(R.ToTrinhPheDuyets)]
      },
      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/quyet-dinh-phe-duyet',
        title: 'Thông tin Quyết định phê duyệt đề tài, nhiệm vụ khoa học và chỉ định/xét tuyển chủ nhiệm đề tài',
        requiredAll: [...uiManage(R.QuyetDinhPheDuyets)]
      },
      // {
      //   to: '/nhiem-vu/xet-duyet-chu-nhiem/tu-danh-gia',
      //   title: 'Thông tin Kết quả xác định nhiệm vụ khoa học của Hội đồng tư vấn/Chuyên gia',
      //   requiredAll: [P.of(R.IndustrialParks, 'View')]
      // },

      {
        to: '/nhiem-vu/xet-duyet-chu-nhiem/hop-dong-khoa-hoc',
        title: 'Thông tin Giao nhiệm vụ thực hiện nhiệm vụ KH&CN',
        requiredAll: [...uiManage(R.HopDongKhoaHocs)]
      },
    ]
  },
  {
    to: '/nhiem-vu/thuc-hien-nhiem-vu',
    title: 'Thực hiện nhiệm vụ NCKN',
    fontIcon: 'fa-regular fa-chart-user',
    requiredAny: [P.of(R.HoSoThamDinhs, 'Create'), P.of(R.HopDongKhoaHocs, 'View')],
    children: [
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu/don-vi-phoi-hop',
        title: 'Thông tin Phối hợp thực hiện nhiệm vụ KH&CN ',
        requiredAll: [...uiManage(R.DonViPhoiHops)]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu/noi-dung',
        title: 'Thông tin Nội dung',
        requiredAll: [...uiManage(R.HoSoThamDinhs)]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu/du-toan-kinh-phi',
        title: 'Thông tin Dự toán kinh phí',
        requiredAll: [...uiManage(R.HoSoThamDinhs)]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu/hoi-dong-tham-dinh',
        title: 'Thông tin Hội đồng/Cán bộ thẩm định',
        requiredAll: [...uiManage(R.HoiDongThamDinhs)]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu/kqtd-noi-dung',
        title: 'Thông tin Kết quả thẩm định nội dung',
        requiredAll: [...uiManage(R.BienBanThamDinhs)]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu/kqtd-kinh-phi',
        title: 'Thông tin Kết quả thẩm định Kinh phí',
        requiredAll: [...uiManage(R.BienBanThamDinhs)]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu/quyet-dinh-trien-khai',
        title: 'Thông tin Quyết định triển khai đề tài, nhiệm vụ KH',
        requiredAll: [...uiManage(R.QuyetDinhTrienKhais)]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu/hop-dong-trien-khai',
        title: 'Thông tin Hợp đồng triển khai nhiệm vụ KHCN',
        requiredAll: [...uiManage(R.HopDongKhoaHocs)]
      },
      {
        to: '/nhiem-vu/thuc-hien-nhiem-vu/tra-cuu-hop-dong-trien-khai',
        title: 'Tra cứu Hợp đồng triển khai nhiệm vụ KHCN',
        requiredAll: [P.of(R.HopDongKhoaHocs, 'View')]
      },
    ]
  },
  {
    to: '/nhiem-vu/trien-khai-thuc-hien',
    title: 'Triển khai thực hiện',
    fontIcon: 'fa-regular fa-clapperboard-play',
    requiredAny: [
      P.of(R.BaoCaoTienDos, 'Create'),
    ],
    children: [
      {
        to: '/nhiem-vu/trien-khai-thuc-hien/bao-cao-tien-do',
        title: 'Thông tin Kết quả công việc theo tiến độ thực hiện',
        requiredAll: [...uiManage(R.BaoCaoTienDos)]
      },
      {
        to: '/nhiem-vu/trien-khai-thuc-hien/bao-cao-giai-ngan',
        title: 'Thông tin Tiến độ giải ngân theo hợp đồng',
        requiredAll: [...uiManage(R.BaoCaoGiaiNgans)]
      },
      {
        to: '/nhiem-vu/trien-khai-thuc-hien/ke-hoach-hop-dong',
        title: 'Thông tin Kế hoạch thực hiện của hợp đồng',
        requiredAll: [...uiManage(R.KeHoachs)]
      },
      {
        to: '/nhiem-vu/trien-khai-thuc-hien/dieu-chinh-hop-dong',
        title: 'Thông tin Kế hoạch điều chỉnh của hợp đồng',
        requiredAll: [...uiManage(R.DieuChinhHopDongs)]
      },
      {
        to: '/nhiem-vu/trien-khai-thuc-hien/kiem-tra-dinh-ky',
        title: 'Thông tin Thông tin kiểm tra định kỳ',
        requiredAll: [...uiManage(R.KiemTraDinhKys)]
      },
      {
        to: '/nhiem-vu/trien-khai-thuc-hien/nghiem-thu-khoi-luong',
        title: 'Thông tin Phê duyệt khối lượng CV hoàn thành',
        requiredAll: [...uiManage(R.NghiemThuKhoiLuongs)]
      },
    ]
  },
  {
    to: '/nhiem-vu/nghiem-thu-thanh-ly',
    title: 'Nghiệm thu và thanh lý hợp đồng',
    fontIcon: 'fa-regular fa-money-check-dollar-pen',
    requiredAny: [
      ...uiManage(R.SanPhamNghiemThus),
    ],
    children: [
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/san-pham-nghiem-thu',
        title: 'Thông tin Sản phẩm và kết quả đạt được',
        requiredAll: [...uiManage(R.SanPhamNghiemThus)]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/hdnt-co-so',
        title: 'Thông tin Hội đồng/Chuyên gia nghiệm thu cơ sở',
        requiredAll: [...uiManage(R.HoiDongNghiemThus)]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/tra-cuu-hdnt-co-so',
        title: 'Tra cứu hồ sơ nghiệm thu cơ sở',
        requiredAll: [P.of(R.HoiDongNghiemThus, 'View')]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/kqdg-co-so',
        title: 'Thông tin Kết quả đánh giá của hội đồng/chuyên gia',
        requiredAll: [...uiManage(R.KetQuaNghiemThus)]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/hdnt-chinh-thuc',
        title: 'Thông tin Hội đồng nghiệm thu chính thức',
        requiredAll: [...uiManage(R.HoiDongNghiemThus)]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/kqdg-chinh-thuc',
        title: 'Thông tin Kết quả đánh giá nghiệm thu của Hội đồng',
        requiredAll: [...uiManage(R.KetQuaNghiemThus)]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/bbnt-co-so',
        title: 'Thông tin Biên bản nghiệm thu cơ sở',
        requiredAll: [...uiManage(R.BienBanNghiemThus)]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/td-sau-nghiem-thu',
        title: 'Thông tin Cán bộ thẩm định sau nghiệm thu',
        requiredAll: [...uiManage(R.ThamDinhSauNghiemThus)]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/hsnt-chinh-thuc',
        title: 'Thông tin Hồ sơ nghiệm thu chính thức',
        requiredAll: [...uiManage(R.HoSoNghiemThus)]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/tra-cuu-hsnt-chinh-thuc',
        title: 'Tra cứu hồ sơ nghiệm thu chính thức',
        requiredAll: [P.of(R.HoSoNghiemThus, 'View')]
      },
      {
        to: '/nhiem-vu/nghiem-thu-thanh-ly/giay-chung-nhan',
        title: 'Thông tin Quản lý chứng nhận đăng ký kết quả nghiên cứu khoa học cấp tỉnh',
        requiredAll: [...uiManage(R.GiayChungNhanKetQuas)]
      },
    ]
  },

  {
    to: '/nhiem-vu/ket-qua-hdkh',
    title: 'Kết quả hoạt động khoa học',
    fontIcon: 'fa-regular fa-clipboard-list-check',
    requiredAny: [
      ...uiManage(R.SanPhamKhoaHocs),
    ],
    children: [
      {
        to: '/nhiem-vu/ket-qua-hdkh/thong-tin-chuyen-giao',
        title: 'Thông tin đề nghị chuyển giao kết quả NCKH',
        requiredAll: [...uiManage(R.ThongTinChuyenGiaos)]
      },
      {
        to: '/nhiem-vu/ket-qua-hdkh/quyet-dinh-pham-vi-chuyen-giao',
        title: 'Thông tin quyết định phạm vi, đối tượng chuyển giao',
        requiredAll: [...uiManage(R.QuyetDinhPhamViChuyenGiaos)]
      },
      {
        to: '/nhiem-vu/ket-qua-hdkh/san-pham-khoa-hoc',
        title: 'Thông tin sản phẩm khoa học',
        requiredAll: [...uiManage(R.SanPhamKhoaHocs)]
      },
      {
        to: '/nhiem-vu/ket-qua-hdkh/phieu-dang-ky-cap-gcn-ket-qua-thuc-hien',
        title: 'Phiếu đăng ký cấp GCN kết quả thực hiện đề tài, nhiệm vụ KH cơ sở',
        requiredAll: [...uiManage(R.PhieuDangKyCapGCNKetQuaThucHiens)]
      },
      {
        to: '/nhiem-vu/ket-qua-hdkh/tra-cuu-phieu-dang-ky-cap-gcn-ket-qua-thuc-hien',
        title: 'Tra cứu phiếu đăng ký cấp GCN kết quả thực hiện đề tài, nhiệm vụ KH cơ sở',
        requiredAll: [P.of(R.PhieuDangKyCapGCNKetQuaThucHiens, 'View')]
      },

    ]
  },
  {
    to: '/nhiem-vu/quan-ly-tai-chinh',
    title: 'Quản lý tài chính',
    fontIcon: 'fa-regular fa-money-bill-transfer',
    requiredAny: [
      ...uiManage(R.PhieuDeNghiTamUngs),
      ...uiManage(R.PhieuDeNghiThanhToans),
      ...uiManage(R.ThongTinDaTamUngs),
      ...uiManage(R.ThongTinDaThanhToans),
    ],
    children: [
      {
        to: '/nhiem-vu/quan-ly-tai-chinh/phieu-de-nghi-tam-ung',
        title: 'Phiếu đề nghị tạm ứng',
        requiredAll: [...uiManage(R.PhieuDeNghiTamUngs)]
      },
      {
        to: '/nhiem-vu/quan-ly-tai-chinh/thong-tin-da-tam-ung',
        title: 'Thông tin đã tạm ứng cho đề nghị đã tạm ứng',
        requiredAll: [...uiManage(R.ThongTinDaTamUngs)]
      },
      {
        to: '/nhiem-vu/quan-ly-tai-chinh/phieu-de-nghi-thanh-toan',
        title: 'Phiếu đề nghị thanh toán',
        requiredAll: [...uiManage(R.PhieuDeNghiThanhToans)]
      },
      {
        to: '/nhiem-vu/quan-ly-tai-chinh/tra-cuu-phieu-de-nghi-thanh-toan',
        title: 'Tra cứu phiếu đề nghị thanh toán',
        requiredAll: [P.of(R.PhieuDeNghiThanhToans, 'View')]
      },

      {
        to: '/nhiem-vu/quan-ly-tai-chinh/thong-tin-da-thanh-toan',
        title: 'Thông tin đã thanh toán cho đề nghị đã thanh toán',
        requiredAll: [...uiManage(R.ThongTinDaThanhToans)]
      },
    ]
  },
];

const SidebarNhiemVuMenu = () => {
  const { currentUser } = useAuth();
  const currentPermissions = new Set(currentUser?.permissions ?? []);

  const visibleSidebarItems = sidebarNhiemVuConfig
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

export { SidebarNhiemVuMenu };
