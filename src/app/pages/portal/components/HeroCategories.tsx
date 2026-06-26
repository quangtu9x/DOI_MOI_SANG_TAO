import { Link } from "react-router-dom";
import { useDMSTRole } from "@/app/hooks/useDMSTRole";

interface CategoryCardProps {
    title: string;
    description: string;
    iconClass: string;
    to: string;
    accent?: string;
}

const CategoryCard = ({ title, description, iconClass, to, accent = "#0a65cc" }: CategoryCardProps) => {
    return (
        <Link
            to={to}
            className="bg-white hover:shadow-[0_12px_40px_0_rgba(10,101,204,0.12)] border border-[#e4e5e8] transition-all duration-300 flex gap-4 items-center p-5 relative rounded-xl w-full group no-underline"
        >
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                style={{ background: `${accent}15` }}
            >
                <i className={`${iconClass} text-xl`} style={{ color: accent }} />
            </div>
            <div className="flex flex-col gap-0.5 items-start">
                <p className="font-semibold leading-6 text-[#18191c] group-hover:text-[#0a65cc] transition-colors text-base">{title}</p>
                <p className="font-normal leading-5 text-[#374151] text-sm">{description}</p>
            </div>
            <i className="fa-regular fa-arrow-right ms-auto text-[#c0c4cc] group-hover:text-[#0a65cc] transition-colors" />
        </Link>
    );
};

export const HeroCategories = () => {
    const { isReviewer } = useDMSTRole();

    const categories = [
        {
            title: "Gửi ý tưởng mới",
            description: "Đề xuất cải tiến vận hành & dịch vụ",
            iconClass: "fa-regular fa-lightbulb",
            to: "/doi-moi/y-tuong",
            accent: "#0a65cc",
        },
        {
            title: "Tra cứu hồ sơ",
            description: "Xem tiến độ xét duyệt ý tưởng",
            iconClass: "fa-regular fa-magnifying-glass",
            to: "/doi-moi/tra-cuu",
            accent: "#7c3aed",
        },
        {
            title: "Kho tri thức",
            description: "Sáng kiến đã được triển khai thực tế",
            iconClass: "fa-regular fa-books",
            to: "/doi-moi/kho-tri-thuc",
            accent: "#059669",
        },
        ...(isReviewer ? [{
            title: "Trang quản lý",
            description: "Phê duyệt & theo dõi toàn hệ thống",
            iconClass: "fa-regular fa-gauge-high",
            to: "/doi-moi-sang-tao/dashboard",
            accent: "#d97706",
        }] : []),
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-2">
            {categories.map((cat, index) => (
                <CategoryCard key={index} {...cat} />
            ))}
        </div>
    );
};
