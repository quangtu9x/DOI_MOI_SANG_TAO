import { useAuth } from "@/app/modules/auth";
import { UserPurpose, UserType } from "@/models";
import { Link } from "react-router-dom";

interface CategoryCardProps {
    title: string;
    description: string;
    iconClass: string;
    to: string;
}

const CategoryCard = ({ title, description, iconClass, to }: CategoryCardProps) => {
    return (
        <Link to={to} className="bg-white hover:shadow-[0_12px_40px_0_rgba(0,44,109,0.04)] border border-[#e4e5e8] transition-all duration-300 flex gap-[16px] items-center p-[24px] relative rounded-[12px] w-full group">
            <div className="flex flex-col gap-[8px] items-start">
                <p className="font-medium leading-[28px] text-[#18191c] group-hover:text-[#0a65cc] transition-colors text-[18px]">{title}</p>
                <p className="font-normal leading-[20px] text-[#5e6670] text-[14px]">
                    {description}
                </p>
            </div>
        </Link>
    );
};

export const HeroCategories = () => {
    const { currentUser } = useAuth();
    const categories = [
        {
            title: "Ý tưởng",
            description: "Khởi tạo & Quản lý",
            iconClass: "fa-regular fa-lightbulb",
            to: "/portal/y-tuong",
            purpose: null
        },
        {
            title: "Nhiệm vụ khoa học",
            description: "Đăng ký & Quản lý",
            iconClass: "fa-solid fa-flask",
            to: "/portal/nhiem-vu",
            purpose: UserPurpose.NhiemVuKhoaHoc
        },
        {
            title: "Sáng kiến khoa học",
            description: "Khai báo & Đánh giá",
            iconClass: "fa-solid fa-lightbulb",
            to: "/portal/sang-kien",
            purpose: UserPurpose.SangKienKhoaHoc
        },
        {
            title: "Dự án CNTT",
            description: "Đề xuất & Phê duyệt",
            iconClass: "fa-solid fa-laptop-code",
            to: "/portal/du-an",
            purpose: UserPurpose.DuAnCNTT
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4">
            {(currentUser?.type == UserType.FromPortal && currentUser?.purposes?.length !== 0) && (
                console.log("User purposes:", currentUser.purposes),
                categories.map((cat, index) => {
                    if (cat.purpose === null || currentUser?.purposes?.includes(cat.purpose)) {
                        return <CategoryCard key={index} {...cat} />;
                    }
                })
            )}
            {currentUser?.type != UserType.FromPortal && (
                categories.map((cat, index) => {
                    return <CategoryCard key={index} {...cat} />;
                })
            )}
        </div>
    );
};
