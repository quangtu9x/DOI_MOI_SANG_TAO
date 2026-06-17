import { ICategory, IChuyenGia, IResult } from "@/models";
import { requestGET } from "@/utils/baseAPI";
import { getThumbnailUrl, formatName } from "@/utils/utils";
import { Avatar, Form, FormInstance, Space } from "antd";

interface SingleSelectCheckboxProps {
    value?: number;
    current: number;
    onChange?: (value: number) => void;
    disabled?: boolean;
}

export const SingleSelectCheckbox = ({
    value,
    current,
    onChange,
    disabled
}: SingleSelectCheckboxProps) => {
    return (
        <input
            type="checkbox"
            className="form-check-input"
            checked={value === current}
            disabled={disabled}
            onChange={() => onChange?.(current)}
        />
    );
};
export const GroupRow = ({ title }: { title: string }) => (
    <tr className="table-secondary">
        <td colSpan={8} className="fw-bold">
            {title}
        </td>
    </tr>
);
export const BangChamDiem = ({
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
                return (
                    <>
                        <tr key={item.id}>
                            <td>{item.name}</td>

                            {[4, 3, 2, 1, 0].map(score => (
                                <td key={score} className="text-center">
                                    <Form.Item
                                        shouldUpdate
                                        className="mb-0"
                                    >
                                        {() => {
                                            const value = form.getFieldValue([fieldset, index, 'diemSo']);
                                            return (
                                                <SingleSelectCheckbox
                                                    value={value}
                                                    current={score}
                                                    disabled={disabled}
                                                    onChange={(v) => {
                                                        form.setFieldValue(
                                                            [fieldset, index],
                                                            {
                                                                tieuChiId: item.id,
                                                                diemSo: v,
                                                                heSo: Number(item.description ?? 0),
                                                            }
                                                        );
                                                    }}
                                                />
                                            );
                                        }}
                                    </Form.Item>
                                </td>
                            ))}
                            <td className="text-center">{Number(item.description ?? 0)}</td>
                        </tr>
                        {isNhanXet &&
                            <tr key={item.id + 'nhanXet'}>
                                <td colSpan={7}>
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
