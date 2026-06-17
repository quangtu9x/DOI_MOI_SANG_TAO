import React from 'react';
import { Form, Input, Select, Radio, FormInstance } from 'antd';
import { TDSelect, FileUpload } from '@/app/components';
import { CATEGORY_GROUP_CODE, LOAI_BANGS } from '@/data';
import { requestPOST, API_URL } from '@/utils/baseAPI';
import { IPaginationResponse } from '@/models';

interface Props {
    form: FormInstance;
    onNext: () => void;
    fileList: any[];
    setFileList: (list: any[]) => void;
}

export const Step1FormThongTin: React.FC<Props> = ({ form, onNext, fileList, setFileList }) => {
    return (
        <Form
            form={form}
            layout="vertical"
            className="animate-fade-in max-w-[1000px] mx-auto mt-4"
            requiredMark={false}
            onFinish={onNext}
        >
            <div className="text-center mb-10">
                <h2 className="text-[20px] font-bold uppercase text-[#18191c]">ĐỀ XUẤT DỰ ÁN CNTT</h2>
            </div>

            <div className="mb-10">
                <h3 className="text-[16px] font-bold text-red-600 border-b border-gray-200 pb-2 mb-6 uppercase">
                    Phần 1. THÔNG TIN CHUNG
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[14px]">
                    <div className="md:col-span-2">
                        <Form.Item
                            name="ten"
                            label={
                                <span className="font-medium text-gray-800 text-[14px]">
                                    Tên kế hoạch (Tên dự án): <span className="text-red-500 ml-1">*</span>
                                </span>
                            }
                            rules={[{ required: true, message: 'Không được để trống!' }]}
                        >
                            <Input size="large" placeholder="Nhập tên kế hoạch..." />
                        </Form.Item>
                    </div>

                    <div>
                        <Form.Item
                            name="thoiGianThucHien"
                            label={
                                <span className="font-medium text-gray-800 text-[14px]">
                                    Thời gian thực hiện: <span className="text-red-500 ml-1">*</span>
                                </span>
                            }
                            rules={[{ required: true, message: 'Không được để trống!' }]}
                        >
                            <Input size="large" placeholder="Nhập thời gian..." />
                        </Form.Item>
                    </div>

                    <div>
                        <Form.Item
                            name="phanLoai"
                            label={
                                <span className="font-medium text-gray-800 text-[14px]">
                                    Phân loại: <span className="text-red-500 ml-1">*</span>
                                </span>
                            }
                            rules={[{ required: true, message: 'Vui lòng chọn phân loại!' }]}
                        >
                            <Select size="large" placeholder="Chọn phân loại">
                                {LOAI_BANGS.map((item: any) => (
                                    <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <div>
                        <Form.Item
                            name="loaiNhiemVu"
                            label={
                                <span className="font-medium text-gray-800 text-[14px]">
                                    Loại nhiệm vụ:
                                </span>
                            }
                        >
                            <TDSelect
                                notFoundContent="Không tìm thấy dữ liệu"
                                reload
                                showSearch
                                placeholder="Chọn loại nhiệm vụ"
                                fetchOptions={async (keyword) => {
                                    const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                                        pageNumber: 1,
                                        pageSize: 1000,
                                        keyword: keyword,
                                        categoryGroupCode: CATEGORY_GROUP_CODE.LOAI_NHIEM_VU,
                                    });
                                    return (
                                        res.data?.data?.map((item) => ({
                                            ...item,
                                            label: item?.name,
                                            value: item?.id,
                                        })) ?? []
                                    );
                                }}
                                onChange={(value, current: any) => {
                                    if (value) {
                                        form.setFieldValue('loaiNhiemVuId', current?.id);
                                    } else {
                                        form.setFieldValue('loaiNhiemVuId', null);
                                    }
                                }}
                            />
                        </Form.Item>
                    </div>

                    <div>
                        <Form.Item
                            name="nguonNhiemVu"
                            label={
                                <span className="font-medium text-gray-800 text-[14px]">
                                    Nguồn nhiệm vụ:
                                </span>
                            }
                        >
                            <TDSelect
                                notFoundContent="Không tìm thấy dữ liệu"
                                reload
                                showSearch
                                placeholder="Chọn nguồn nhiệm vụ"
                                fetchOptions={async (keyword) => {
                                    const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                                        pageNumber: 1,
                                        pageSize: 1000,
                                        keyword: keyword,
                                        categoryGroupCode: CATEGORY_GROUP_CODE.NGUON_NHIEM_VU,
                                    });
                                    return (
                                        res.data?.data?.map((item) => ({
                                            ...item,
                                            label: item?.name,
                                            value: item?.id,
                                        })) ?? []
                                    );
                                }}
                                onChange={(value, current: any) => {
                                    if (value) {
                                        form.setFieldValue('nguonNhiemVuId', current?.id);
                                    } else {
                                        form.setFieldValue('nguonNhiemVuId', null);
                                    }
                                }}
                            />
                        </Form.Item>
                    </div>

                    <div className="md:col-span-2">
                        <Form.Item
                            name="ghiChu"
                            label={
                                <span className="font-medium text-gray-800 text-[14px]">Ghi chú:</span>
                            }
                        >
                            <Input.TextArea size="large" rows={4} placeholder="Nhập ghi chú..." />
                        </Form.Item>
                    </div>

                    <div className="md:col-span-2">
                        <Form.Item
                            label={
                                <span className="font-medium text-gray-800 text-[14px]">Đính kèm:</span>
                            }
                        >
                            <FileUpload
                                URL={`${API_URL}/api/v1/attachments/public`}
                                fileList={fileList}
                                onChange={(e: any) => setFileList(e.fileList)}
                                multiple={true}
                            />
                        </Form.Item>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                <button
                    type="submit"
                    className="px-8 py-3 rounded-lg font-bold bg-portal-primary hover:bg-portal-hover text-white flex items-center justify-center gap-2 transition"
                >
                    Tiếp tục <i className="fa-solid fa-arrow-right text-white"></i>
                </button>
            </div>
        </Form>
    );
};