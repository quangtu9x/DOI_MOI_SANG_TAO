import React from "react";
import { Form, Input, Radio, FormInstance } from "antd";

interface Props {
    form: FormInstance;
    onFinish: (values: any) => void;
    setStep: (step: number) => void;
    currentUser: any;
}

export const Step2FormKHCN: React.FC<Props> = ({ form, onFinish, setStep, currentUser }) => {
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
                <h3 className="text-[20px] font-bold uppercase text-[#18191c] mt-1">DỰ ÁN KHOA HỌC VÀ CÔNG NGHỆ</h3>
            </div>

            {/* Phần 1. Thông tin chung */}
            <div className="mb-10">
                <h3 className="text-[16px] font-bold text-red-600 border-b border-gray-200 pb-2 mb-6 uppercase">
                    Phần 1. THÔNG TIN CHUNG
                </h3>

                <div className="grid grid-cols-1 gap-4 text-[14px]">
                    <Form.Item
                        name="tenDuAnKHCN"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">
                                1. Tên dự án khoa học và công nghệ (KH&CN): <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập tên dự án!" }]}
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
                        <Input.TextArea size="large" rows={3} placeholder="Nhập tên đơn vị phối hợp (nếu có)..." />
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
                        name="xuatXu"
                        label={
                            <span className="font-medium text-gray-800 text-[14px] leading-relaxed">
                                1. Xuất xứ hình thành: <span className="font-normal italic text-gray-600">(nêu rõ nguồn hình thành của dự án KH&CN, tên dự án đầu tư sản xuất, các quyết định phê duyệt liên quan ...)</span> <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập xuất xứ hình thành!" }]}
                    >
                        <Input.TextArea size="large" rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="tinhCapThiet"
                        label={
                            <span className="font-medium text-gray-800 text-[14px] leading-relaxed">
                                2. Tính cấp thiết; tầm quan trọng phải thực hiện ở tầm quốc gia; tác động và ảnh hưởng đến đời sống kinh tế - xã hội của đất nước v.v...: <span className="text-red-500 ml-1">*</span>
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
                                3. Mục tiêu: <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập mục tiêu!" }]}
                    >
                        <Input.TextArea size="large" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="noiDungKHCN"
                        label={
                            <span className="font-medium text-gray-800 text-[14px] leading-relaxed">
                                4. Nội dung KH&CN chủ yếu: <span className="font-normal italic text-gray-600">(mỗi nội dung đặt ra có thể hình thành được một đề tài, hoặc dự án SXTN)</span> <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập nội dung KH&CN chủ yếu!" }]}
                    >
                        <Input.TextArea size="large" rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="yeuCauKetQua"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">
                                5. Yêu cầu đối với kết quả (công nghệ, thiết bị) và các chỉ tiêu kinh tế - kỹ thuật cần đạt: <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập yêu cầu kết quả!" }]}
                    >
                        <Input.TextArea size="large" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="duKienUngDung"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">
                                6. Dự kiến tổ chức, cơ quan hoặc địa chỉ ứng dụng các kết quả tạo ra:
                            </span>
                        }
                    >
                        <Input.TextArea size="large" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="yeuCauThoiGian"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">7. Yêu cầu đối với thời gian thực hiện:</span>
                        }
                    >
                        <Input.TextArea size="large" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="nangLucToChuc"
                        label={
                            <span className="font-medium text-gray-800 text-[14px]">
                                8. Năng lực của tổ chức, cơ quan dự kiến ứng dụng kết quả:
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

                    <Form.Item
                        name="phuongAnHuyDong"
                        label={
                            <span className="font-medium text-gray-800 text-[14px] leading-relaxed">
                                10. Phương án huy động các nguồn lực của cơ tổ chức, cơ quan dự kiến ứng dụng kết quả: <span className="font-normal italic text-gray-600">(khả năng huy động nhân lực, tài chính và cơ sở vật chất từ các nguồn khác nhau để thực hiện dự án)</span>
                            </span>
                        }
                    >
                        <Input.TextArea size="large" rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="hieuQuaDuAn"
                        label={
                            <span className="font-medium text-gray-800 text-[14px] leading-relaxed">
                                11. Dự kiến hiệu quả của dự án KH&CN <span className="font-normal italic text-gray-600">(Hiệu quả kinh tế - xã hội: cần làm rõ đóng góp của dự án KH&CN đối với các dự án đầu tư sản xuất trước mắt và lâu dài bao gồm số tiền làm lợi và các đóng góp khác..., Hiệu quả về khoa học và công nghệ: tác động đối với lĩnh vực khoa học công nghệ liên quan, đào tạo, bồi dưỡng đội ngũ cán bộ, tăng cường năng lực nội sinh...)</span> <span className="text-red-500 ml-1">*</span>
                            </span>
                        }
                        rules={[{ required: true, message: "Vui lòng nhập dự kiến hiệu quả của dự án KH&CN!" }]}
                    >
                        <Input.TextArea size="large" rows={6} />
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
