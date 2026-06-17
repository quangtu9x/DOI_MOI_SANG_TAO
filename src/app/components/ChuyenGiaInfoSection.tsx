import { useState, useEffect } from 'react';
import { DatePicker, Form, Input, Radio } from 'antd';
import { FormInstance } from 'antd/es/form';

import { IChuyenGia, IPaginationResponse, IResult } from '@/models';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { HeaderTitle, ImageUpload, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { GENDERS } from '@/data';
import { formatName, handleImage, toViewDate } from '@/utils/utils';

interface ChuyenGiaInfoSectionProps {
    form: FormInstance<any>;
    disabled?: boolean;
    initialChuyenGiaId?: string | null;
    onChuyenGiaIdChange?: (id: string | null) => void;
    showHeader?: boolean;
    headerTitle?: string;
}

export const ChuyenGiaInfoSection = ({
    form,
    disabled = false,
    initialChuyenGiaId = null,
    onChuyenGiaIdChange,
    showHeader = true,
    headerTitle = "Thông tin chuyên gia",
}: ChuyenGiaInfoSectionProps) => {
    const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
    const [chuyenGiaIdSelected, setChuyenGiaIdSelected] = useState<string | null>(initialChuyenGiaId);

    useEffect(() => {
        if (initialChuyenGiaId !== chuyenGiaIdSelected) {
            setChuyenGiaIdSelected(initialChuyenGiaId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialChuyenGiaId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await requestGET<IResult<IChuyenGia>>(`chuyengias/${chuyenGiaIdSelected}`);
                const _data = res?.data?.data ?? null;
                if (_data) {
                    setDinhKem(handleImage(_data?.dinhKem ?? ''));
                    form.setFieldsValue({
                        chuyenGia: {
                            ngaySinh: toViewDate(_data.ngaySinh),
                            gioiTinh: _data.gioiTinh,
                            dienThoai: _data.dienThoai,
                            email: _data.email,
                            diaChi: _data.diaChi,
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching chuyên gia:', error);
            }
        };

        if (chuyenGiaIdSelected) {
            fetchData();
        }
    }, [chuyenGiaIdSelected, form]);

    const handleChuyenGiaChange = (value: any, current: any) => {
        if (value) {
            const id = current?.id || null;
            form.setFieldValue('chuyenGiaId', id);
            setChuyenGiaIdSelected(id);
            onChuyenGiaIdChange?.(id);
        } else {
            form.setFieldValue('chuyenGiaId', null);
            setChuyenGiaIdSelected(null);
            setDinhKem([]);
            form.setFieldsValue({
                chuyenGia: {
                    ngaySinh: null,
                    gioiTinh: null,
                    dienThoai: null,
                    email: null,
                    diaChi: null,
                }
            });
            onChuyenGiaIdChange?.(null);
        }
    };

    return (
        <>
            {showHeader && <HeaderTitle title={headerTitle} />}
            <div className="row">
                <div className="col-xl-3 col-lg-3">
                    <Form.Item label="Ảnh chân dung (4x6)" name={['chuyenGia', 'dinhKem']}>
                        <ImageUpload
                            accept={['.png', '.jpg', '.jpeg']}
                            URL={`${API_URL}/api/v1/attachments/public`}
                            fileList={dinhKem}
                            data={{
                                generateThumbnail: true,
                            }}
                            onChange={e => {
                                setDinhKem(e.fileList);
                            }}
                            disabled
                        />
                    </Form.Item>
                </div>
                <div className="col-xl-9 col-lg-9">
                    <div className="row">
                        <div className="col-xl-6 col-lg-6">
                            <Form.Item
                                label="Chuyên gia"
                                name="chuyenGia"
                                rules={[
                                    { required: true, message: "Không được để trống!" },
                                ]}
                            >
                                <TDSelect
                                    notFoundContent="Không tìm thấy dữ liệu"
                                    reload
                                    showSearch
                                    placeholder="Chọn"
                                    disabled={disabled}
                                    fetchOptions={async keyword => {
                                        const res = await requestPOST<IPaginationResponse<any[]>>(`chuyengias/search`, {
                                            pageNumber: 1,
                                            pageSize: 1000,
                                            keyword: keyword,
                                        });
                                        return (
                                            res.data?.data?.map(item => ({
                                                ...item,
                                                label: formatName(item.hocHamVietTat, item.hocViVietTat, item.hoTen),
                                                value: item?.id,
                                            })) ?? []
                                        );
                                    }}
                                    onChange={handleChuyenGiaChange}
                                />
                            </Form.Item>
                        </div>
                        <div className="col-xl-3 col-lg-3">
                            <Form.Item label="Ngày sinh" name={['chuyenGia', 'ngaySinh']}>
                                <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} disabled />
                            </Form.Item>
                        </div>
                        <div className="col-xl-3 col-lg-3">
                            <Form.Item
                                name={['chuyenGia', 'gioiTinh']}
                                label="Giới tính"
                            >
                                <Radio.Group block disabled>
                                    {GENDERS?.map((item, key) => (
                                        <Radio.Button
                                            key={key}
                                            value={item.id}
                                        >
                                            <span className='user-select-none'>{item.name}</span>
                                        </Radio.Button>
                                    ))}
                                </Radio.Group>
                            </Form.Item>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-4 col-lg-4">
                            <Form.Item
                                label="Điện thoại"
                                name={['chuyenGia', 'dienThoai']}
                            >
                                <Input placeholder="" allowClear disabled />
                            </Form.Item>
                        </div>
                        <div className="col-xl-4 col-lg-4">
                            <Form.Item
                                label="Email"
                                name={['chuyenGia', 'email']}
                            >
                                <Input placeholder="" allowClear disabled />
                            </Form.Item>
                        </div>
                        <div className="col-xl-4 col-lg-4">
                            <Form.Item
                                label="Địa chỉ"
                                name={['chuyenGia', 'diaChi']}
                            >
                                <Input placeholder="" allowClear disabled />
                            </Form.Item>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
