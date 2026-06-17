import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AutoComplete, DatePicker, Form, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import {
  IPhieuDanhGiaNhanXet, IPaginationResponse, IResult, ICategory,
  LoaiPhieuDanhGiaNhanXet, LoaiNhiemVu, IChiTietDanhGiaNhanXet,
  IChiTietMoHoSo, IBienBanMoHoSo, LoaiChiTietMoHoSo
} from '@/models';
import { handleFiles, toSaveDate, toViewDate } from '@/utils/utils';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { HeaderTitle, TDSelect, UserSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';
import { BangChamDiem, GroupRow } from '../../common';



export const DanhGiaXHNVDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IPhieuDanhGiaNhanXet | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IPhieuDanhGiaNhanXet>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);

  const [mucTieus, setMucTieus] = useState<ICategory[]>([]);
  const [tongQuans, setTongQuans] = useState<ICategory[]>([]);
  const [noiDungs, setNoiDungs] = useState<ICategory[]>([]);
  const [cachTiepCans, setCachTiepCans] = useState<ICategory[]>([]);
  const [sanPhams, setSanPhams] = useState<ICategory[]>([]);
  const [nangLucs, setNangLucs] = useState<ICategory[]>([]);
  const [nhiemVuIdSelected, setNhiemVuIdSelected] = useState<string | null>(null);
  const [chiTietMoHoSos, setChiTietMoHoSos] = useState<IChiTietMoHoSo[]>([]);

  const categoriesLoaded =
    mucTieus.length &&
    tongQuans.length &&
    noiDungs.length &&
    cachTiepCans.length &&
    sanPhams.length &&
    nangLucs.length;

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
        const [
          mucTieu,
          tongQuan,
          noiDung,
          cachTiepCan,
          sanPham,
          nangLuc,
        ] = await Promise.all([
          fetchCategory(CATEGORY_GROUP_CODE.MUC_TIEU_DE_TAI),
          fetchCategory(CATEGORY_GROUP_CODE.TONG_QUAN_THNG),
          fetchCategory(CATEGORY_GROUP_CODE.NOI_DUNG),
          fetchCategory(CATEGORY_GROUP_CODE.CACH_TIEP_CAN),
          fetchCategory(CATEGORY_GROUP_CODE.SAN_PHAM_LOI_ICH),
          fetchCategory(CATEGORY_GROUP_CODE.NANG_LUC_TO_CHUC),
        ]);

        if (!mounted) return;

        setMucTieus(mucTieu);
        setTongQuans(tongQuan);
        setNoiDungs(noiDung);
        setCachTiepCans(cachTiepCan);
        setSanPhams(sanPham);
        setNangLucs(nangLuc);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IPhieuDanhGiaNhanXet>>(`PhieuDanhGiaNhanXets/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {

          const chiTietMap = new Map(
            (_data.chiTietDanhGiaNhanXets ?? []).map(x => [x.tieuChiId, x])
          );
          const buildChiTiet = (categories: ICategory[]) =>
            categories.map(tc => {
              const exist = chiTietMap.get(tc.id);
              return {
                id: exist?.id,
                tieuChiId: tc.id,
                diemSo: exist?.diemSo ?? null,
                heSo: Number(tc.description ?? 0),
                nhanXet: exist?.nhanXet ?? null,
              } as IChiTietDanhGiaNhanXet;
            });

          const chiTietDanhGiaNhanXets = [
            ...buildChiTiet(mucTieus),
            ...buildChiTiet(tongQuans),
            ...buildChiTiet(noiDungs),
            ...buildChiTiet(cachTiepCans),
            ...buildChiTiet(sanPhams),
            ...buildChiTiet(nangLucs),
          ];


          _data.ngayLapPhieu = toViewDate(_data.ngayLapPhieu);
          _data.nhiemVu = _data.nhiemVuTen ? { value: _data.nhiemVuId, label: _data.nhiemVuTen } : null;
          _data.chuNhiem = _data.chuNhiemId ? { value: _data.chuNhiemId, label: _data.chuNhiemHoTen } : null;
          _data.nguoiDanhGia = _data.nguoiDanhGiaId ? { value: _data.nguoiDanhGiaId, label: _data.nguoiDanhGiaHoTen } : null;
          form.setFieldsValue({
            ..._data,
            chiTietDanhGiaNhanXets
          });
        }
      } catch (error) {
        console.error('Error fetching organization unit:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (id && categoriesLoaded) {
      fetchData();
    }
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, categoriesLoaded]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await requestPOST<IPaginationResponse<IBienBanMoHoSo[]>>('BienBanMoHoSos/search', {
          pageNumber: 1,
          pageSize: 10,
          nhiemVuId: nhiemVuIdSelected,
        });
        const _data = res?.data?.data?.[0]?.chiTietMoHoSos ?? null;
        const hoSoHopLes = _data?.filter(x => x.phanLoai === LoaiChiTietMoHoSo.HoSoHopLe) ?? [];
        if (hoSoHopLes) {
          setChiTietMoHoSos(hoSoHopLes);
        }
      } catch (error) {
        console.error('Error searching business:', error);
      }
    }
    if (nhiemVuIdSelected) {
      fetchData();
    }
  }, [nhiemVuIdSelected, form]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);

      const chiTiet = values.chiTietDanhGiaNhanXets as IChiTietDanhGiaNhanXet[];

      const chuaCham = chiTiet?.filter(
        x => x.diemSo === null || x.diemSo === undefined
      );

      if (chuaCham && chuaCham.length > 0) {
        toast.warning(
          `Vui lòng chấm điểm đầy đủ cho tất cả tiêu chí (${chuaCham.length} tiêu chí chưa chấm)`
        );
        setButtonLoading(false);
        return;
      }

      const formData: IPhieuDanhGiaNhanXet = {
        ...values,
        ...(id && { id }),
        ngayLapPhieu: toSaveDate(values.ngayLapPhieu),
        dinhKem: handleFiles(dinhKem).join('##'),
        chiTietDanhGiaNhanXets: values.chiTietDanhGiaNhanXets,
      };



      const response = id
        ? await requestPUT<IResult<string>>(`PhieuDanhGiaNhanXets/${id}`, formData)
        : await requestPOST<IResult<string>>(`PhieuDanhGiaNhanXets`, formData);

      if (response?.status == 200) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
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
      fullscreen={true}
      size="xl"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : (id ? 'Chỉnh sửa' : 'Tạo mới')}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IPhieuDanhGiaNhanXet>
              initialValues={{
                loaiPhieu: LoaiPhieuDanhGiaNhanXet.DanhGia
              }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <HeaderTitle title={"Thông tin chung"} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Nhiệm vụ" name="nhiemVu" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`nhiemvuchinhthucs/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                          loaiNhiemVu: LoaiNhiemVu.KhoaHocXaHoiNhanVan,
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
                          form.setFieldValue('nhiemVuId', current?.id);
                          setNhiemVuIdSelected(current?.id);
                        } else {
                          form.setFieldValue('nhiemVuId', null);
                          setNhiemVuIdSelected(current?.id);
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
                    label="Tên cá nhân/tổ chức đăng ký"
                    name='tenCaNhanToChucDangKy'
                    className="mb-0"
                    rules={[{ required: true, message: "Không được để trống!" }]}
                  >
                    <AutoComplete
                      options={chiTietMoHoSos.map(item => ({ value: item.tenCaNhanToChucDangKy }))}
                      placeholder=""
                      allowClear
                      filterOption={(inputValue, option) =>
                        option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                      }
                    />
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
                      useCurrentUserDefault={!id}
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
              <Form.List name="chiTietDanhGiaNhanXets">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th rowSpan={2} className="text-center align-middle" >Tiêu chí đánh giá</th>
                            <th colSpan={5} className="text-center">Người đánh giá</th>
                            <th rowSpan={2} className="text-center align-middle" >Hệ số</th>
                          </tr>
                          <tr>
                            {[4, 3, 2, 1, 0].map(v => (
                              <th key={v} className="text-center" style={{ width: '5%' }}>{v}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <GroupRow title={"1. Mục tiêu nghiên cứu của đề tài"} />
                          <BangChamDiem
                            data={mucTieus}
                            form={form}
                            disabled={dataModal?.readOnly ?? false}
                            startIndex={0}
                          />
                          <GroupRow title={"2. Tổng quan tình hình nghiên cứu "} />
                          <BangChamDiem
                            data={tongQuans}
                            form={form}
                            disabled={dataModal?.readOnly ?? false}
                            startIndex={mucTieus.length}
                          />
                          <GroupRow title={"3. Nội dung, phương án tổ chức thực hiện "} />
                          <BangChamDiem
                            data={noiDungs}
                            form={form}
                            disabled={dataModal?.readOnly ?? false}
                            startIndex={mucTieus.length + tongQuans.length}
                          />
                          <GroupRow title={"4. Cách tiếp cận và phương pháp nghiên cứu "} />
                          <BangChamDiem
                            data={cachTiepCans}
                            form={form}
                            disabled={dataModal?.readOnly ?? false}
                            startIndex={mucTieus.length + tongQuans.length + noiDungs.length}
                          />
                          <GroupRow title={"5. Sản phẩm, lợi ích của đề tài và phương án chuyển giao kết quả "} />

                          <BangChamDiem
                            data={sanPhams}
                            form={form}
                            disabled={dataModal?.readOnly ?? false}
                            startIndex={
                              mucTieus.length +
                              tongQuans.length +
                              noiDungs.length +
                              cachTiepCans.length
                            }
                          />
                          <GroupRow title={"6. Năng lực tổ chức và cá nhân "} />

                          <BangChamDiem
                            data={nangLucs}
                            form={form}
                            disabled={dataModal?.readOnly ?? false}
                            startIndex={
                              mucTieus.length +
                              tongQuans.length +
                              noiDungs.length +
                              cachTiepCans.length +
                              sanPhams.length
                            }
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
              {id ? 'Lưu' : 'Tạo mới'}
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