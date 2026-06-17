import React from "react";
import { BookOpen, Lightbulb, Monitor, Clock, User, Briefcase, MapPin, ChevronRight } from "lucide-react";

// --- Reusable Sub-components ---

interface SectionHeaderProps {
    title: string;
    onViewAll?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onViewAll }) => (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
        <h2 className="text-[#191f33] text-4xl font-medium leading-tight">{title}</h2>
        <button
            onClick={onViewAll}
            className="flex items-center gap-2 border border-[#e7f0fa] hover:bg-[#e7f0fa]/50 transition-colors text-[#0a65cc] font-semibold px-6 py-3 rounded-md"
        >
            Xem tất cả
            <ChevronRight size={20} />
        </button>
    </div>
);

const ResearchTaskCard = () => (
    <div className="bg-white border border-[#e4e5e8] hover:shadow-[0_12px_48px_0_rgba(0,44,109,0.05)] transition-shadow p-6 rounded-lg flex flex-col gap-5 w-full cursor-pointer group">
        <div className="flex flex-col gap-3 w-full">
            <h3 className="text-[#18191c] text-lg font-medium group-hover:text-[#0a65cc] transition-colors line-clamp-2 min-h-[56px]">
                Nghiên cứu xây dựng mô hình quản lý dữ liệu khoa học công nghệ dựa trên nền tảng Cloud Computing
            </h3>
            <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#e7f6ea] text-[#0ba02c] text-xs font-semibold px-2 py-1 rounded-[3px] uppercase">Cấp Thành phố</span>
                <div className="flex items-center gap-1 text-[#767f8c] text-sm">
                    <Clock size={14} />
                    <span>24 tháng</span>
                </div>
            </div>
        </div>
        <div className="flex flex-col gap-3 pt-4 border-t border-[#f1f2f4]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#edeff5] rounded flex items-center justify-center shrink-0">
                    <User size={20} className="text-[#0a65cc]" />
                </div>
                <div className="flex flex-col flex-1">
                    <h4 className="text-[#18191c] text-sm font-medium">Viện Khoa học Công nghệ</h4>
                    <span className="text-[#767f8c] text-xs">Chủ trì thực hiện</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[#0a65cc] font-bold text-sm">500 Tr. VNĐ</span>
                    <span className="text-[#767f8c] text-[10px]">Kinh phí</span>
                </div>
            </div>
        </div>
    </div>
);

const InitiativeCard = () => (
    <div className="bg-white border border-[#e4e5e8] hover:shadow-[0_12px_48px_0_rgba(0,44,109,0.05)] transition-shadow p-6 rounded-lg flex flex-col gap-5 w-full cursor-pointer group">
        <div className="flex flex-col gap-3 w-full">
            <h3 className="text-[#18191c] text-lg font-medium group-hover:text-[#0a65cc] transition-colors line-clamp-2 min-h-[56px]">
                Giải pháp tối ưu hóa quy trình tiếp nhận và xử lý hồ sơ hành chính công trực tuyến cấp độ 4
            </h3>
            <div className="flex items-center gap-3 text-[#767f8c] text-sm">
                <span className="flex items-center gap-1"><Briefcase size={14} /> Công nghệ thông tin</span>
            </div>
        </div>
        <div className="flex flex-col gap-3 pt-4 border-t border-[#f1f2f4]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#fff4e5] rounded flex items-center justify-center shrink-0">
                    <Lightbulb size={20} className="text-[#ff9800]" />
                </div>
                <div className="flex flex-col flex-1">
                    <h4 className="text-[#18191c] text-sm font-medium">Nguyễn Văn A</h4>
                    <span className="text-[#767f8c] text-xs">Người đề xuất</span>
                </div>
            </div>
            <div className="flex items-center gap-1 text-[#767f8c] text-xs">
                <MapPin size={12} />
                <span>Chủ đầu tư: Trung tâm Chuyển đổi số Thành phố</span>
            </div>
        </div>
    </div>
);

const ITProjectCard = () => (
    <div className="bg-white border border-[#e4e5e8] hover:shadow-[0_12px_48px_0_rgba(0,44,109,0.05)] transition-shadow p-6 rounded-lg flex flex-col gap-5 w-full cursor-pointer group">
        <div className="flex flex-col gap-3 w-full">
            <h3 className="text-[#18191c] text-lg font-medium group-hover:text-[#0a65cc] transition-colors line-clamp-2 min-h-[56px]">
                Xây dựng hệ thống cơ sở dữ liệu dùng chung và nền tảng chia sẻ dữ liệu cấp Thành phố (LGSP)
            </h3>
            <div className="flex items-center gap-2">
                <span className="bg-[#e7f0fa] text-[#0a65cc] text-xs font-semibold px-2 py-1 rounded-[3px] uppercase">Phần mềm & CSDL</span>
            </div>
        </div>
        <div className="flex flex-col gap-3 pt-4 border-t border-[#f1f2f4]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#edeff5] rounded flex items-center justify-center shrink-0">
                    <Monitor size={20} className="text-[#0a65cc]" />
                </div>
                <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-1 text-[#767f8c] text-xs">
                        <Clock size={12} />
                        <span>2024 - 2025</span>
                    </div>
                    <h4 className="text-[#18191c] text-sm font-medium mt-0.5">Sở Thông tin và Truyền thông</h4>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[#0a65cc] font-bold text-sm">1.2 Tỷ VNĐ</span>
                    <span className="text-[#767f8c] text-[10px]">Dự toán</span>
                </div>
            </div>
        </div>
    </div>
);

// --- Main Section Component ---

export const PortalFeaturedSections = () => {
    return (
        <div className="w-full bg-white py-20 px-4">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-24">

                {/* 1. Nhiệm vụ NCKH nổi bật (2 rows x 3 columns) */}
                <section className="w-full">
                    <SectionHeader title="Nhiệm vụ NCKH nổi bật" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <ResearchTaskCard key={i} />
                        ))}
                    </div>
                </section>

                {/* 2. Sáng kiến nổi bật (2 rows x 3 columns) */}
                <section className="w-full">
                    <SectionHeader title="Sáng kiến nổi bật" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <InitiativeCard key={i} />
                        ))}
                    </div>
                </section>

                {/* 3. Dự án CNTT nổi bật (2 rows x 3 columns) */}
                <section className="w-full">
                    <SectionHeader title="Dự án CNTT nổi bật" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <ITProjectCard key={i} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};
