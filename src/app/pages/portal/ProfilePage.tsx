import React, { useState, useEffect } from "react"
import { Button, Input, Avatar, message, Table } from "antd"
import {
    User,
    Camera,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
    Settings,
    FileText,
    Star,
    Key,
    UserCircle,
    Layout,
    Lightbulb
} from "lucide-react"
import { getAuth, useAuth } from "@/app/modules/auth"
import { useNavigate, useSearchParams } from "react-router-dom"
import { API_URL, FILE_URL, requestPUT } from "@/utils/baseAPI"
import axios from "axios"
import { DEFAULT_IMAGE } from "@/data"
import { IResult, UserPurpose, UserType } from "@/models"
import clsx from "clsx"
import { InitiativeSection } from "./components/profile/InitiativeSection"
import { ITProjectSection } from "./components/profile/ITProjectSection"
import { ResearchSection } from "./components/profile/ResearchSection"
import { YTuongSection } from "./components/profile/YTuongSection"

type SectionType = "account" | "y-tuong"
type AccountTabType = "personal" | "password"
type StatusType = "pending" | "approved" | "rejected"

const profileSections: SectionType[] = ["account", "y-tuong"]

const isProfileSection = (section: string | null): section is SectionType =>
    !!section && profileSections.includes(section as SectionType)

export const ProfilePage = () => {
    const { currentUser, setCurrentUser, logout } = useAuth();
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [activeSection, setActiveSection] = useState<SectionType>("account")
    const [activeAccountTab, setActiveAccountTab] = useState<AccountTabType>("personal")
    const [activeStatusTab, setActiveStatusTab] = useState<StatusType>("pending")


    const [previewImage, setPreviewImage] = useState<string>(currentUser?.imageUrl || "")
    const [uploading, setUploading] = useState(false)
    const token = getAuth()?.token;

    const [profileForm, setProfileForm] = useState({
        id: currentUser?.id || "",
        fullName: currentUser?.fullName || "",
        email: currentUser?.email || "",
        phoneNumber: currentUser?.phoneNumber || "",
        imageUrl: currentUser?.imageUrl || "",
    })

    const [passwordForm, setPasswordForm] = useState({
        password: "",
        newPassword: "",
        confirmNewPassword: "",
    })

    useEffect(() => {
        if (currentUser) {
            setProfileForm({
                id: currentUser.id,
                fullName: currentUser.fullName || "",
                email: currentUser.email || "",
                phoneNumber: currentUser.phoneNumber || "",
                imageUrl: currentUser.imageUrl || "",
            })
            setPreviewImage(currentUser.imageUrl || "")
        }
    }, [currentUser])

    useEffect(() => {
        const section = searchParams.get("section")
        setActiveSection(isProfileSection(section) ? section : "account")
    }, [searchParams])

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const form = new FormData()
        form.append("files", file)

        try {
            setUploading(true)
            const res = await axios.post(
                `${API_URL}/api/v1/attachments/public`,
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (res.status === 200) {
                const newUrl = res?.data?.data[0]?.url
                setPreviewImage(newUrl)
                message.success("Ảnh đại diện đã được cập nhật")
            }
        } catch (err) {
            message.error("Upload ảnh thất bại")
        } finally {
            setUploading(false)
        }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await requestPUT<IResult<string>>(`personal/profile`, { ...profileForm, imageUrl: previewImage }, 'neutral')
            if (response?.status === 200) {
                message.success("Thông tin tài khoản đã được cập nhật")
                setCurrentUser({ ...currentUser!, ...profileForm, imageUrl: previewImage })
            }
        } catch (error) {
            message.error("Cập nhật thất bại")
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            message.error("Xác nhận mật khẩu không khớp")
            return
        }
        setIsLoading(true)
        try {
            const response = await requestPUT<IResult<string>>(`personal/change-password`, passwordForm, 'neutral')
            if (response?.status === 200) {
                message.success("Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.")
                logout()
                navigate("/auth/login")
            }
        } catch (error) {
            message.error("Đổi mật khẩu thất bại")
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="w-full">
            <div className="max-w-[1440px] mx-auto px-4 py-8 lg:py-16">
                <div className="flex bg-[#F8F9FA] min-h-screen rounded-2xl mb-12">
                    {/* Sidebar */}
                    <aside className="w-80  border-r border-gray-200 flex flex-col pt-5">
                        <div className="px-6 mb-10">
                            <nav className="space-y-1">
                                {[
                                    { id: "account", label: "Thông tin tài khoản", icon: Settings },
                                    { id: "y-tuong", label: "Ý tưởng của tôi", icon: Lightbulb },
                                    // "Nhiệm vụ NCKH", "Sáng kiến", "Dự án CNTT" — ẩn, giai đoạn sau
                                ].map((item) => {
                                    const isVisible = !(item as any).purpose
                                        || currentUser?.type !== UserType.FromPortal
                                        || currentUser?.purposes?.includes((item as any).purpose)

                                    if (!isVisible) return null

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setSearchParams({ section: item.id })}
                                            className={clsx(
                                                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all group relative",
                                                activeSection === item.id
                                                    ? "bg-[#E7F0FA] text-[#0A65CC]"
                                                    : "text-dark-400 hover:bg-gray-50 hover:text-gray-900"
                                            )}
                                        >
                                            {activeSection === item.id && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0A65CC]" />}
                                            <item.icon size={20} className={activeSection === item.id ? "text-[#0A65CC]" : "text-dark-400 group-hover:text-dark-600"} />
                                            {item.label}
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>

                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 p-5">
                        <div className="mb-5">

                            {/* Navigation Tabs */}
                            {(activeSection === "account") && (
                                <div className="flex border-b border-gray-200 mb-8">
                                    {activeSection === "account" ? (
                                        <>
                                            <button
                                                onClick={() => setActiveAccountTab("personal")}
                                                className={clsx(
                                                    "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all",
                                                    activeAccountTab === "personal" ? "border-[#0A65CC] text-[#0A65CC]" : "border-transparent text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                <UserCircle size={18} /> Thông tin cá nhân
                                            </button>
                                            <button
                                                onClick={() => setActiveAccountTab("password")}
                                                className={clsx(
                                                    "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all",
                                                    activeAccountTab === "password" ? "border-[#0A65CC] text-[#0A65CC]" : "border-transparent text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                <Key size={18} /> Đổi mật khẩu
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setActiveStatusTab("pending")}
                                                className={clsx(
                                                    "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all",
                                                    activeStatusTab === "pending" ? "border-[#0A65CC] text-[#0A65CC]" : "border-transparent text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                <Clock size={18} /> Hồ sơ chờ duyệt
                                            </button>
                                            <button
                                                onClick={() => setActiveStatusTab("approved")}
                                                className={clsx(
                                                    "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all",
                                                    activeStatusTab === "approved" ? "border-[#0A65CC] text-[#0A65CC]" : "border-transparent text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                <CheckCircle size={18} /> Hồ sơ đã duyệt
                                            </button>
                                            <button
                                                onClick={() => setActiveStatusTab("rejected")}
                                                className={clsx(
                                                    "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all",
                                                    activeStatusTab === "rejected" ? "border-[#0A65CC] text-[#0A65CC]" : "border-transparent text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                <XCircle size={18} /> Hồ sơ từ chối
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Account Settings Content */}
                            {activeSection === "account" && activeAccountTab === "personal" && (
                                <div className=" rounded-xl shadow-2xs border border-gray-100 p-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6">Thông tin liên hệ</h2>
                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="flex flex-col items-center mb-8 bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200">
                                            <div className="relative group">
                                                <Avatar size={100} src={previewImage ? FILE_URL + previewImage : DEFAULT_IMAGE.SQUARE} className="border-4 border-white shadow-sm" />
                                                <label htmlFor="avatar-upload-main" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                                    <Camera size={24} />
                                                </label>
                                                <input id="avatar-upload-main" type="file" className="hidden" onChange={handleAvatarChange} />
                                            </div>
                                            <p className="mt-4 text-sm font-bold text-gray-700">Ảnh đại diện</p>
                                            <p className="text-xs text-gray-400">Định dạng JPG, PNG hoặc GIF. Tối đa 5MB.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Họ và tên</label>
                                                <Input value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} className="h-12 rounded-lg border-gray-200" placeholder="Nhập họ và tên" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Tên đăng nhập (Email)</label>
                                                <div className="relative">
                                                    <Input value={profileForm.email} disabled className="h-12 rounded-lg bg-gray-50 border-gray-200 pl-10" />
                                                    <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Số điện thoại</label>
                                                <Input value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} className="h-12 rounded-lg border-gray-200" placeholder="Nhập số điện thoại" />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                                            <Button type="primary" htmlType="submit" loading={isLoading} className="bg-[#0A65CC] h-12 px-10 rounded-lg font-bold shadow-md hover:bg-[#084d9c] transition-all">
                                                Lưu thay đổi
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeSection === "account" && activeAccountTab === "password" && (
                                <div className=" rounded-xl shadow-2xs border border-gray-100 p-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6">Đổi mật khẩu</h2>
                                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Mật khẩu hiện tại</label>
                                            <Input.Password className="h-12 rounded-lg border-gray-200" value={passwordForm.password} onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Mật khẩu mới</label>
                                                <Input.Password className="h-12 rounded-lg border-gray-200" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Xác nhận mật khẩu</label>
                                                <Input.Password className="h-12 rounded-lg border-gray-200" value={passwordForm.confirmNewPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                                            <Button type="primary" htmlType="submit" loading={isLoading} className="bg-[#0A65CC] h-12 px-10 rounded-lg font-bold shadow-md hover:bg-[#084d9c] transition-all">
                                                Cập nhật mật khẩu
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Tables for other sections */}
                            {activeSection === "y-tuong" && (
                                <YTuongSection />
                            )}

                            {(activeSection as string) === "initiative" && (
                                <InitiativeSection />
                            )}

                            {(activeSection as string) === "it-project" && (
                                <ITProjectSection />
                            )}

                            {(activeSection as string) === "research" && (
                                <ResearchSection />
                            )}
                        </div>
                    </main>
                </div>
            </div>

        </div>

    )
}
