import { useState } from "react"
import { toAbsoluteUrl } from "@/_metronic/helpers"
import { Link } from "react-router-dom"
import { useAuth } from "@/app/modules/auth"
import { FILE_URL } from "@/utils/baseAPI"
import { UserType } from "@/models"

export const PortalHeader = () => {
  const { currentUser, logout } = useAuth();
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const isAdmin = currentUser?.type == UserType.Admin;

  return (
    <header className="w-full relative shadow-md bg-header-background z-[1000]">
      {/* Top Header Section with Background */}
      <div
        className="relative py-4 lg:py-6 w-full bg-[length:1000px_auto] bg-no-repeat scale-100 bg-center"
        style={{ backgroundImage: `url(${toAbsoluteUrl("media/portal/bg-header.png")})` }}
      >
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between">
          {/* Logo & Title Area */}
          <Link to="/portal/home" className="flex items-center gap-3 lg:gap-5 decoration-none group">
            <img
              src={toAbsoluteUrl("media/portal/logo-header.png")}
              alt="Logo"
              className="w-[50px] h-[50px] lg:w-[75px] lg:h-[75px] object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <h1 className="text-portal-primary text-[14px] md:text-[18px] lg:text-[20px] font-bold uppercase leading-tight drop-shadow-md">
                TỔNG CÔNG TY HÀNG KHÔNG VIỆT NAM - CTCP
              </h1>
              <p className="text-portal-secondary text-[10px] md:text-[14px] lg:text-[16px] font-medium leading-tight mt-1 drop-shadow-sm">
                Hệ thống phần mềm quản trị đổi mới sáng tạo 
              </p>
            </div>
          </Link>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {
              currentUser ? (
                <div
                  className="relative group"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="flex items-center justify-end gap-2 cursor-pointer bg-white hover:bg-gray-50 py-1.5 px-3 rounded-full border border-gray-200 transition-colors shadow-sm">
                    {currentUser.imageUrl ? (
                      <img
                        src={`${FILE_URL}${currentUser.imageUrl}`}
                        alt={currentUser.fullName || 'Avatar'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <i className="fa-solid fa-circle-user text-[32px] text-[#b1b1b1]"></i>
                    )}
                    <span className="text-[15px] text-[#2A3342] font-medium hidden sm:block">
                      {currentUser.fullName || currentUser.userName || 'User'}
                    </span>
                    <i className="fa-regular fa-chevron-down text-[#2A3342] text-xs ml-1"></i>
                  </div>

                  {/* Hover Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full pt-2 z-[1000]">
                      <div className="w-60 bg-white rounded-md shadow-lg border border-gray-200 py-2">
                        {currentUser?.type !== UserType.FromPortal && (
                          <Link
                            to={"/admin-dashboard"}
                            className="flex items-center px-4 py-2.5 text-gray-700 hover:text-portal-primary hover:bg-blue-50 transition-colors duration-200"
                          >
                            <i className="fa-regular fa-gear mr-3 w-4 text-center pointer-events-none"></i>
                            <span>Truy cập trang quản trị</span>
                          </Link>
                        )}
                        <Link
                          to="/portal/profile"
                          className="flex items-center px-4 py-2.5 text-gray-700 hover:text-portal-primary hover:bg-blue-50 transition-colors duration-200"
                        >
                          <i className="fa-regular fa-user mr-3 w-4 text-center pointer-events-none"></i>
                          <span>Thông tin tài khoản</span>
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={logout}
                          className="flex items-center w-full px-4 py-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 text-left"
                        >
                          <i className="fa-solid fa-arrow-right-from-bracket mr-3 w-4 text-center pointer-events-none"></i>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth/login" className="bg-white text-portal-primary px-5 py-2 rounded font-bold text-sm uppercase !hover:bg-gray-300 transition-all flex items-center gap-2">
                    <i className="fa-regular fa-right-to-bracket !text-portal-primary"></i> Đăng nhập
                  </Link>
                  <Link to="/auth/registration" className="bg-white text-portal-primary px-5 py-2 rounded font-bold text-sm uppercase !hover:bg-gray-300 transition-all flex items-center gap-2">
                    <i className="fa-regular fa-user-plus !text-portal-primary"></i> Đăng ký
                  </Link>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </header>
  )
}