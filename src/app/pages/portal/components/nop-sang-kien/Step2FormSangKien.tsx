import { useState } from "react";
import { FileUpload, TDSelect } from "@/app/components";
import { CATEGORY_GROUP_CODE } from "@/data";
import { IPaginationResponse } from "@/models";
import { TDUploadFile } from "@/models/TDUploadFile";
import { API_URL, requestPOST } from "@/utils/baseAPI";
import { handleFiles } from "@/utils/utils";
import { Form, FormInstance, Input, DatePicker, Radio, InputNumber, Modal, Popconfirm, Spin } from "antd";
import type { UploadChangeParam } from "antd/es/upload";

interface Props {
    form: FormInstance;
    onFinish: (values: any) => void;
    setStep: (step: number) => void;
    currentUser: any;
    loading?: boolean;
    dotXetSangKien?: any;
}

export const Step2FormSangKien = ({ form, onFinish, setStep, currentUser, loading, dotXetSangKien }: Props) => {
    const [tacGias, setTacGias] = useState<any[]>([]);
    const [thanhViens, setThanhViens] = useState<any[]>([]);
    const [dinhKems, setDinhKems] = useState<TDUploadFile[]>([]);

    const [isTacGiaModalOpen, setIsTacGiaModalOpen] = useState(false);
    const [isThanhVienModalOpen, setIsThanhVienModalOpen] = useState(false);

    const [editingTacGiaIndex, setEditingTacGiaIndex] = useState<number | null>(null);
    const [editingThanhVienIndex, setEditingThanhVienIndex] = useState<number | null>(null);

    const [tacGiaForm] = Form.useForm();
    const [thanhVienForm] = Form.useForm();

    const handleFinish = () => {
        const values = form.getFieldsValue(true);
        onFinish({
            ...values,
            dinhKem: handleFiles(dinhKems).join('##'),
            tacGias,
            thanhVienThamGiaApDungThus: thanhViens,
        });
    };

    return (
        <Spin spinning={loading}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ loaiDeXuat: "canhan" }}
                className="animate-fade-in max-w-[1000px] mx-auto mt-4"
                requiredMark={false}
            >
                <div className="text-center mb-10">
                    <h2 className="text-[20px] font-bold uppercase text-[#18191c]">ĐƠN YÊU CẦU CÔNG NHẬN SÁNG KIẾN</h2>
                </div>

                {/* Phần 1. Thông tin chung */}
                <div className="mb-10">
                    <h3 className="text-[16px] font-bold text-red-600 border-b border-gray-200 pb-2 mb-6 uppercase">
                        Phần 1. THÔNG TIN CHUNG
                    </h3>

                    <div className="grid grid-cols-1 gap-4 text-[14px]">
                        <Form.Item
                            label={<span className="font-medium text-gray-800 text-[14px]">Đợt đăng ký:</span>}
                        >
                            <Input size="large" value={dotXetSangKien?.ten || "Đang tải..."} readOnly className="bg-gray-100 text-gray-600 font-semibold" />
                        </Form.Item>

                        <Form.Item
                            name="ten"
                            label={
                                <span className="font-medium text-gray-800 text-[14px]">
                                    1. Tên sáng kiến: <span className="text-red-500 ml-1">*</span>
                                </span>
                            }
                            rules={[{ required: true, message: "Vui lòng nhập tên sáng kiến!" }]}
                        >
                            <Input.TextArea size="large" rows={3} placeholder="Nhập tên sáng kiến..." />
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/80 p-5 rounded-lg border border-gray-200 mb-2 mt-4">
                            <div className="md:col-span-2 text-sm italic text-gray-500 mb-1">
                                (Cập nhật thông tin cá nhân tự động từ tài khoản đăng nhập)
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1.5">- Họ và tên (Người đề xuất):</label>
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
                                <label className="block text-gray-700 mb-1.5">- Chức vụ:</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 outline-none"
                                    value={currentUser?.jobTitle || ""}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phần 2. Nội dung sáng kiến */}
                <div className="mb-10">
                    <h3 className="text-[16px] font-bold text-red-600 border-b border-gray-200 pb-2 mb-6 uppercase">
                        Phần 2. NỘI DUNG SÁNG KIẾN YÊU CẦU CÔNG NHẬN
                    </h3>

                    <div className="grid grid-cols-1 gap-4 text-[14px]">
                        <Form.Item
                            name="chuDauTu"
                            label={<span className="font-medium text-gray-800 text-[14px]">1. Chủ đầu tư: <span className="text-red-500 ml-1">*</span></span>}
                            rules={[{ required: true, message: "Vui lòng nhập chủ đầu tư!" }]}
                        >
                            <Input size="large" placeholder="Chủ đầu tư" />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                name="linhVucId"
                                label={<span className="font-medium text-gray-800 text-[14px]">2. Chọn lĩnh vực: <span className="text-red-500 ml-1">*</span></span>}
                                rules={[{ required: true, message: "Vui lòng chọn lĩnh vực!" }]}
                            >
                                <TDSelect
                                    size="large"
                                    notFoundContent="Không tìm thấy dữ liệu"
                                    reload
                                    showSearch
                                    placeholder="Chọn"
                                    fetchOptions={async keyword => {
                                        const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                                            pageNumber: 1,
                                            pageSize: 1000,
                                            keyword: keyword,
                                            categoryGroupCode: CATEGORY_GROUP_CODE.LINH_VUC_SANG_KIEN,
                                        });
                                        return (
                                            res.data?.data?.map(item => ({
                                                ...item,
                                                label: item?.name,
                                                value: item?.id,
                                            })) ?? []
                                        );
                                    }}
                                    onChange={(value, current: any) => {
                                        if (value) {
                                            form.setFieldValue('linhVucId', current?.id);
                                        } else {
                                            form.setFieldValue('linhVucId', null);
                                        }
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="ngayDuocApDungLanDau"
                                label={<span className="font-medium text-gray-800 text-[14px]">3. Ngày áp dụng thử: <span className="text-red-500 ml-1">*</span></span>}
                                rules={[{ required: true, message: "Vui lòng chọn ngày áp dụng thử!" }]}
                            >
                                <DatePicker size="large" className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="moTa"
                            label={<span className="font-medium text-gray-800 text-[14px]">4. Mô tả sáng kiến: </span>}
                        >
                            <Input.TextArea size="large" rows={4} placeholder="Về bản chất, tính mới, tính sáng tạo,..." />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                name="thongTinCanBaoMat"
                                label={<span className="font-medium text-gray-800 text-[14px]">Thông tin cần bảo mật (nếu có):</span>}
                            >
                                <Input.TextArea size="large" rows={2} placeholder="Nhập thông tin cần bảo mật..." />
                            </Form.Item>

                            <Form.Item
                                name="dieuKienCanThiet"
                                label={<span className="font-medium text-gray-800 text-[14px]">5. Điều kiện cần thiết để áp dụng sáng kiến:</span>}
                            >
                                <Input.TextArea size="large" rows={2} placeholder="Nhập điều kiện..." />
                            </Form.Item>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                name="danhGiaLoiIch"
                                label={<span className="font-medium text-gray-800 text-[14px]">6. Đánh giá lợi ích thu được do áp dụng sáng kiến:</span>}
                            >
                                <Input.TextArea size="large" rows={3} placeholder="Lợi ích kinh tế, lợi ích xã hội..." />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-medium text-gray-800 text-[14px]">Đính kèm:</span>}
                            >
                                <FileUpload
                                    URL={`${API_URL}/api/v1/attachments/public`}
                                    fileList={dinhKems}
                                    onChange={(e: UploadChangeParam<TDUploadFile>) => setDinhKems(e.fileList)}
                                    multiple={true}
                                />
                            </Form.Item>
                        </div>
                    </div>
                </div>

                {/* Phần 3: DANH SÁCH TÁC GIẢ & THÀNH VIÊN */}
                <div className="mb-10">
                    <h3 className="text-[16px] font-bold text-red-600 border-b border-gray-200 pb-2 mb-6 uppercase">
                        Phần 3. THÔNG TIN TÁC GIẢ & THÀNH VIÊN
                    </h3>

                    <div className="grid grid-cols-1 gap-4 text-[14px]">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <p className="font-semibold text-gray-700 block m-0">Danh sách Tác giả / Đồng tác giả</p>
                                <button
                                    type="button"
                                    className="bg-[#50cd89] text-white hover:bg-[#47be7d] px-4 py-2 rounded-lg flex items-center gap-2 transition"
                                    onClick={() => { setEditingTacGiaIndex(null); tacGiaForm.resetFields(); setIsTacGiaModalOpen(true); }}
                                >
                                    <i className="fa-solid fa-plus text-white"></i>
                                    Thêm
                                </button>
                            </div>
                            <div className="border border-gray-300 rounded-md overflow-x-auto mb-6">
                                <table className="w-full border-collapse bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-700">Họ tên</th>
                                            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-700">Chức danh</th>
                                            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-700">Nơi công tác</th>
                                            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-700">Đóng góp (%)</th>
                                            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-700 text-center w-[120px]">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tacGias.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                                                    Chưa có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            tacGias.map((record, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition">
                                                    <td className="border border-gray-300 px-4 py-3">{record.hoTen}</td>
                                                    <td className="border border-gray-300 px-4 py-3">{record.chucDanh?.label || record.chucDanh || ""}</td>
                                                    <td className="border border-gray-300 px-4 py-3">{record.donViCongTac}</td>
                                                    <td className="border border-gray-300 px-4 py-3">{record.tyLeDongGop}</td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                                        <div className="flex justify-center items-center">
                                                            <a
                                                                className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1 mb-1 cursor-pointer"
                                                                title="Chỉnh sửa"
                                                                onClick={() => {
                                                                    setEditingTacGiaIndex(index);
                                                                    tacGiaForm.setFieldsValue(record);
                                                                    setIsTacGiaModalOpen(true);
                                                                }}
                                                            >
                                                                <i className="fa-regular fa-pen-to-square"></i>
                                                            </a>

                                                            <Popconfirm
                                                                title="Xoá?"
                                                                onConfirm={() => setTacGias(tacGias.filter((_, i) => i !== index))}
                                                                okText="Xoá"
                                                                cancelText="Huỷ"
                                                            >
                                                                <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1 cursor-pointer" title="Xoá">
                                                                    <i className="fa-regular fa-trash"></i>
                                                                </a>
                                                            </Popconfirm>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <p className="font-semibold text-gray-700 block m-0">Thành viên tham gia áp dụng thử</p>
                                <button
                                    type="button"
                                    className="bg-[#50cd89] text-white hover:bg-[#47be7d] px-4 py-2 rounded-lg flex items-center gap-2 transition"
                                    onClick={() => { setEditingThanhVienIndex(null); thanhVienForm.resetFields(); setIsThanhVienModalOpen(true); }}
                                >
                                    <i className="fa-solid fa-plus text-white"></i>
                                    Thêm
                                </button>
                            </div>
                            <div className="border border-gray-300 rounded-md overflow-x-auto mb-6">
                                <table className="w-full border-collapse bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-700">Họ tên</th>
                                            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-700">Chức danh</th>
                                            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-700">Nơi công tác</th>
                                            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-700">Nội dung CV</th>
                                            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-700 text-center w-[120px]">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {thanhViens.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                                                    Chưa có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            thanhViens.map((record, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition">
                                                    <td className="border border-gray-300 px-4 py-3">{record.hoTen}</td>
                                                    <td className="border border-gray-300 px-4 py-3">{record.chucDanh?.label || record.chucDanh || ""}</td>
                                                    <td className="border border-gray-300 px-4 py-3">{record.donViCongTac}</td>
                                                    <td className="border border-gray-300 px-4 py-3">{record.noiDungCongViec}</td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                                        <div className="flex justify-center items-center">
                                                            <a
                                                                className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1 mb-1 cursor-pointer"
                                                                title="Chỉnh sửa"
                                                                onClick={() => {
                                                                    setEditingThanhVienIndex(index);
                                                                    thanhVienForm.setFieldsValue(record);
                                                                    setIsThanhVienModalOpen(true);
                                                                }}
                                                            >
                                                                <i className="fa-regular fa-pen-to-square"></i>
                                                            </a>

                                                            <Popconfirm
                                                                title="Xoá?"
                                                                onConfirm={() => setThanhViens(thanhViens.filter((_, i) => i !== index))}
                                                                okText="Xoá"
                                                                cancelText="Huỷ"
                                                            >
                                                                <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1 cursor-pointer" title="Xoá">
                                                                    <i className="fa-regular fa-trash"></i>
                                                                </a>
                                                            </Popconfirm>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
                        disabled={loading}
                        className="px-8 py-3 rounded-lg font-bold bg-portal-primary hover:bg-portal-hover text-white flex items-center justify-center gap-2 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang gửi..." : "Gửi đề xuất"} <i className="fa-solid fa-paper-plane text-white lg:ml-2"></i>
                    </button>
                </div>
            </Form>

            {/* Modal Tác giả */}
            <Modal
                title={editingTacGiaIndex !== null ? "Sửa tác giả" : "Thêm tác giả / đồng tác giả"}
                open={isTacGiaModalOpen}
                onCancel={() => setIsTacGiaModalOpen(false)}
                onOk={() => {
                    tacGiaForm.validateFields().then(() => {
                        const allValues = tacGiaForm.getFieldsValue(true);
                        if (editingTacGiaIndex !== null) {
                            const newTacGias = [...tacGias];
                            newTacGias[editingTacGiaIndex] = allValues;
                            setTacGias(newTacGias);
                        } else {
                            setTacGias([...tacGias, allValues]);
                        }
                        setIsTacGiaModalOpen(false);
                    });
                }}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose
            >
                <Form form={tacGiaForm} layout="vertical">
                    <Form.Item name="hoTen" label="Họ và tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="ngaySinh" label="Ngày sinh">
                        <DatePicker format="DD/MM/YYYY" className="w-full" />
                    </Form.Item>
                    <Form.Item name="donViCongTac" label="Nơi công tác">
                        <Input />
                    </Form.Item>
                    <Form.Item name="chucDanh" label="Chức danh">
                        <TDSelect
                            notFoundContent="Không tìm thấy dữ liệu"
                            reload
                            showSearch
                            placeholder="Chọn"
                            fetchOptions={async keyword => {
                                const res = await requestPOST<IPaginationResponse<any[]>>(`positions/search`, {
                                    pageNumber: 1,
                                    pageSize: 1000,
                                    keyword: keyword,
                                });
                                return (
                                    res.data?.data?.map(item => ({
                                        ...item,
                                        label: item?.name,
                                        value: item?.id,
                                    })) ?? []
                                );
                            }}
                            onChange={(value, current: any) => {
                                if (value) {
                                    tacGiaForm.setFieldValue('chucDanhId', current?.id);
                                } else {
                                    tacGiaForm.setFieldValue('chucDanhId', null);
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item name="trinhDoChuyenMon" label="Trình độ CM">
                        <TDSelect
                            notFoundContent="Không tìm thấy dữ liệu"
                            reload
                            showSearch
                            placeholder="Chọn"
                            fetchOptions={async keyword => {
                                const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                                    pageNumber: 1,
                                    pageSize: 1000,
                                    keyword: keyword,
                                    categoryGroupCode: CATEGORY_GROUP_CODE.TRINH_DO_CHUYEN_MON,
                                });
                                return (
                                    res.data?.data?.map(item => ({
                                        ...item,
                                        label: item?.name,
                                        value: item?.id,
                                    })) ?? []
                                );
                            }}
                            onChange={(value, current: any) => {
                                if (value) {
                                    tacGiaForm.setFieldValue('trinhDoChuyenMonId', current?.id);
                                } else {
                                    tacGiaForm.setFieldValue('trinhDoChuyenMonId', null);
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item name="tyLeDongGop" label="Đóng góp (%)">
                        <InputNumber min={0} max={100} className="w-full" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Thành viên */}
            <Modal
                title={editingThanhVienIndex !== null ? "Sửa thành viên" : "Thêm thành viên tham gia áp dụng thử"}
                open={isThanhVienModalOpen}
                onCancel={() => setIsThanhVienModalOpen(false)}
                onOk={() => {
                    thanhVienForm.validateFields().then(() => {
                        const allValues = thanhVienForm.getFieldsValue(true);
                        if (editingThanhVienIndex !== null) {
                            const newThanhViens = [...thanhViens];
                            newThanhViens[editingThanhVienIndex] = allValues;
                            setThanhViens(newThanhViens);
                        } else {
                            setThanhViens([...thanhViens, allValues]);
                        }
                        setIsThanhVienModalOpen(false);
                    });
                }}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose
            >
                <Form form={thanhVienForm} layout="vertical">
                    <Form.Item name="hoTen" label="Họ và tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="ngaySinh" label="Ngày sinh">
                        <DatePicker format="DD/MM/YYYY" className="w-full" />
                    </Form.Item>
                    <Form.Item name="donViCongTac" label="Nơi công tác">
                        <Input />
                    </Form.Item>
                    <Form.Item name="chucDanh" label="Chức danh">
                        <TDSelect
                            notFoundContent="Không tìm thấy dữ liệu"
                            reload
                            showSearch
                            placeholder="Chọn"
                            fetchOptions={async keyword => {
                                const res = await requestPOST<IPaginationResponse<any[]>>(`positions/search`, {
                                    pageNumber: 1,
                                    pageSize: 1000,
                                    keyword: keyword,
                                });
                                return (
                                    res.data?.data?.map(item => ({
                                        ...item,
                                        label: item?.name,
                                        value: item?.id,
                                    })) ?? []
                                );
                            }}
                            onChange={(value, current: any) => {
                                if (value) {
                                    thanhVienForm.setFieldValue('chucDanhId', current?.id);
                                } else {
                                    thanhVienForm.setFieldValue('chucDanhId', null);
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item name="trinhDoChuyenMon" label="Trình độ CM">
                        <TDSelect
                            notFoundContent="Không tìm thấy dữ liệu"
                            reload
                            showSearch
                            placeholder="Chọn"
                            fetchOptions={async keyword => {
                                const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                                    pageNumber: 1,
                                    pageSize: 1000,
                                    keyword: keyword,
                                    categoryGroupCode: CATEGORY_GROUP_CODE.TRINH_DO_CHUYEN_MON,
                                });
                                return (
                                    res.data?.data?.map(item => ({
                                        ...item,
                                        label: item?.name,
                                        value: item?.id,
                                    })) ?? []
                                );
                            }}
                            onChange={(value, current: any) => {
                                if (value) {
                                    thanhVienForm.setFieldValue('trinhDoChuyenMonId', current?.id);
                                } else {
                                    thanhVienForm.setFieldValue('trinhDoChuyenMonId', null);
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item name="noiDungCongViec" label="Nội dung công việc">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </Spin>
    );
};
