import { ICategory, IChuyenGia, IResult } from "@/models";
import { requestGET } from "@/utils/baseAPI";
import { getThumbnailUrl, formatName } from "@/utils/utils";
import { Avatar, Form, FormInstance, InputNumber, Space } from "antd";

export const GroupRow = ({ title }: { title: string }) => (
    <tr className="table-secondary">
        <td colSpan={2} className="fw-bold">
            {title}
        </td>
    </tr>
);
export const BangDanhGiaSangKien = ({
    data,
    form,
    disabled,
    startIndex,
    isNhanXet = false,
    fieldset = "chiTietDanhGiaNhanXets"
}: {
    data: ICategory[];
    form: FormInstance;
    disabled?: boolean;
    startIndex: number;
    isNhanXet?: boolean;
    fieldset?: string;
}) => {
    return (
        <>
            {data.map((item, idx) => {
                const index = startIndex + idx;
                const maxScore = Number(item.description ?? 0) || 0;
                return (
                    <>
                        <tr key={item.id}>
                            <td className="fw-bold">{item.name}</td>
                            <td className="text-center">
                                <Form.Item shouldUpdate className="mb-0">
                                    {() => {
                                        const value = form.getFieldValue([fieldset, index, 'diemSo']);
                                        return (
                                            <InputNumber
                                                className="w-100"
                                                min={0}
                                                max={maxScore}
                                                precision={0}
                                                value={value}
                                                disabled={disabled}
                                                placeholder={`0 - ${maxScore}`}
                                                onChange={(v) => {
                                                    form.setFieldValue(
                                                        [fieldset, index],
                                                        {
                                                            tieuChiId: item.id,
                                                            diemSo: v,
                                                            heSo: 1,
                                                        }
                                                    );
                                                }}
                                            />
                                        );
                                    }}
                                </Form.Item>
                            </td>
                        </tr>
                        {isNhanXet &&
                            <tr key={item.id + 'nhanXet'}>
                                <td colSpan={2}>
                                    <Form.Item
                                        shouldUpdate
                                        className="mb-0"
                                    >
                                        {() => {
                                            const value = form.getFieldValue([fieldset, index, 'nhanXet']);
                                            return (
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Ý kiến nhận xét"
                                                    value={value}
                                                    disabled={disabled}
                                                    onChange={(e) => {
                                                        form.setFieldValue(
                                                            [fieldset, index, 'nhanXet'],
                                                            e.target.value
                                                        );
                                                    }}
                                                />
                                            );
                                        }}
                                    </Form.Item>
                                </td>
                            </tr>
                        }
                    </>


                );
            })}
        </>
    );
};

export const getChuyenGiaLabel = async (itemId: any,) => {
    let thanhVienLabel: React.ReactNode = "";
    if (itemId) {
        try {
            const res = await requestGET<IResult<IChuyenGia>>(`chuyengias/${itemId}`);
            const chuyenGiaData = res?.data?.data;
            if (chuyenGiaData) {
                thanhVienLabel = (
                    <Space>
                        <Avatar
                            size="small"
                            src={chuyenGiaData.dinhKem ? getThumbnailUrl(chuyenGiaData.dinhKem) : undefined}
                            icon={!chuyenGiaData.dinhKem && <i className="fa-regular fa-user"></i>}
                        />
                        {formatName(chuyenGiaData.hocHamVietTat, chuyenGiaData.hocViVietTat, chuyenGiaData.hoTen)}
                    </Space>
                );
            }
        } catch (error) {
            console.error('Error fetching chuyengia info:', error);
        }
    }
    return thanhVienLabel;
}
