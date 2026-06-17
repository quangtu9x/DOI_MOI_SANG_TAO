import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { User, Quote } from "lucide-react";

// --- Mock Data ---
const EXPERTS = [
    {
        id: 1,
        name: "GS.TS. Nguyễn Văn A",
        research: "Nghiên cứu hệ thống nhúng, IoT và giải pháp bảo mật trong chính quyền điện tử.",
        image: "https://i.pravatar.cc/150?u=a1",
    },
    {
        id: 2,
        name: "PGS.TS. Trần Thị B",
        research: "Chuyển đổi số và ứng dụng Trí tuệ nhân tạo (AI) trong quản lý đô thị thông minh.",
        image: "https://i.pravatar.cc/150?u=a2",
    },
    {
        id: 3,
        name: "TS. Lê Văn C",
        research: "Phát triển nền tảng dữ liệu dùng chung và kiến trúc LGSP cho các tỉnh thành.",
        image: "https://i.pravatar.cc/150?u=a3",
    },
    {
        id: 4,
        name: "TS. Phạm Minh D",
        research: "Giải pháp Blockchain trong truy xuất nguồn gốc và minh bạch hóa dữ liệu công.",
        image: "https://i.pravatar.cc/150?u=a4",
    },
    {
        id: 5,
        name: "PGS.TS. Hoàng Xuân E",
        research: "Tối ưu hóa quy trình nghiệp vụ và cải cách hành chính thông qua các hệ thống e-Portal.",
        image: "https://i.pravatar.cc/150?u=a5",
    },
];

export const ClientTestimonialsSection = () => {
    return (
        <div className="w-full bg-[#f1f2f4] py-[100px] px-4 overflow-hidden">
            <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-[50px]">
                <h2 className="text-[#191f33] text-[40px] font-medium leading-[48px] text-center w-full max-w-[1320px]">
                    Đội ngũ chuyên gia
                </h2>

                <div className="w-full max-w-[1320px] relative expert-slider">
                    <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={24}
                        slidesPerView={1}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            el: '.custom-pagination',
                        }}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="bg-transparent"
                    >
                        {EXPERTS.map((expert) => (
                            <SwiperSlide key={expert.id}>
                                <div className="bg-white rounded-[12px] shadow-[0px_12px_80px_0px_rgba(0,44,109,0.05)] p-6 md:p-8 flex flex-col gap-6 justify-between transition-transform duration-300 hover:-translate-y-1 h-[150px]">
                                    <div className="flex flex-col gap-4">
                                        <p className="text-[#464d61] text-[16px] leading-[24px] italic line-clamp-4">
                                            “{expert.research}”
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#e7f0fa]">
                                                <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[#191f33] text-[16px] font-medium leading-[24px]">{expert.name}</p>
                                                <p className="text-[#767e94] text-[14px] leading-[20px]">Chuyên gia NCKH</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Pagination to match the style */}
                    <div className="custom-pagination flex gap-2 items-center justify-center mt-8"></div>
                </div>

                <style>{`
                    .custom-pagination .swiper-pagination-bullet {
                        width: 10px;
                        height: 10px;
                        background: #99c2ff;
                        opacity: 0.6;
                        border-radius: 50%;
                        margin: 0 4px;
                        transition: all 0.3s;
                    }
                    .custom-pagination .swiper-pagination-bullet-active {
                        width: 24px;
                        height: 10px;
                        background: #0a65cc;
                        border-radius: 5px;
                        opacity: 1;
                    }
                `}</style>
            </div>
        </div>
    );
};
