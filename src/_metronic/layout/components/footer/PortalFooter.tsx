import { toAbsoluteUrl } from "@/_metronic/helpers"
import { Link } from "react-router-dom"

export const PortalFooter = () => {
  return (
    <footer className="w-full bg-[#002B49] text-white pt-[80px]">
      <div className="max-w-[1320px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">

        {/* Brand Column */}
        <div className="col-span-1 md:col-span-2 lg:col-span-5 flex flex-col gap-6">
          <Link to="/portal/home" className="flex items-center gap-4 decoration-none group">
            <img
              src={toAbsoluteUrl("media/portal/logo-header.png")}
              alt="Logo"
              className="w-[60px] h-[60px] object-contain"
            />
            <div className="flex flex-col">
              <h2 className="text-white text-[16px] md:text-[18px] font-bold uppercase leading-tight">
                SỞ KHOA HỌC VÀ CÔNG NGHỆ HẢI PHÒNG
              </h2>
              <p className="text-blue-100 text-[12px] md:text-[13px] font-medium leading-tight mt-1 opacity-80">
                Hệ thống quản lý đầu tư, ứng dụng CNTT, CĐS, KHCN trên địa bàn thành phố
              </p>
            </div>
          </Link>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-start gap-3 text-[14px]">
              <i className="fa-regular fa-location-dot mt-1 text-white opacity-80"></i>
              <span className="text-blue-100 opacity-80">Số 1 Phạm Ngũ Lão, Lương Khánh Thiện, Ngô Quyền, Hải Phòng</span>
            </div>
            <div className="flex items-center gap-3 text-[14px]">
              <i className="fa-regular fa-phone text-white opacity-80"></i>
              <span className="text-blue-100 opacity-80">(0225) 3757.101</span>
            </div>
            <div className="flex items-center gap-3 text-[14px]">
              <i className="fa-regular fa-envelope text-white opacity-80"></i>
              <span className="text-blue-100 opacity-80">sokhcn@haiphong.gov.vn</span>
            </div>
          </div>
        </div>

        {/* Quick Link: Nhiệm vụ */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col gap-5">
          <h3 className="text-white text-[18px] font-bold pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-blue-400">
            Nhiệm vụ khoa học
          </h3>
          <ul className="flex flex-col gap-3">
            <li><Link to="#" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Giới thiệu</Link></li>
            <li><Link to="#" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Hướng dẫn</Link></li>
            <li><Link to="#" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Đợt đăng ký</Link></li>
          </ul>
        </div>

        {/* Quick Link: Sáng kiến */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col gap-5">
          <h3 className="text-white text-[18px] font-bold pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-blue-400">
            Sáng kiến khoa học
          </h3>
          <ul className="flex flex-col gap-3">
            <li><Link to="#" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Giới thiệu</Link></li>
            <li><Link to="#" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Hướng dẫn</Link></li>
            <li><Link to="#" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Đợt đăng ký</Link></li>
          </ul>
        </div>

        {/* Quick Link: Dự án */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 flex flex-col gap-5">
          <h3 className="text-white text-[18px] font-bold pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-blue-400">
            Dự án CNTT
          </h3>
          <ul className="flex flex-col gap-3">
            <li><Link to="#" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Giới thiệu</Link></li>
            <li><Link to="#" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Hướng dẫn</Link></li>
            <li><Link to="#" className="text-blue-100 hover:text-white hover:translate-x-1 transition-all inline-block opacity-80">Đợt đăng ký</Link></li>
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-6 bg-black/20">
        <div className="max-w-[1320px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white text-[14px] opacity-80">
            © 2026 Sở KHCN Hải Phòng. All rights Reserved
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
