import React from "react";
import { Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface Props {
    ticketCode: string;
    copied: boolean;
    setCopied: (val: boolean) => void;
    submissionType: "research" | "initiative" | "it-project";
}

const successContent: Record<Props["submissionType"], { title: string; description: string; profileSection: string }> = {
    research: {
        title: "Chúc mừng đã đặt hàng nhiệm vụ KHCN thành công!",
        description: "Đề xuất đặt hàng nhiệm vụ KHCN của bạn đã được ghi nhận. Vui lòng lưu lại mã hồ sơ bên dưới để tra cứu trạng thái hồ sơ sau này.",
        profileSection: "research",
    },
    initiative: {
        title: "Chúc mừng đã gửi yêu cầu công nhận sáng kiến thành công!",
        description: "Đơn yêu cầu công nhận sáng kiến của bạn đã được ghi nhận. Vui lòng lưu lại mã hồ sơ bên dưới để tra cứu trạng thái hồ sơ sau này.",
        profileSection: "initiative",
    },
    "it-project": {
        title: "Chúc mừng đã gửi đề xuất dự án CNTT thành công!",
        description: "Đề xuất dự án CNTT của bạn đã được ghi nhận. Vui lòng lưu lại mã hồ sơ bên dưới để tra cứu trạng thái hồ sơ sau này.",
        profileSection: "it-project",
    },
};

export const Step3Success: React.FC<Props> = ({ ticketCode, copied, setCopied, submissionType }) => {
    const content = successContent[submissionType];

    return (
        <div className="animate-fade-in flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-portal-primary/10 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-check text-5xl text-portal-primary"></i>
            </div>
            <h2 className="text-[24px] font-bold text-gray-800 mb-3 text-center">{content.title}</h2>
            <p className="text-gray-600 mb-8 text-center max-w-lg leading-relaxed">
                {content.description}
            </p>

            <div className="bg-portal-primary/5 border border-portal-primary/20 rounded-xl p-6 text-center inline-block min-w-[320px] max-w-full mb-10">
                <span className="text-[13px] text-gray-500 uppercase font-bold tracking-wider">Mã hồ sơ</span>
                <div className="text-[32px] font-black text-portal-primary mt-2 tracking-widest flex items-center justify-center gap-3 whitespace-nowrap">
                    {ticketCode}
                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="tooltip-copy">{copied ? "Đã copy" : "Copy mã"}</Tooltip>}
                    >
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(ticketCode);
                                setCopied(true);
                            }}
                            className="text-gray-400 hover:text-portal-primary transition-colors text-[24px] focus:outline-none ml-2"
                        >
                            <i className={copied ? "fa-solid fa-check text-green-500" : "fa-regular fa-clipboard"}></i>
                        </button>
                    </OverlayTrigger>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                    to="/portal/home"
                    className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold transition text-center"
                >
                    Về trang chủ
                </Link>
                <Link
                    to={`/portal/profile?section=${content.profileSection}`}
                    className="px-8 py-3 rounded-lg bg-portal-primary hover:bg-portal-hover text-white font-bold transition text-center"
                >
                    Tra cứu
                </Link>
            </div>
        </div>
    );
};
