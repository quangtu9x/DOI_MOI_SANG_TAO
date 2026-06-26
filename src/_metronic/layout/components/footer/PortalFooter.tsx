import { toAbsoluteUrl } from "@/_metronic/helpers"
import { Link } from "react-router-dom"
import { useDMSTRole } from "@/app/hooks/useDMSTRole"

export const PortalFooter = () => {
  const { isReviewer } = useDMSTRole();

  return (
    <footer className="w-full bg-[#002B49] text-white pt-[80px]">
      <div className="max-w-[1320px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">

        {/* Brand Column */}
        <div className="col-span-1 md:col-span-2 lg:col-span-5 flex flex-col gap-6">
          <Link to="/doi-moi/trang-chu" className="flex items-center gap-4 decoration-none group">
            <img
              src={toAbsoluteUrl("media/portal/logo-header.png")}
              alt="Logo"
              className="w-[60px] h-[60px] object-contain"
            />
            <div className="flex flex-col">
              <h2 className="text-white text-[16px] md:text-[18px] font-bold uppercase leading-tight">
                TỔNG CÔNG TY HÀNG KHÔNG VIỆT NAM - CTCP
              </h2>
              <p className="text-blue-100 text-[12px] md:text-[13px] font-medium leading-tight mt-1 opacity-80">
                Hệ thống phần mềm quản trị đổi mới sáng tạo
              </p>
            </div>
          </Link>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-start gap-3 text-[14px]">
              <i className="fa-regular fa-location-dot mt-1 text-white opacity-80"></i>
              <span className="text-blue-100 opacity-80">Số 200 Nguyễn Sơn, Phường Bồ Đề, Hà Nội.</span>
            </div>
            <div className="flex items-center gap-3 text-[14px]">
              <i className="fa-regular fa-phone text-white opacity-80"></i>
              <span className="text-blue-100 opacity-80">(+84-24) 38272289</span>
            </div>
          </div>
        </div>

        {/* Quick Link: Ý tưởng */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col gap-5">
          <h3 className="text-white text-[18px] font-bold pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-blue-400">
            Ý tưởng đổi mới
          </h3>
          <ul className="flex flex-col gap-3">
            <li><Link to="/doi-moi/y-tuong" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Gửi ý tưởng mới</Link></li>
            <li><Link to="/doi-moi/tra-cuu" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Tra cứu hồ sơ</Link></li>
          </ul>
        </div>

        {/* Quick Link: Tài nguyên */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col gap-5">
          <h3 className="text-white text-[18px] font-bold pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-blue-400">
            Tài nguyên
          </h3>
          <ul className="flex flex-col gap-3">
            <li><Link to="/doi-moi/kho-tri-thuc" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Kho tri thức</Link></li>
            {isReviewer && (
              <li><Link to="/doi-moi-sang-tao/quy-trinh-duyet/cho-duyet" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Quy trình phê duyệt</Link></li>
            )}
          </ul>
        </div>

        {/* Quick Link: Hỗ trợ */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 flex flex-col gap-5">
          <h3 className="text-white text-[18px] font-bold pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-blue-400">
            Hỗ trợ
          </h3>
          <ul className="flex flex-col gap-3">
            {isReviewer && (
              <li><Link to="/doi-moi-sang-tao/dashboard" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Trang quản lý</Link></li>
            )}
            <li><Link to="/doi-moi/profile" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Hồ sơ cá nhân</Link></li>
            <li><Link to="/auth/login" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Đăng nhập hệ thống</Link></li>
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-6 bg-black/20">
        <div className="max-w-[1320px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white text-[14px] opacity-80">
            © 2026 Tổng công ty Hàng không Việt Nam - CTCP
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-white opacity-80 hover:text-white transition-opacity">
              <i className="fa-brands fa-facebook-f text-lg text-white opacity-80"></i>
            </Link>
            <Link to="#" className="text-white opacity-80 hover:text-white transition-opacity">
              <i className="fa-brands fa-youtube text-lg text-white opacity-80"></i>
            </Link>
            <Link to="#" className="text-white opacity-80 hover:text-white transition-opacity">
              <i className="fa-regular fa-globe text-lg text-white opacity-80"></i>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
