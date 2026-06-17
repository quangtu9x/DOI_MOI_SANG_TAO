import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IPhieuDanhGiaSangKien, IPaginationResponse, IResult, ICategory, IChiTietDanhGiaSangKien, TrangThaiHoSoSangKien } from '@/models';
import { handleFiles, toSaveDate, toViewDate } from '@/utils/utils';
import { requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { HeaderTitle, TDSelect, UserSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';
import { useAuth } from '@/app/modules/auth';
import { BangDanhGiaSangKien } from './BangDanhGiaSangKien';

export const DanhGiaSangKienDetailModal = props => {
    const dispatch: AppDispatch = useDispatch();
    const dataModal = useSelector((state: RootState) => state.modal.dataModal) as any | null;
    const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
    const id = dataModal?.id ?? null;
    const hoSoIdFromModal = dataModal?.hoSoId ?? null;
    const { currentUser } = useAuth();

    const [form] = Form.useForm<IPhieuDanhGiaSangKien>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
    const [realPhieuId, setRealPhieuId] = useState<string | null>(null);

    const [tieuChiDanhGias, setTieuChiDanhGias] = useState<ICategory[]>([]);

    const categoriesLoaded =
        tieuChiDanhGias.length

    const fetchCategory = async (groupCode: string) => {
        const res = await requestPOST<IPaginationResponse<ICategory[]>>(
            'categories/search',
            {
                pageNumber: 1,
                pageSize: 1000,
                categoryGroupCode: groupCode,
            }
        );
        return res?.data?.data ?? [];
    };

    useEffect(() => {
        let mounted = true;
        const fetchAll = async () => {
            try {
                const [tieuChiDanhGias] = await Promise.all([
                    fetchCategory(CATEGORY_GROUP_CODE.TIEU_CHI_DANH_GIA_SANG_KIEN),

                ]);
                if (!mounted) return;
                setTieuChiDanhGias(tieuChiDanhGias);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAll();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setIsLoading(true);
                let _id = id;

                if (!_id && hoSoIdFromModal && currentUser) {
                    const searchRes = await requestPOST<IPaginationResponse<IPhieuDanhGiaSangKien[]>>(
                        'PhieuDanhGiaSangKiens/search',
                        {
                            pageNumber: 1,
                            pageSize: 1,
                            hoSoSangKienId: hoSoIdFromModal,
                            nguoiDanhGiaId: currentUser.id
                        }
                    );
                    if (searchRes.data?.data?.length! > 0) {
                        _id = searchRes?.data?.data[0].id;
                        setRealPhieuId(_id);
                    }
                }

                if (_id) {
                    const response = await requestGET<IResult<IPhieuDanhGiaSangKien>>(`PhieuDanhGiaSangKiens/${_id}`);
                    const _data = response?.data?.data ?? null;
                    if (_data) {
                        const chiTietMap = new Map((_data.chiTietDanhGiaSangKiens ?? []).map(x => [x.tieuChiId, x]));
                        const buildChiTiet = (categories: ICategory[]) =>
                            categories.map(tc => {
                                const exist = chiTietMap.get(tc.id);
                                return {
                                    id: exist?.id,
                                    tieuChiId: tc.id,
                                    diemSo: exist?.diemSo ?? null,
                                    heSo: 1,
                                    nhanXet: exist?.nhanXet ?? null,
                                } as IChiTietDanhGiaSangKien;
                            });

                        const chiTietDanhGiaSangKiens = [
                            ...buildChiTiet(tieuChiDanhGias),
                        ];

                        _data.ngayLapPhieu = toViewDate(_data.ngayLapPhieu);
                        _data.hoSoSangKien = _data.hoSoSangKienTen ? { value: _data.hoSoSangKienId, label: _data.hoSoSangKienTen } : null;
                        _data.nguoiDanhGia = _data.nguoiDanhGiaId ? { value: _data.nguoiDanhGiaId, label: _data.nguoiDanhGiaHoTen } : null;
                        form.setFieldsValue({ ..._data, chiTietDanhGiaSangKiens });
                    }
                } else if (hoSoIdFromModal) {
                    const buildEmptyChiTiet = (categories: ICategory[]) =>
                        categories.map(tc => ({
                            tieuChiId: tc.id,
                            diemSo: null,
                            heSo: 1,
                            nhanXet: null,
                        }));

                    form.setFieldsValue({
                        hoSoSangKienId: hoSoIdFromModal,
                        hoSoSangKien: { value: hoSoIdFromModal, label: dataModal?.hoSoSangKienTen },
                        nguoiDanhGiaId: currentUser?.id,
                        nguoiDanhGia: { value: currentUser?.id, label: currentUser?.fullName },
                        ngayLapPhieu: dayjs(),
                        chiTietDanhGiaSangKiens: [
                            ...buildEmptyChiTiet(tieuChiDanhGias),
                        ]
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
            } finally {
                setIsLoading(false);
            }
        };
        if ((id || hoSoIdFromModal) && categoriesLoaded) {
            fetchData();
        }
    }, [id, hoSoIdFromModal, currentUser, categoriesLoaded, tieuChiDanhGias, form, dataModal]);

    const handleCancel = () => {
        form.resetFields();
        setRealPhieuId(null);
        dispatch(actionsModal.setModalVisible(false));
    };

    const onFinish = async () => {
        setButtonLoading(true);
        try {
            await form.validateFields();
            const values = form.getFieldsValue(true);
            const chiTiet = values.chiTietDanhGiaSangKiens as IChiTietDanhGiaSangKien[];
            const chuaCham = chiTiet?.filter(x => x.diemSo === null || x.diemSo === undefined);

            if (chuaCham && chuaCham.length > 0) {
                toast.warning(`Vui lòng chấm điểm đầy đủ cho tất cả tiêu chí (${chuaCham.length} tiêu chí chưa chấm)`);
                setButtonLoading(false);
                return;
            }

            const currentId = id || realPhieuId;
            const formData: IPhieuDanhGiaSangKien = {
                ...values,
                ...(currentId && { id: currentId }),
                ngayLapPhieu: toSaveDate(values.ngayLapPhieu),
                dinhKem: handleFiles(dinhKem).join('##'),
                chiTietDanhGiaSangKiens: values.chiTietDanhGiaSangKiens,
            };

            const response = currentId
                ? await requestPUT<IResult<string>>(`PhieuDanhGiaSangKiens/${currentId}`, formData)
                : await requestPOST<IResult<string>>(`PhieuDanhGiaSangKiens`, formData);

            if (response?.status == 200) {
                toast.success(currentId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
                dispatch(actionsGlobal.setRandom());
                handleCancel();
            } else {
                toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
            }
        } catch (errorInfo) {
            console.log('Failed:', errorInfo);
        } finally {
            setButtonLoading(false);
        }
    };

    return (
        <Modal
            show={modalVisible}
            fullscreen={'lg-down'}
            size="xl"
            onExited={handleCancel}
            keyboard={true}
            scrollable={true}
            onEscapeKeyDown={handleCancel}
        >
            <Modal.Header className="bg-primary px-4 py-3">
                <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : (id || realPhieuId ? 'Chỉnh sửa phiếu đánh giá' : 'Lập phiếu đánh giá mới')}</Modal.Title>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
            </Modal.Header>
            <Modal.Body>
                <Spin spinning={isLoading}>
                    {!isLoading && (
                        <Form<IPhieuDanhGiaSangKien>
                            initialValues={{}}
                            form={form} layout="vertical" autoComplete="off"
                            disabled={dataModal?.readOnly ?? false}>
                            <HeaderTitle title={"Thông tin chung"} />
                            <div className="row">
                                <div className="col-xl-12 col-lg-12">
                                    <Form.Item label="Hồ sơ sáng kiến" name="hoSoSangKien" rules={[{ required: true, message: 'Không được để trống!' }]}>
                                        <TDSelect
                                            disabled={!!hoSoIdFromModal}
                                            notFoundContent="Không tìm thấy dữ liệu"
                                            reload
                                            showSearch
                                            placeholder="Chọn"
                                            fetchOptions={async keyword => {
                                                const res = await requestPOST<IPaginationResponse<any[]>>(`hososangkiens/search`, {
                                                    pageNumber: 1,
                                                    pageSize: 1000,
                                                    keyword: keyword,
                                                    trangThai: TrangThaiHoSoSangKien.DangThamDinh,
                                                });
                                                return (
                                                    res.data?.data?.map(item => ({
                                                        ...item,
                                                        label: item?.ten,
                                                        value: item?.id,
                                                    })) ?? []
                                                );
                                            }}
                                            onChange={(value, current: any) => {
                                                if (value) {
                                                    form.setFieldValue('hoSoSangKienId', current?.id);
                                                } else {
                                                    form.setFieldValue('hoSoSangKienId', null);
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                </div>
                                <div className="col-xl-4 col-lg-4">
                                    <Form.Item label="Ngày lập phiếu" name='ngayLapPhieu' initialValue={dayjs()}>
                                        <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                                    </Form.Item>
                                </div>
                                <div className="col-xl-4 col-lg-4">
                                    <Form.Item
                                        label="Chuyên gia đánh giá"
                                        name='nguoiDanhGia'
                                        className="mb-0"
                                        rules={[{ required: true, message: "Không được để trống!" }]}
                                    >
                                        <UserSelect
                                            disabled={true}
                                            useCurrentUserDefault={!id}
                                            initialUserId={id ? dataModal?.nguoiDanhGiaId : undefined}
                                            onDefaultValueSet={(value, userId) => {
                                                form.setFieldsValue({
                                                    nguoiDanhGia: value,
                                                    nguoiDanhGiaId: userId,
                                                });
                                            }}
                                            onUserIdChange={(userId) => form.setFieldValue('nguoiDanhGiaId', userId)} />
                                    </Form.Item>
                                </div>
                            </div>
                            <HeaderTitle title={"Thông tin đánh giá"} />
                            <Form.List name="chiTietDanhGiaSangKiens">
                                {(fields, { add, remove }) => (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="text-center align-middle" >Tiêu chí đánh giá</th>
                                                        <th className="text-center align-middle" style={{ width: '160px' }}>Chuyên gia đánh giá</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <BangDanhGiaSangKien
                                                        data={tieuChiDanhGias}
                                                        form={form}
                                                        disabled={dataModal?.readOnly ?? false}
                                                        startIndex={0}
                                                        isNhanXet={true}
                                                        fieldset="chiTietDanhGiaSangKiens"
                                                    />
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </Form.List>
                        </Form>
                    )}
                </Spin>
            </Modal.Body>
            <Modal.Footer className="bg-light px-4 py-2 align-items-center">
                {!dataModal?.readOnly && (
                    <div className="d-flex justify-content-center  align-items-center">
                        <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish} disabled={buttonLoading}>
                            <i className="fa-regular fa-floppy-disk"></i>
                            {id || realPhieuId ? 'Lưu cập nhật' : 'Gửi phiếu đánh giá'}
                        </Button>
                    </div>
                )}
                <div className="d-flex justify-content-center  align-items-center">
                    <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel} disabled={buttonLoading}>
                        <i className="fa-regular fa-xmark"></i>Đóng
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};
