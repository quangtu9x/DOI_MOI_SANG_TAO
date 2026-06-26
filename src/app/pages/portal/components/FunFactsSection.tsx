interface FunFactCardProps {
    title: string;
    count: string;
    iconClass: string;
    accent: string;
    sub?: string;
}

const FunFactCard = ({ title, count, iconClass, accent, sub }: FunFactCardProps) => {
    return (
        <div className="bg-white flex gap-5 items-center p-6 rounded-xl shadow-[0_8px_32px_0_rgba(0,44,109,0.08)] cursor-pointer hover:shadow-[0_12px_48px_0_rgba(0,44,109,0.12)] transition-shadow">
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${accent}15` }}
            >
                <i className={`${iconClass} text-2xl`} style={{ color: accent }} />
            </div>
            <div className="flex flex-col gap-0.5">
                <h3 className="text-2xl font-bold text-[#18191c]">{count}</h3>
                <p className="text-[#5e6670] text-sm font-medium">{title}</p>
                {sub && <p className="text-[#9ca3af] text-xs mt-0.5">{sub}</p>}
            </div>
        </div>
    );
};

export const FunFactsSection = () => {
    const facts = [
        {
            title: "Ý tưởng đã gửi",
            count: "214",
            iconClass: "fa-regular fa-lightbulb",
            accent: "#0a65cc",
            sub: "+18 trong tháng này",
        },
        {
            title: "Đã được phê duyệt",
            count: "127",
            iconClass: "fa-regular fa-circle-check",
            accent: "#059669",
            sub: "59.3% tỷ lệ duyệt",
        },
        {
            title: "Đang triển khai",
            count: "43",
            iconClass: "fa-regular fa-plane-departure",
            accent: "#d97706",
            sub: "Trên các đường bay",
        },
        {
            title: "Đơn vị tham gia",
            count: "26",
            iconClass: "fa-regular fa-building",
            accent: "#7c3aed",
            sub: "Cả Ban/Đoàn/Xí nghiệp",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[1440px] w-full mt-10">
            {facts.map((fact, index) => (
                <FunFactCard key={index} {...fact} />
            ))}
        </div>
    );
};
