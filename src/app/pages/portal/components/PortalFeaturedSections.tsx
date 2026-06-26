import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// --- Reusable Sub-components ---

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    viewAllTo?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, viewAllTo }) => (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-3">
        <div>
            <h2 className="text-[#191f33] text-3xl font-semibold leading-tight">{title}</h2>
            {subtitle && <p className="text-[#4b5563] text-base mt-1">{subtitle}</p>}
        </div>
        {viewAllTo && (
            <Link
                to={viewAllTo}
                className="flex items-center gap-2 border border-[#e7f0fa] hover:bg-[#e7f0fa] transition-colors text-[#0a65cc] font-semibold px-5 py-2.5 rounded-lg text-sm no-underline"
            >
                Xem tất cả
                <ChevronRight size={16} />
            </Link>
        )}
    </div>
);

// --- Idea Card ---
interface IdeaCardData {
    ma: string;
    ten: string;
    linhVuc: string;
    nguoiGui: string;
    ngay: string;
    trangThai: "Chờ duyệt" | "Đã duyệt" | "Được công nhận";
    tomTat: string;
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
    "Chờ duyệt":      { bg: "#fff7e6", text: "#d97706" },
    "Đã duyệt":       { bg: "#ecfdf5", text: "#059669" },
    "Được công nhận": { bg: "#f0f4ff", text: "#4f46e5" },
};

const IdeaCard: React.FC<{ idea: IdeaCardData }> = ({ idea }) => {
    const st = STATUS_STYLE[idea.trangThai] ?? STATUS_STYLE["Đã duyệt"];
    return (
        <div className="bg-white border border-[#e4e5e8] hover:shadow-[0_12px_48px_0_rgba(0,44,109,0.08)] transition-all duration-300 p-6 rounded-xl flex flex-col gap-4 cursor-pointer group">
            <div className="flex items-start justify-between gap-3">
                <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: st.bg, color: st.text }}
                >
                    {idea.trangThai}
                </span>
                <span className="text-[#6b7280] text-sm">{idea.ngay}</span>
            </div>
            <h3 className="text-[#18191c] text-lg font-bold group-hover:text-[#0a65cc] transition-colors line-clamp-2 leading-snug">
                {idea.ten}
            </h3>
            <p className="text-[#374151] text-base line-clamp-2 flex-1">{idea.tomTat}</p>
            <div className="flex items-center justify-between pt-3 border-t border-[#f1f2f4]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#e7f0fa] flex items-center justify-center">
                        <i className="fa-regular fa-user text-[#0a65cc] text-xs" />
                    </div>
                    <span className="text-[#18191c] text-base font-semibold">{idea.nguoiGui}</span>
                </div>
                <span
                    className="text-sm px-2.5 py-1 rounded-md font-semibold"
                    style={{ background: "#f1f2f4", color: "#374151" }}
                >
                    {idea.linhVuc}
                </span>
            </div>
        </div>
    );
};

// --- Knowledge Card ---
interface KnowledgeCardData {
    ma: string;
    ten: string;
    linhVuc: string;
    nguoiGui: string;
    ngay: string;
    tomTat: string;
    tags: string[];
    luotXem: number;
}

const KnowledgeCard: React.FC<{ item: KnowledgeCardData }> = ({ item }) => (
    <div className="bg-white border border-[#e4e5e8] hover:shadow-[0_12px_48px_0_rgba(0,44,109,0.08)] transition-all duration-300 p-6 rounded-xl flex flex-col gap-4 cursor-pointer group">
        <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#059669]">
                {item.ma}
            </span>
            <span className="text-[#6b7280] text-sm flex items-center gap-1">
                <i className="fa-regular fa-eye" /> {item.luotXem} lượt xem
            </span>
        </div>
        <h3 className="text-[#18191c] text-base font-semibold group-hover:text-[#0a65cc] transition-colors line-clamp-2 leading-snug">
            {item.ten}
        </h3>
        <p className="text-[#374151] text-base line-clamp-2 flex-1">{item.tomTat}</p>
        <div className="flex flex-wrap gap-1.5">
            {item.tags.map(t => (
                <span key={t} className="text-xs bg-[#e7f0fa] text-[#0a65cc] px-2 py-0.5 rounded-md font-medium">
                    {t}
                </span>
            ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#f1f2f4]">
            <span className="text-[#374151] text-base font-medium">
                <i className="fa-regular fa-user me-1.5" />{item.nguoiGui}
            </span>
            <span className="text-[#6b7280] text-sm">
                <i className="fa-regular fa-calendar me-1" />{item.ngay}
            </span>
        </div>
    </div>
);

// --- How it works steps ---
const STEPS = [
    {
        no: "01",
        icon: "fa-regular fa-lightbulb",
        title: "Tạo ý tưởng",
        desc: "Điền thông tin ý tưởng, mô tả vấn đề và giải pháp đề xuất của bạn.",
        color: "#0a65cc",
    },
    {
        no: "02",
        icon: "fa-regular fa-floppy-disk",
        title: "Lưu nháp & Đính kèm",
        desc: "Lưu nháp để chỉnh sửa sau, đính kèm tài liệu minh chứng nếu cần.",
        color: "#7c3aed",
    },
    {
        no: "03",
        icon: "fa-regular fa-paper-plane",
        title: "Nộp phê duyệt",
        desc: "Nộp ý tưởng để Hội đồng xem xét. Bạn sẽ nhận thông báo về kết quả.",
        color: "#d97706",
    },
    {
        no: "04",
        icon: "fa-regular fa-medal",
        title: "Được công nhận",
        desc: "Ý tưởng được duyệt sẽ vào Kho tri thức và bạn được ghi nhận đóng góp.",
        color: "#059669",
    },
];

// --- Mock data (Vietnam Airlines context) ---
const RECENT_IDEAS: IdeaCardData[] = [
    {
        ma: "YT-2026061501",
        ten: "Số hóa quy trình check-in nội địa — tăng tốc độ phục vụ hành khách",
        linhVuc: "Dịch vụ mặt đất",
        nguoiGui: "Nguyễn Minh Tuấn",
        ngay: "25/06/2026",
        trangThai: "Chờ duyệt",
        tomTat: "Tích hợp self check-in kiosk tại các sân bay tier-2, giảm thời gian chờ từ 15 phút xuống dưới 3 phút cho hành khách nội địa.",
    },
    {
        ma: "YT-2026061502",
        ten: "Ứng dụng AI dự báo bảo trì động cơ máy bay phòng ngừa",
        linhVuc: "Kỹ thuật bảo dưỡng",
        nguoiGui: "Trần Quang Hùng",
        ngay: "24/06/2026",
        trangThai: "Đã duyệt",
        tomTat: "Hệ thống AI phân tích dữ liệu cảm biến động cơ theo thời gian thực, phát hiện sớm dấu hiệu hỏng hóc, giảm 30% chi phí bảo dưỡng khẩn cấp.",
    },
    {
        ma: "YT-2026061503",
        ten: "Tối ưu lịch trình bay — giảm tiêu hao nhiên liệu bằng Big Data",
        linhVuc: "Khai thác bay",
        nguoiGui: "Phạm Thị Lan",
        ngay: "23/06/2026",
        trangThai: "Được công nhận",
        tomTat: "Phân tích dữ liệu khí tượng và luồng không lưu để tối ưu hành trình bay, tiết kiệm 2–4% nhiên liệu mỗi chuyến.",
    },
];

const KNOWLEDGE_ITEMS: KnowledgeCardData[] = [
    {
        ma: "KTT-2026-001",
        ten: "Tối ưu lịch trình bay bằng Big Data — tiết kiệm nhiên liệu",
        linhVuc: "Khai thác bay",
        nguoiGui: "Phạm Thị Lan",
        ngay: "15/06/2026",
        tomTat: "Áp dụng thành công tại 18 đường bay nội địa, tiết kiệm trung bình 3,2% nhiên liệu/chuyến bay, tương đương 12 tỷ đồng/năm.",
        tags: ["Nhiên liệu", "Big Data", "Tối ưu bay"],
        luotXem: 128,
    },
    {
        ma: "KTT-2026-002",
        ten: "Hệ thống phản hồi hành khách thời gian thực qua QR Code",
        linhVuc: "Dịch vụ hành khách",
        nguoiGui: "Lê Thị Hương",
        ngay: "10/06/2026",
        tomTat: "Hành khách quét QR tại ghế ngồi để đánh giá dịch vụ ngay trên chuyến bay; dữ liệu phản hồi được xử lý tự động và báo cáo về trung tâm trong 30 phút.",
        tags: ["QR Code", "Hành khách", "Phản hồi"],
        luotXem: 94,
    },
    {
        ma: "KTT-2026-003",
        ten: "Nền tảng đào tạo phi công và tiếp viên theo mô hình Blended Learning",
        linhVuc: "Đào tạo nhân lực",
        nguoiGui: "Nguyễn Thành Nam",
        ngay: "05/06/2026",
        tomTat: "Kết hợp học trực tuyến và thực hành simulator giúp rút ngắn 25% thời gian đào tạo định kỳ, tiết kiệm chi phí cho trên 2.000 nhân viên/năm.",
        tags: ["Đào tạo", "E-learning", "Phi công"],
        luotXem: 76,
    },
];

// --- Main Component ---

export const PortalFeaturedSections = () => {
    return (
        <div className="w-full bg-white py-20 px-4">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-20">

                {/* 1. Quy trình gửi ý tưởng */}
                <section className="w-full">
                    <SectionHeader
                        title="Quy trình gửi ý tưởng"
                        subtitle="Đơn giản, minh bạch và được theo dõi từng bước"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {STEPS.map((step) => (
                            <div
                                key={step.no}
                                className="flex flex-col gap-4 p-6 rounded-xl border border-[#e4e5e8] bg-white hover:shadow-[0_8px_32px_0_rgba(0,44,109,0.08)] transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ background: `${step.color}15` }}
                                    >
                                        <i className={`${step.icon} text-xl`} style={{ color: step.color }} />
                                    </div>
                                    <span className="text-3xl font-bold text-[#e4e5e8]">{step.no}</span>
                                </div>
                                <h3 className="text-[#18191c] text-lg font-bold">{step.title}</h3>
                                <p className="text-[#374151] text-base leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Ý tưởng mới nhất */}
                <section className="w-full">
                    <SectionHeader
                        title="Ý tưởng mới nhất"
                        subtitle="Những ý tưởng vừa được gửi lên hệ thống"
                        viewAllTo="/doi-moi/tra-cuu"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {RECENT_IDEAS.map((idea) => (
                            <IdeaCard key={idea.ma} idea={idea} />
                        ))}
                    </div>
                </section>

                {/* 3. Kho tri thức */}
                <section className="w-full">
                    <SectionHeader
                        title="Kho tri thức nổi bật"
                        subtitle="Những ý tưởng đã được công nhận và đưa vào ứng dụng thực tiễn"
                        viewAllTo="/doi-moi/kho-tri-thuc"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {KNOWLEDGE_ITEMS.map((item) => (
                            <KnowledgeCard key={item.ma} item={item} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};
