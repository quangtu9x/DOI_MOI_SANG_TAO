interface FunFactCardProps {
    title: string;
    count: string;
    iconClass: string;
}

const FunFactCard = ({ title, count, iconClass }: FunFactCardProps) => {
    return (
        <div className="bg-white flex gap-5 items-center p-6 rounded-xl shadow-[0_12px_48px_0_rgba(0,44,109,0.1)] cursor-pointer">
            <div className="bg-[#e7f0fa] p-4 rounded-lg shrink-0 text-[#0a65cc]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-medium text-[#18191c]">{count}</h3>
                <p className="text-[#767f8c] text-base">{title}</p>
            </div>
        </div>
    );
};

export const FunFactsSection = () => {
    const facts = [
        { title: "Nhiệm vụ", count: "1.250", iconClass: "fa-solid fa-flask" },
        { title: "Sáng kiến", count: "840", iconClass: "fa-solid fa-lightbulb" },
        { title: "Dự án CNTT", count: "320", iconClass: "fa-solid fa-laptop-code" },
        { title: "Chuyên gia", count: "150", iconClass: "fa-solid fa-user-tie" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1440px] w-full mt-10">
            {facts.map((fact, index) => (
                <FunFactCard key={index} {...fact} />
            ))}
        </div>
    );
};