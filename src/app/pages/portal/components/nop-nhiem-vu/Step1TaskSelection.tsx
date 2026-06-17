import React from "react";

interface Props {
    taskType: number | null;
    setTaskType: (type: number) => void;
    setStep: (step: number) => void;
}

export const Step1TaskSelection: React.FC<Props> = ({ taskType, setTaskType, setStep }) => {
    return (
        <div className="animate-fade-in max-w-4xl mx-auto mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Option 1 */}
                <div
                    onClick={() => setTaskType(1)}
                    className={`border-2 rounded-xl p-8 cursor-pointer transition-all flex flex-col items-center text-center gap-4
                                ${taskType === 1 ? "border-portal-primary" : "border-gray-200 hover:border-gray-300"}`}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gray-50 text-gray-500">
                        <i className="fa-regular fa-book-open "></i>
                    </div>
                    <h3 className="font-semibold text-lg text-[#18191c]">Đề tài KH&CN hoặc đề án khoa học</h3>
                </div>

                {/* Option 2 */}
                <div
                    onClick={() => setTaskType(2)}
                    className={`border-2 rounded-xl p-8 cursor-pointer transition-all flex flex-col items-center text-center gap-4
                                ${taskType === 2 ? "border-portal-primary" : "border-gray-200 hover:border-gray-300"}`}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gray-50 text-gray-500">
                        <i className="fa-regular fa-industry"></i>
                    </div>
                    <h3 className="font-semibold text-lg text-[#18191c]">Dự án sản xuất thử nghiệm</h3>
                </div>

                {/* Option 3 */}
                <div
                    onClick={() => setTaskType(3)}
                    className={`border-2 rounded-xl p-8 cursor-pointer transition-all flex flex-col items-center text-center gap-4
                                ${taskType === 3 ? "border-portal-primary" : "border-gray-200 hover:border-gray-300"}`}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gray-50 text-gray-500">
                        <i className="fa-regular fa-microchip"></i>
                    </div>
                    <h3 className="font-semibold text-lg text-[#18191c]">Dự án khoa học và công nghệ</h3>
                </div>
            </div>

            <div className="flex justify-end mt-12 pt-6 border-t border-gray-100">
                <button
                    onClick={() => setStep(2)}
                    disabled={!taskType}
                    className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2
                                ${taskType
                            ? "bg-portal-primary hover:bg-portal-hover text-white"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    <span className="text-current">Tiếp tục</span>{" "}
                    <i className="fa-solid fa-arrow-right text-current text-white"></i>
                </button>
            </div>
        </div>
    );
};
