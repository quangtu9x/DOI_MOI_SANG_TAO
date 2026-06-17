import { Button } from "antd";
import { OrganizationUnitTreeSelect } from "@/app/components";

interface Props {
    donViId: string | null;
    setDonViId: (id: string | null) => void;
    setStep: (step: number) => void;
}

export const Step1SelectDonVi = ({ donViId, setDonViId, setStep }: Props) => {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Chọn Đơn vị yêu cầu công nhận sáng kiến
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đơn vị<span className="text-red-500">*</span>
                </label>
                <OrganizationUnitTreeSelect
                    value={donViId}
                    onChange={(value) => setDonViId(value as string)}
                    placeholder="-- Chọn đơn vị --"
                />
            </div>

            <div className="flex justify-end mt-12 pt-6 border-t border-gray-100">
                <button
                    onClick={() => setStep(2)}
                    disabled={!donViId}
                    className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2
                                ${donViId
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