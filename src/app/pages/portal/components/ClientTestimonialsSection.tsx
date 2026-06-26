import { useState, useEffect } from "react";

const EXPERTS = [
    { id: 1, name: "GS.TS. Nguyễn Văn A", research: "Nghiên cứu hệ thống nhúng, IoT và giải pháp bảo mật trong chính quyền điện tử.", image: "https://i.pravatar.cc/150?u=a1" },
    { id: 2, name: "PGS.TS. Trần Thị B", research: "Chuyển đổi số và ứng dụng Trí tuệ nhân tạo (AI) trong quản lý đô thị thông minh.", image: "https://i.pravatar.cc/150?u=a2" },
    { id: 3, name: "TS. Lê Văn C", research: "Phát triển nền tảng dữ liệu dùng chung và kiến trúc LGSP cho các tỉnh thành.", image: "https://i.pravatar.cc/150?u=a3" },
    { id: 4, name: "TS. Phạm Minh D", research: "Giải pháp Blockchain trong truy xuất nguồn gốc và minh bạch hóa dữ liệu công.", image: "https://i.pravatar.cc/150?u=a4" },
    { id: 5, name: "PGS.TS. Hoàng Xuân E", research: "Tối ưu hóa quy trình nghiệp vụ và cải cách hành chính thông qua các hệ thống e-Portal.", image: "https://i.pravatar.cc/150?u=a5" },
];

export const ClientTestimonialsSection = () => {
    const [current, setCurrent] = useState(0);
    const perPage = 3;
    const total = EXPERTS.length;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(c => (c + 1) % total);
        }, 3500);
        return () => clearInterval(timer);
    }, [total]);

    // Show 3 cards, wrapping around
    const visible = [0, 1, 2].map(i => EXPERTS[(current + i) % total]);

    return (
        <div className="w-full bg-[#f1f2f4] py-20 px-4 overflow-hidden">
            <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-12">
                <h2 className="text-[#191f33] text-4xl font-semibold text-center">
                    Đội ngũ chuyên gia
                </h2>

                <div className="w-full max-w-[1320px] grid grid-cols-1 md:grid-cols-3 gap-6">
                    {visible.map((expert) => (
                        <div key={expert.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
                            <p className="text-[#464d61] text-base italic line-clamp-4 flex-1">
                                "{expert.research}"
                            </p>
                            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                <img src={expert.image} alt={expert.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#e7f0fa]" />
                                <div>
                                    <p className="text-[#191f33] text-base font-semibold">{expert.name}</p>
                                    <p className="text-[#767e94] text-sm">Chuyên gia NCKH</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dots */}
                <div className="flex gap-2 items-center justify-center">
                    {EXPERTS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2.5 bg-[#0a65cc]' : 'w-2.5 h-2.5 bg-[#99c2ff] opacity-60'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
