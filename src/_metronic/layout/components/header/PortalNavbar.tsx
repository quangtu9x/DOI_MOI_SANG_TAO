import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/app/modules/auth"
import { useDMSTRole } from "@/app/hooks/useDMSTRole"
import { P, R } from "@/data"
import { hasAll } from "@/utils/utils"

export const PortalNavbar = () => {
  const { currentUser } = useAuth();
  const { isAdmin, isReviewer } = useDMSTRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // ── Menu Quản trị (chỉ hiện với người có quyền tương ứng) ──
  const perms = new Set(currentUser?.permissions ?? []);
  const adminItems = [
    { label: "Quản lý danh mục", to: "/admins/catalogs/categories", need: [P.of(R.Catalogs, 'View')] },
    { label: "Cấu hình trường thông tin ý tưởng", to: "/admins/catalogs/cau-hinh-truong-y-tuong", need: [P.of(R.Catalogs, 'View')] },
    { label: "Cơ cấu tổ chức", to: "/admins/system-admins/organization-units", need: [P.of(R.OrganizationUnits, 'View')] },
    { label: "Người dùng", to: "/admins/system-admins/users", need: [P.of(R.Users, 'View')] },
    { label: "Vai trò & quyền", to: "/admins/system-admins/roles", need: [P.of(R.Roles, 'View')] },
    { label: "Nhật ký hệ thống", to: "/admins/system-admins/audits", need: [P.of(R.Audits, 'View')] },
  ].filter(item => hasAll(perms, item.need));

  const menuItems = [
    {
      title: "Ý tưởng",
      key: "y-tuong",
      items: [
        { label: "Khởi tạo ý tưởng", to: "/doi-moi/y-tuong" },
        { label: "Tra cứu hồ sơ", to: "/doi-moi/tra-cuu" },
        // Mục cá nhân — chỉ hiện khi đã đăng nhập (CBNV không còn menu Quản lý ĐMST)
        ...(currentUser ? [
          // { label: "Ý tưởng của tôi", to: "/doi-moi-sang-tao/quan-ly-y-tuong/cua-toi" },
          // { label: "Thông báo hệ thống", to: "/doi-moi-sang-tao/thong-bao" },
        ] : []),
        // { label: "Import hàng loạt", to: "/doi-moi/y-tuong?mode=import" },
      ]
    },
    {
      title: "Thư viện ĐMST",
      key: "kho-tri-thuc",
      items: [
        { label: "Dashboard", to: "/doi-moi-sang-tao/kho-tri-thuc/analytics" },
        { label: "Kho tri thức", to: "/doi-moi/kho-tri-thuc" },
        { label: "Thư viện tài liệu", to: "/doi-moi-sang-tao/kho-tri-thuc/thu-vien" },
        { label: "Danh bạ chuyên gia", to: "/doi-moi-sang-tao/kho-tri-thuc/chuyen-gia" },
        { label: "Cộng đồng", to: "/doi-moi-sang-tao/kho-tri-thuc/cong-dong" },
        { label: "Bảng tin", to: "/doi-moi-sang-tao/kho-tri-thuc/news-feed" },
        { label: "Tìm kiếm tri thức", to: "/doi-moi-sang-tao/kho-tri-thuc/tim-kiem" },
      ]
    },
    // Menu Quản lý ĐMST — ẨN TOÀN BỘ với tài khoản không có quyền quản lý
    // (chỉ hiện với Lãnh đạo đơn vị / Lãnh đạo TCT / Quản trị — isReviewer từ vai trò thật;
    //  từng mục bên trong tiếp tục lọc theo ReviewerRoute/AdminRoute của DoiMoiSangTaoRoutes.tsx)
    ...(currentUser && isReviewer ? [{
      title: "Quản lý ĐMST",
      key: "quan-ly-dmst",
      items: [
        { label: "Dashboard", to: "/doi-moi-sang-tao/dashboard", show: true },
        { label: "Danh sách ý tưởng", to: "/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach", show: isReviewer },
        // { label: "Ý tưởng của tôi", to: "/doi-moi-sang-tao/quan-ly-y-tuong/cua-toi", show: true },
        { label: "Chờ phê duyệt", to: "/doi-moi-sang-tao/quy-trinh-duyet/cho-duyet", show: isReviewer },
        { label: "Sơ đồ quy trình", to: "/doi-moi-sang-tao/quy-trinh-duyet/so-do", show: true },
        { label: "Thông báo hệ thống", to: "/doi-moi-sang-tao/thong-bao", show: true },
        { label: "Báo cáo & thống kê", to: "/doi-moi-sang-tao/bao-cao", show: isReviewer },
        { label: "Quản lý người dùng", to: "/doi-moi-sang-tao/quan-ly-nguoi-dung", show: isAdmin },
      ].filter(item => item.show),
    }] : []),
    // {
    //   title: "Báo cáo",
    //   key: "bao-cao",
    //   items: [
    //     { label: "Báo cáo", to: "/doi-moi-sang-tao/bao-cao", show: isReviewer },
    //     { label: "Báo cáo tổng hợp đầy đủ", to: "/doi-moi-sang-tao/bao-cao-day-du", show: isReviewer },
    //   ].filter(item => item.show),
    // },
    // Menu Quản trị hệ thống — CHỈ hiện với tài khoản có vai trò Quản trị (isAdmin),
    // các tài khoản khác (kể cả lãnh đạo có vài quyền xem danh mục) ẩn toàn bộ.
    ...(currentUser && isAdmin && adminItems.length > 0 ? [{
      title: "Quản trị",
      key: "quan-tri",
      items: adminItems.map(({ label, to }) => ({ label, to })),
    }] : []),
  ].filter(group => group.items.length > 0);

  return (
    <div className="w-full sticky top-0 z-[999] bg-portal-primary shadow-lg border-t border-white/10">
      {/* Mobile Toggle Button (Visible only on mobile) */}
      <div className="lg:hidden max-w-[1440px] mx-auto px-4 py-3 flex justify-end">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white text-2xl flex items-center gap-2 uppercase font-bold text-sm"
        >
          Menu <i className={`fa-regular ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <ul className="flex items-center">
            <li>
              <Link to="/doi-moi/trang-chu" className="flex items-center h-[50px] px-5 text-white hover:bg-portal-hover transition-colors font-bold text-[14px] border-r border-white/5">
                Trang chủ
              </Link>
            </li>
            {/* 
            <li>
              <Link to="/doi-moi-sang-tao/dashboard" className="flex items-center h-[50px] px-5 text-white hover:bg-portal-hover transition-colors font-bold text-[14px] border-r border-white/5">
                Dashboard
              </Link>
            </li> */}

            {menuItems.map((item) => (
              <li key={item.key} className="relative group">
                <button className="flex items-center h-[50px] px-5 text-white hover:bg-portal-hover transition-colors font-bold text-[14px] border-r border-white/5">
                  {item.title} <i className="fa-regular fa-chevron-down ml-2 text-[10px] text-white"></i>
                </button>
                <ul className="absolute top-full left-0 w-56 bg-white shadow-2xl py-2 hidden group-hover:block z-50 ">
                  {item.items.map((subItem, index) => (
                    <li key={index}>
                      <Link to={subItem.to} className="block px-5 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-portal-primary">
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            
            <li>
              <Link to="/doi-moi-sang-tao/thong-bao" className="flex items-center h-[50px] px-5 text-white hover:bg-portal-hover transition-colors border-r border-white/5">
                <i className="fa-regular fa-bell text-[18px]"></i>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="bg-white lg:hidden text-portal-primary py-4 border-t border-gray-200 px-4 shadow-xl">
          <ul className="space-y-2">
            <li>
              <Link to="/doi-moi/trang-chu" className="bg-gray-100 block py-2 px-3 font-bold uppercase text-sm rounded transition-colors">
                Trang chủ
              </Link>
            </li>
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => toggleSubmenu(item.key)}
                  className="w-full bg-gray-100 flex items-center justify-between py-2 px-3 font-bold uppercase text-sm rounded transition-colors"
                >
                  {item.title}
                  <i className={`fa-regular ${openSubmenus[item.key] ? 'fa-minus' : 'fa-plus'}`}></i>
                </button>
                {openSubmenus[item.key] && (
                  <ul className="mt-1 ml-4 space-y-1 border-l-2 border-portal-primary/20">
                    {item.items.map((subItem, index) => (
                      <li key={index}>
                        <Link
                          to={subItem.to}
                          className="block py-2 px-4 text-sm text-gray-600 hover:text-portal-primary hover:bg-gray-50 rounded"
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {!currentUser && (
            <div className="flex flex-col gap-2 mt-4">
              <Link to="/auth/login" className="bg-portal-primary text-white py-2.5 rounded font-bold text-center text-sm uppercase hover:bg-portal-hover transition-colors">
                Đăng nhập
              </Link>
              <Link to="/auth/registration" className="bg-portal-secondary text-white py-2.5 rounded font-bold text-center text-sm uppercase hover:bg-red-700 transition-colors">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
