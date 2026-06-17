import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/app/modules/auth"

export const PortalNavbar = () => {
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuItems = [
    {
      title: "Ý tưởng",
      key: "y-tuong",
      items: [
        { label: "Giới thiệu", to: "#" },
        { label: "Hướng dẫn", to: "#" },
        { label: "Khởi tạo ý tưởng", to: "/portal/y-tuong" },
        { label: "Import ý tưởng hàng loạt", to: "/portal/y-tuong?mode=import" },
      ]
    },
    {
      title: "Nhiệm vụ khoa học",
      key: "nhiem-vu",
      items: [
        { label: "Giới thiệu", to: "#" },
        { label: "Hướng dẫn", to: "#" },
        { label: "Đợt đăng ký", to: "#" },
      ]
    },
    {
      title: "Sáng kiến khoa học",
      key: "sang-kien",
      items: [
        { label: "Giới thiệu", to: "#" },
        { label: "Hướng dẫn", to: "#" },
        { label: "Đợt đăng ký", to: "#" },
      ]
    },
    {
      title: "Dự án CNTT",
      key: "du-an",
      items: [
        { label: "Giới thiệu", to: "#" },
        { label: "Hướng dẫn", to: "#" },
        { label: "Đăng ký vốn", to: "#" },
      ]
    }
  ];

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
              <Link to="/portal/home" className="flex items-center h-[50px] px-5 text-white hover:bg-portal-hover transition-colors font-bold text-[14px] border-r border-white/5">
                Trang chủ
              </Link>
            </li>

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
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="bg-white lg:hidden text-portal-primary py-4 border-t border-gray-200 px-4 shadow-xl">
          <ul className="space-y-2">
            <li>
              <Link to="/portal/home" className="bg-gray-100 block py-2 px-3 font-bold uppercase text-sm rounded transition-colors">
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
