import React from "react";
import { Form, Input, Radio, FormInstance } from "antd";

interface Props {
    form: FormInstance;
    onFinish: (values: any) => void;
    setStep: (step: number) => void;
    currentUser: any;
}

export const Step2FormDeTai: React.FC<Props> = ({ form, onFinish, setStep, currentUser }) => {
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ loaiDeXuat: "canhan" }}
            className="animate-fade-in max-w-[1000px] mx-auto mt-4"
            requiredMark={false}
        >
            <div className="text-center mb-10">
                <h2 className="text-[20px] font-bold uppercase text-[#18191c]">PHIẾU ĐỀ XUẤT ĐẶT HÀNG NHIỆM VỤ</h2>
                <h3 className="text-[20px] font-bold uppercase text-[#18191c] mt-1">KHOA HỌC VÀ CÔNG NGHỆ CẤP QUỐC GIA</h3>
                <p className="text-gray-600 italic mt-2">(Dùng cho đề tài hoặc đề án)</p>
            </div>

            {/* Phần 1. Thông tin chung */}
            <div className="mb-10">
                <h3 className="text-[16px] font-bold text-red-600 border-b border-gray-200 pb-2 mb-6 uppercase">
                    Phần 1. THÔNG TIN CHUNG
                </h3>

                <div className="grid grid-cols-1 gap-4 text-[14px]">
                    <Form.Item
                        name="tenDeTai"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">
                                1. Tên đề tài/đề án: <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập tên đề tài/đề án!" }]}
                    >
                        <Input.TextArea size="large" rows={3} placeholder="Ghi rõ ràng, ngắn gọn..." />
                    </Form.Item>

                    <Form.Item
                        name="loaiDeXuat"
                        label={<span className="font-medium text-gray-800 text-[14px]">2. Đơn vị/cá nhân đề xuất:</span>}
                    >
                        <Radio.Group className="pl-4">
                            <Radio value="canhan">Cá nhân</Radio>
                            <Radio value="tochuc">Tổ chức</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/80 p-5 rounded-lg border border-gray-200 mb-2">
                        <div className="md:col-span-2 text-sm italic text-gray-500 mb-1">
                            (Cập nhật thông tin cá nhân tự động từ tài khoản đăng nhập)
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1.5">- Họ và tên:</label>
                            <input
                                type="text"
                                readOnly
                                className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 outline-none"
                                value={currentUser?.fullName || currentUser?.userName || ""}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1.5">- Điện thoại:</label>
                            <input
                                type="text"
                                readOnly
                                className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 outline-none"
                                value={currentUser?.phoneNumber || ""}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1.5">- Email:</label>
                            <input
                                type="email"
                                readOnly
                                className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 outline-none"
                                value={currentUser?.email || ""}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1.5">- Địa chỉ:</label>
                            <input
                                type="text"
                                readOnly
                                className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 outline-none"
                                value={currentUser?.address?.addressLine || ""}
                            />
                        </div>
                    </div>

                    <Form.Item
                        name="donViPhoiHop"
                        label={<span className="font-medium text-gray-800 text-[14px]">3. Đơn vị phối hợp:</span>}
                    >
                        <Input size="large" placeholder="Nhập tên đơn vị phối hợp (nếu có)..." />
                    </Form.Item>
                </div>
            </div>

            {/* Phần 2. Nội dung đặt hàng */}
            <div>
                <h3 className="text-[16px] font-bold text-red-600 border-b border-gray-200 pb-2 mb-6 uppercase">
                    Phần 2. NỘI DUNG ĐẶT HÀNG
                </h3>

                <div className="grid grid-cols-1 gap-4 text-[14px]">
                    <Form.Item
                        name="canCuDeXuat"
                        label={
                            <span className="font-medium text-gray-800 text-[14px] leading-relaxed">
                                2. Căn cứ đề xuất <span className="font-normal italic text-gray-600">(giải trình căn cứ theo quy định tại Điều 3 của Thông tư 03/2017/TT-BKHCN Quy định trình tự thủ tục xác định nhiệm vụ khoa học và công nghệ cấp quốc gia sử dụng ngân sách nhà nước):</span> <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập căn cứ đề xuất!" }]}
                    >
                        <Input.TextArea size="large" rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="tinhCapThiet"
                        label={
                            <span className="font-medium text-gray-800 text-[14px] leading-relaxed">
                                3. Tính cấp thiết; tầm quan trọng phải thực hiện ở tầm quốc gia; tác động và ảnh hưởng đến đời sống kinh tế - xã hội của đất nước v.v... <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập tính cấp thiết!" }]}
                    >
                        <Input.TextArea size="large" rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="mucTieu"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">
                                4. Mục tiêu: <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập mục tiêu!" }]}
                    >
                        <Input.TextArea size="large" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="yeuCauKetQua"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">
                                5. Yêu cầu các kết quả chính và các chỉ tiêu cần đạt: <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập yêu cầu kết quả!" }]}
                    >
                        <Input.TextArea size="large" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="kienNghiNoiDung"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">
                                6. Kiến nghị các nội dung chính cần thực hiện để đạt kết quả: <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập kiến nghị nội dung!" }]}
                    >
                        <Input.TextArea size="large" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="duKienUngDung"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">
                                7. Dự kiến tổ chức, cơ quan hoặc địa chỉ ứng dụng các kết quả tạo ra:
                            </span>
                        }
                    >
                        <Input.TextArea size="large" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="yeuCauThoiGian"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">
                                8. Yêu cầu đối với thời gian để đạt được các kết quả:
                            </span>
                        }
                    >
                        <Input.TextArea size="large" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="kinhPhi"
                        label={<span className="font-medium text-gray-800 text-[14px]">9. Dự kiến nhu cầu kinh phí (VNĐ):</span>}
                    >
                        <Input size="large" placeholder="Nhập vào dự kiến kinh phí..." />
                    </Form.Item>
                </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-between mt-8 pt-6 border-t border-gray-100 gap-4">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 rounded-lg font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition"
                >
                    <i className="fa-solid fa-arrow-left"></i> Quay lại
                </button>
                <button
                    type="submit"
                    className="px-8 py-3 rounded-lg font-bold bg-portal-primary hover:bg-portal-hover text-white flex items-center justify-center gap-2 transition"
                >
                    Gửi đề xuất <i className="fa-solid fa-paper-plane text-white"></i>
                </button>
            </div>
        </Form>
    );
};
