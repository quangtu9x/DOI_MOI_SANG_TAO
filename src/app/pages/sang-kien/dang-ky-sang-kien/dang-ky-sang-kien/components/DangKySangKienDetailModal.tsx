import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IHoSoSangKien, IPaginationResponse, IResult, TrangThaiHoSoSangKien } from '@/models';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { API_URL, requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { FileUpload, OrganizationUnitTreeSelect, SubTitle, TDSelect, UserSelect, TDTable } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';
import { TRANG_THAI_HO_SO_SANG_KIEN } from '@/data/sang-kien';
import { YKienFormList } from '@/app/pages/sang-kien/components/YKienFormList';

export const DangKySangKienDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IHoSoSangKien | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IHoSoSangKien>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);

  // Step 1: Chọn nguồn (Tạo mới / Từ cổng)
  // Step 2: Chọn hồ sơ từ cổng (trạng thái Đã tiếp nhận)
  // Step 3: Nhập liệu
  const [step, setStep] = useState(id ? 3 : 1);
  const [sourceType, setSourceType] = useState<'new' | 'portal' | null>(null);

  const [portalDossiers, setPortalDossiers] = useState<IHoSoSangKien[]>([]);
  const [isFetchingPortal, setIsFetchingPortal] = useState(false);
  const [selectedPortalRecord, setSelectedPortalRecord] = useState<IHoSoSangKien | null>(null);
  const [portalPagination, setPortalPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [portalKeyword, setPortalKeyword] = useState("");

  const fetchPortalDossiers = useCallback(async (page = 1, keyword = "") => {
    try {
      setIsFetchingPortal(true);
      const res = await requestPOST<IPaginationResponse<IHoSoSangKien[]>>(`HoSoSangKiens/search`, {
        pageNumber: page,
        pageSize: portalPagination.pageSize,
        keyword: keyword,
        capQuanLyCode: 'CAP_CO_SO',
        trangThai: TrangThaiHoSoSangKien.DaTiepNhan,
        layTheoDonViDuocYeuCau: true
      });
      if (res.data) {
        setPortalDossiers(res.data.data ?? []);
        setPortalPagination(prev => ({ ...prev, current: page, total: res.data?.totalCount ?? 0 }));
      }
    } catch (error) {
      console.error("Error fetching portal dossiers:", error);
    } finally {
      setIsFetchingPortal(false);
    }
  }, [portalPagination.pageSize]);

  useEffect(() => {
    if (modalVisible && step === 2) {
      fetchPortalDossiers(1, "");
    }
  }, [modalVisible, step, fetchPortalDossiers]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IHoSoSangKien>>(`HoSoSangKiens/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          _data.dotXetSangKien = _data.dotXetSangKienId ? {
            value: _data.dotXetSangKienId,
            label: _data.dotXetSangKienTen,
          } : null;

          _data.linhVuc = _data.linhVucId ? {
            value: _data.linhVucId,
            label: _data.linhVucTen,
          } : null;

          _data.ngayDuocApDungLanDau = toViewDate(_data.ngayDuocApDungLanDau);
          _data.ngayNopHoSo = toViewDate(_data.ngayNopHoSo);

          _data.thanhViens = _data.thanhViens?.map(item => ({
            ...item,
            ngaySinh: toViewDate(item.ngaySinh),
            trinhDoChuyenMon: item.trinhDoChuyenMonId ? {
              value: item.trinhDoChuyenMonId,
              label: item.trinhDoChuyenMonTen,
            } : null,
            chucDanh: item.chucDanhId ? {
              value: item.chucDanhId,
              label: item.chucDanhTen,
            } : null
          })) ?? [];
          _data.tacGias = _data.thanhViens.filter(item => item.thamGiaApDungThu !== true);
          _data.thanhVienThamGiaApDungThus = _data.thanhViens.filter(item => item.thamGiaApDungThu === true);

          form.setFieldsValue({
            ..._data,
            thanhViens: _data.thanhViens ?? [],
            tacGias: _data.tacGias ?? [],
            thanhVienThamGiaApDungThus: _data.thanhVienThamGiaApDungThus ?? [],
            phieuDanhGiaSangKiens: _data.phieuDanhGiaSangKiens?.map(item => ({
              ...item,
              ngayLapPhieu: toViewDate(item.ngayLapPhieu),
              chiTietDanhGiaSangKiens: item.chiTietDanhGiaSangKiens ?? []
            })) ?? [],
            yKienCapCoSo: _data.yKienCapCoSo ?? [],
            yKienCapThanhPho: _data.yKienCapThanhPho ?? [],
          });
        }
      } catch (error) {
        console.error('Error fetching dossier:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id, form]);

  const handleCancel = () => {
    form.resetFields();
    setStep(id ? 3 : 1);
    setSourceType(null);
    setSelectedPortalRecord(null);
    dispatch(actionsModal.setModalVisible(false));
  };

  const handleNextStep1 = () => {
    if (!sourceType) {
      toast.warning("Vui lòng chọn nguồn sáng kiến!");
      return;
    }
    if (sourceType === 'new') {
      form.resetFields();
      setDinhKem([]);
      setSelectedPortalRecord(null);
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleNextStep2 = async () => {
    if (!selectedPortalRecord) {
      toast.warning("Vui lòng chọn một hồ sơ từ cổng!");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Lấy ID đơn vị mặc định có code 'okgazeio4g'
      const orgRes = await requestPOST<IPaginationResponse<any[]>>('OrganizationUnits/search', {
        pageNumber: 1,
        pageSize: 1,
        code: 'okgazeio4g'
      });
      const defaultOrg = orgRes.data?.data?.[0];

      // 2. Clone dữ liệu
      const cloneData = { ...selectedPortalRecord };
      setDinhKem(handleImage(cloneData.dinhKem ?? ''));

      const processedData = {
        ...cloneData,
        id: undefined, // Create mode
        dotXetSangKienId: null, // Yêu cầu chọn đợt cấp thành phố
        dotXetSangKien: null,
        donViDuocYeuCauId: defaultOrg?.id ?? null,
        donViDuocYeuCauTen: defaultOrg?.name ?? null,
        nguoiNopHoSoId: undefined, // Yêu cầu chọn người nộp mới
        ngayDuocApDungLanDau: toViewDate(cloneData.ngayDuocApDungLanDau),
        ngayNopHoSo: dayjs(),
        linhVuc: cloneData.linhVucId ? {
          value: cloneData.linhVucId,
          label: cloneData.linhVucTen,
        } : null,
        thanhViens: cloneData.thanhViens?.map(item => ({
          ...item,
          id: undefined,
          ngaySinh: toViewDate(item.ngaySinh),
          trinhDoChuyenMon: item.trinhDoChuyenMonId ? {
            value: item.trinhDoChuyenMonId,
            label: item.trinhDoChuyenMonTen,
          } : null,
          chucDanh: item.chucDanhId ? {
            value: item.chucDanhId,
            label: item.chucDanhTen,
          } : null
        })) ?? [],
        yKienCapCoSo: cloneData.yKienCapCoSo?.map(item => ({ ...item, id: undefined })) ?? [],
        yKienCapThanhPho: []
      };

      const tacGias = processedData.thanhViens.filter(item => item.thamGiaApDungThu !== true);
      const thanhVienThamGiaApDungThus = processedData.thanhViens.filter(item => item.thamGiaApDungThu === true);

      form.setFieldsValue({
        ...processedData,
        tacGias,
        thanhVienThamGiaApDungThus,
        phieuDanhGiaSangKiens: processedData.phieuDanhGiaSangKiens?.map(item => ({
          ...item,
          ngayLapPhieu: toViewDate(item.ngayLapPhieu),
          chiTietDanhGiaSangKiens: item.chiTietDanhGiaSangKiens ?? []
        })) ?? [],
        yKienCapCoSo: processedData.yKienCapCoSo ?? [],
        yKienCapThanhPho: processedData.yKienCapThanhPho ?? []
      });

      setStep(3);
    } catch (error) {
      console.error("Error cloning data:", error);
      toast.error("Có lỗi xảy ra khi lấy thông tin đơn vị mặc định!");
    } finally {
      setIsLoading(false);
    }
  };

  const onFinish = async (trangThaiHoSoSangKien: TrangThaiHoSoSangKien = TrangThaiHoSoSangKien.ChoTiepNhan) => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formData: IHoSoSangKien = {
        ...values,
        ...(id && { id }),
        ngayDuocApDungLanDau: toSaveDate(values.ngayDuocApDungLanDau),
        ngayNopHoSo: toSaveDate(values.ngayNopHoSo),
        dinhKem: handleFiles(dinhKem).join('##'),
        trangThai: trangThaiHoSoSangKien,
        thanhViens: [
          ...(values.tacGias || []).map(item => ({
            ...item,
            ngaySinh: toSaveDate(item.ngaySinh),
            thamGiaApDungThu: false
          })),
          ...(values.thanhVienThamGiaApDungThus || []).map(item => ({
            ...item,
            ngaySinh: toSaveDate(item.ngaySinh),
            thamGiaApDungThu: true
          }))
        ]
      };

      const response = id
        ? await requestPUT<IResult<string>>(`HoSoSangKiens/${id}`, formData)
        : await requestPOST<IResult<string>>(`HoSoSangKiens`, formData);

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

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setPortalKeyword(val);
    fetchPortalDossiers(1, val);
  };

  const portalColumns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(portalPagination.current - 1) * portalPagination.pageSize + index + 1}</div>,
    },
    {
      title: 'Tên sáng kiến',
      dataIndex: 'ten',
      key: 'ten',
      render: (text) => <span className="fw-bold">{text}</span>
    },
    {
      title: 'Đợt xét sáng kiến',
      dataIndex: 'dotXetSangKienTen',
      key: 'dotXetSangKienTen',
      width: '15%'
    },
    {
      title: 'Đơn vị được yêu cầu công nhận',
      dataIndex: 'donViDuocYeuCauTen',
      key: 'donViDuocYeuCauTen',
      width: '15%'
    },
    {
      title: "Chủ đầu tư",
      dataIndex: "chuDauTu",
      key: "chuDauTu",
      className: "text-center",
      width: '15%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      className: 'text-center',
      width: '10%',
      render: (data) => {
        const trangThai = TRANG_THAI_HO_SO_SANG_KIEN.find(item => item.id === data);
        return (
          <span className={trangThai ? trangThai.className : 'badge badge-light-secondary'}>
            {trangThai ? trangThai.name : 'Chưa xác định'}
          </span>
        );
      },
    },
  ];

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
        <Modal.Title className="text-white">
          {step === 1 && "Bước 1: Chọn nguồn sáng kiến"}
          {step === 2 && "Bước 2: Chọn hồ sơ từ cổng đăng ký"}
          {step === 3 && (dataModal?.readOnly ? 'Chi tiết' : (id ? 'Chỉnh sửa' : (sourceType === 'new' ? 'Bước 2: Hoàn thiện thông tin đăng ký cấp Thành phố' : 'Bước 3: Hoàn thiện thông tin đăng ký cấp Thành phố')))}
        </Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        {step === 1 && (
          <div className="p-10">
            <div className="row justify-content-center">
              <div className="col-lg-4 mb-4">
                <div
                  className={`card h-100 cursor-pointer border hover-elevate-up ${sourceType === 'new' ? 'border-primary bg-light-primary' : 'border-gray-300'}`}
                  onClick={() => setSourceType('new')}
                >
                  <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-10">
                    <i className={`fa-regular fa-plus-circle fs-4x mb-5 ${sourceType === 'new' ? 'text-primary' : 'text-gray-400'}`}></i>
                    <h3 className="card-title fw-bold text-dark fs-2 mb-2">Tạo mới</h3>
                    <p className="text-gray-500 fw-semibold fs-6">Đăng ký hồ sơ sáng kiến mới hoàn toàn cấp Thành phố</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 mb-4">
                <div
                  className={`card h-100 cursor-pointer border hover-elevate-up ${sourceType === 'portal' ? 'border-primary bg-light-primary' : 'border-gray-300'}`}
                  onClick={() => setSourceType('portal')}
                >
                  <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-10">
                    <i className={`fa-regular fa-globe fs-4x mb-5 ${sourceType === 'portal' ? 'text-primary' : 'text-gray-400'}`}></i>
                    <h3 className="card-title fw-bold text-dark fs-2 mb-2">Chọn sáng kiến từ cổng</h3>
                    <p className="text-gray-500 fw-semibold fs-6">Lấy dữ liệu từ các hồ sơ đã được tiếp nhận từ cổng đăng ký</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card-body px-3 py-3">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="btn-group w-400px">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm hồ sơ từ cổng..."
                  onChange={handleKeywordChange}
                />
              </div>
            </div>
            <div className="card-dashboard-body table-responsive">
              <TDTable<IHoSoSangKien>
                dataSource={portalDossiers}
                columns={portalColumns}
                isPagination={true}
                pageSize={portalPagination.pageSize}
                count={portalPagination.total}
                offset={portalPagination.current}
                setOffset={page => fetchPortalDossiers(page, portalKeyword)}
                setPageSize={size => setPortalPagination(prev => ({ ...prev, pageSize: size }))}
                loading={isFetchingPortal}
                rowSelection={{
                  type: 'radio',
                  onChange: (keys, rows) => setSelectedPortalRecord(rows[0]),
                  selectedRowKeys: selectedPortalRecord ? [selectedPortalRecord.id] : []
                }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <Spin spinning={isLoading}>
            {!isLoading && (
              <Form<IHoSoSangKien>
                initialValues={{
                  tacGias: [{}],
                  trangThai: TrangThaiHoSoSangKien.ChoTiepNhan
                }}
                form={form} layout="vertical" autoComplete="off"
                disabled={dataModal?.readOnly ?? false}>
                <div className="row">
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Đơn vị được yêu cầu công nhận" name="donViDuocYeuCauId" rules={[{ required: true, message: 'Không được để trống!' }]}>
                      <OrganizationUnitTreeSelect useCurrentUserDefault={false} />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Đợt xét sáng kiến (Cấp Thành phố)" name="dotXetSangKien" rules={[{ required: true, message: 'Không được để trống!' }]}>
                      <TDSelect
                        notFoundContent="Không tìm thấy dữ liệu"
                        reload
                        showSearch
                        placeholder="Chọn đợt xét cấp Thành phố"
                        fetchOptions={async keyword => {
                          const res = await requestPOST<IPaginationResponse<any[]>>(`dotxetsangkiens/search`, {
                            pageNumber: 1,
                            pageSize: 1000,
                            keyword: keyword,
                            capQuanLyCode: 'CAP_THANH_PHO',
                            dangDienRa: true
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
                            form.setFieldValue('dotXetSangKienId', current?.id);
                          } else {
                            form.setFieldValue('dotXetSangKienId', null);
                          }
                        }}
                      />
                    </Form.Item>
                  </div>
                  <div className="col-xl-12 col-lg-12">
                    <Form.Item label="Tên sáng kiến" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                      <Input placeholder="" />
                    </Form.Item>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item label="Chủ đầu tư" name="chuDauTu" rules={[{ required: true, message: 'Không được để trống!' }]}>
                      <Input placeholder="" />
                    </Form.Item>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item label="Lĩnh vực" name="linhVuc" rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item label="Ngày áp dụng thử" name='ngayDuocApDungLanDau' initialValue={dayjs()}>
                      <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Mô tả" name="moTa">
                      <Input.TextArea rows={2} placeholder="" />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Thông tin cần bảo mật" name="thongTinCanBaoMat">
                      <Input.TextArea rows={2} placeholder="" />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Điều kiện cần thiết" name="dieuKienCanThiet">
                      <Input.TextArea rows={2} placeholder="" />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Đánh giá lợi ích" name="danhGiaLoiIch">
                      <Input.TextArea rows={2} placeholder="" />
                    </Form.Item>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item label="Ngày nộp hồ sơ" name='ngayNopHoSo' initialValue={dayjs()}
                      rules={[{ required: true, message: 'Không được để trống!' }]}>
                      <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item label="Người nộp hồ sơ" name='nguoiNopHoSo'
                      rules={[{ required: true, message: 'Không được để trống!' }]}>
                      <UserSelect
                        useCurrentUserDefault={!id}
                        initialUserId={id ? dataModal?.nguoiNopHoSoId : undefined}
                        onDefaultValueSet={(value, userId) => {
                          form.setFieldsValue({
                            nguoiNopHoSo: value,
                            nguoiNopHoSoId: userId,
                          });
                        }}
                        onUserIdChange={(userId) => form.setFieldValue('nguoiNopHoSoId', userId)} />
                    </Form.Item>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item label="Đính kèm" name='dinhKem'>
                      <FileUpload
                        accept={['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc']}
                        multiple={false}
                        URL={`${API_URL}/api/v1/attachments/public`}
                        maxCount={2}
                        fileList={dinhKem}
                        onChange={e => {
                          setDinhKem(e.fileList);
                        }}
                        isUseAliyunOSS
                      />
                    </Form.Item>
                  </div>

                  <SubTitle title={"Thông tin tác giả (nhóm tác giả)"} />
                  <Form.List name="tacGias">
                    {(fields, { add, remove }) => (
                      <>
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th className="text-center" style={{ width: '50px' }}>TT</th>
                                <th className="text-center" style={{ width: '20%' }} >Họ tên</th>
                                <th className="text-center" style={{ width: '10%' }} >Ngày sinh</th>
                                <th className="text-center">Đơn vị công tác</th>
                                <th className="text-center" style={{ width: '15%' }}>Chức danh</th>
                                <th className="text-center" style={{ width: '15%' }}>Trình độ chuyên môn</th>
                                <th className="text-center" style={{ width: '10%' }}>Tỷ lệ đóng góp</th>
                                <th className="text-center" style={{ width: '8%' }}>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fields.map(({ key, name, ...restField }, index) => (
                                <tr key={key}>
                                  <td className="text-center">{index + 1}</td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'hoTen']}
                                      className="mb-0"
                                      rules={[{ required: true, message: "Không được để trống!" }]}
                                    >
                                      <Input placeholder=' ' />
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'ngaySinh']}
                                      className="mb-0"
                                    >
                                      <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'donViCongTac']}
                                      className="mb-0"
                                    >
                                      <Input placeholder="" />
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'chucDanh']}
                                      className="mb-0"
                                    >
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
                                            form.setFieldValue(['tacGias', name, 'chucDanhId'], current?.id);
                                          } else {
                                            form.setFieldValue(['tacGias', name, 'chucDanhId'], null);
                                          }
                                        }}
                                      />
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'trinhDoChuyenMon']}
                                      className="mb-0"
                                    >
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
                                            form.setFieldValue(['tacGias', name, 'trinhDoChuyenMonId'], current?.id);
                                          } else {
                                            form.setFieldValue(['tacGias', name, 'trinhDoChuyenMonId'], null);
                                          }
                                        }}
                                      />
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'tyLeDongGop']}
                                      className="mb-0"
                                      rules={[{ required: true, message: "Không được để trống!" }]}
                                    >
                                      <InputNumber<number>
                                        min={0}
                                        max={100}
                                        precision={1}
                                        step={0.1}
                                        placeholder=""
                                        className="input-with-addon"
                                        style={{ width: '100%' }}
                                        formatter={(value) =>
                                          value !== undefined && value !== null
                                            ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                            : ''
                                        }
                                        parser={(value) =>
                                          value
                                            ? Number(value.replace(/,/g, ''))
                                            : 0
                                        }
                                        addonAfter="%"
                                      />
                                    </Form.Item>
                                  </td>
                                  <td className='text-center align-middle'>
                                    <Button
                                      type="button"
                                      className="btn btn-sm btn-light-danger d-inline-flex align-items-center justify-content-center"
                                      onClick={() => remove(name)}
                                      disabled={fields.length === 1 || (dataModal?.readOnly ?? false)}
                                    >
                                      <i className="fa-regular fa-trash"></i>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="table-secondary">
                              <tr>
                                <td colSpan={16} className="text-left py-3">
                                  <Button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => add()}
                                    disabled={dataModal?.readOnly ?? false}
                                  >
                                    <i className="fa-regular fa-plus me-2"></i>
                                    Thêm thành viên
                                  </Button>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </>
                    )}
                  </Form.List>

                  <SubTitle title={"Thông tin người đã tham gia áp dụng thử"} />
                  <Form.List name="thanhVienThamGiaApDungThus">
                    {(fields, { add, remove }) => (
                      <>
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th className="text-center" style={{ width: '50px' }}>TT</th>
                                <th className="text-center" style={{ width: '20%' }} >Họ tên</th>
                                <th className="text-center" style={{ width: '10%' }} >Ngày sinh</th>
                                <th className="text-center">Đơn vị công tác</th>
                                <th className="text-center" style={{ width: '15%' }}>Chức danh</th>
                                <th className="text-center" style={{ width: '10%' }}>Trình độ chuyên môn</th>
                                <th className="text-center" style={{ width: '15%' }}>Nội dung công việc</th>
                                <th className="text-center" style={{ width: '8%' }}>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fields.map(({ key, name, ...restField }, index) => (
                                <tr key={key}>
                                  <td className="text-center">{index + 1}</td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'hoTen']}
                                      className="mb-0"
                                      rules={[{ required: true, message: "Không được để trống!" }]}
                                    >
                                      <Input placeholder=' ' />
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'ngaySinh']}
                                      className="mb-0"
                                    >
                                      <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'donViCongTac']}
                                      className="mb-0"
                                    >
                                      <Input placeholder="" />
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'chucDanh']}
                                      className="mb-0"
                                    >
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
                                            form.setFieldValue(['thanhVienThamGiaApDungThus', name, 'chucDanhId'], current?.id);
                                          } else {
                                            form.setFieldValue(['thanhVienThamGiaApDungThus', name, 'chucDanhId'], null);
                                          }
                                        }}
                                      />
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'trinhDoChuyenMon']}
                                      className="mb-0"
                                      rules={[{ required: true, message: "Không được để trống!" }]}
                                    >
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
                                            form.setFieldValue(['thanhVienThamGiaApDungThus', name, 'trinhDoChuyenMonId'], current?.id);
                                          } else {
                                            form.setFieldValue(['thanhVienThamGiaApDungThus', name, 'trinhDoChuyenMonId'], null);
                                          }
                                        }}
                                      />
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'noiDungCongViec']}
                                      className="mb-0"
                                      rules={[{ required: true, message: "Không được để trống!" }]}
                                    >
                                      <Input placeholder="" />
                                    </Form.Item>
                                  </td>
                                  <td className='text-center align-middle'>
                                    <Button
                                      type="button"
                                      className="btn btn-sm btn-light-danger d-inline-flex align-items-center justify-content-center"
                                      onClick={() => remove(name)}
                                      disabled={fields.length === 1 || (dataModal?.readOnly ?? false)}
                                    >
                                      <i className="fa-regular fa-trash"></i>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="table-secondary">
                              <tr>
                                <td colSpan={16} className="text-left py-3">
                                  <Button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => add()}
                                    disabled={dataModal?.readOnly ?? false}
                                  >
                                    <i className="fa-regular fa-plus me-2"></i>
                                    Thêm thành viên
                                  </Button>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </>
                    )}
                  </Form.List>
                  <YKienFormList form={form} name="yKienCapCoSo" title="Ý kiến cấp cơ sở" disabled={dataModal?.readOnly ?? false} />
                  <YKienFormList form={form} name="yKienCapThanhPho" title="Ý kiến cấp Thành phố" disabled={dataModal?.readOnly ?? false} />
                </div>
              </Form>
            )}
          </Spin>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {step === 1 && (
          <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={handleNextStep1} disabled={isLoading}>
            Tiếp theo <i className="fa-regular fa-arrow-right ms-1"></i>
          </Button>
        )}

        {step === 2 && (
          <>
            <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={handleNextStep2} disabled={isLoading}>
              Tiếp theo <i className="fa-regular fa-arrow-right ms-1"></i>
            </Button>
            <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={() => setStep(1)} disabled={isLoading}>
              <i className="fa-regular fa-arrow-left me-1"></i> Quay lại
            </Button>
          </>
        )}

        {step === 3 && !dataModal?.readOnly && (
          <>
            <div className="d-flex justify-content-center align-items-center">
              <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={() => onFinish(TrangThaiHoSoSangKien.ChoTiepNhan)} disabled={buttonLoading}>
                <i className="fa-regular fa-floppy-disk"></i>
                {id ? 'Lưu & nộp' : 'Tạo mới & nộp'}
              </Button>
            </div>
            {
              (dataModal?.trangThai == null || dataModal?.trangThai === TrangThaiHoSoSangKien.DangSoanThao) &&
              <div className="d-flex justify-content-center align-items-center">
                <Button className="btn-sm btn-success rounded-1 p-2 ms-2" onClick={() => onFinish(TrangThaiHoSoSangKien.DangSoanThao)} disabled={buttonLoading}>
                  <i className="fa-regular fa-floppy-disk"></i>
                  {'Lưu nháp'}
                </Button>
              </div>
            }
            <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={() => !id && setStep(sourceType === 'portal' ? 2 : 1)} disabled={buttonLoading}>
              <i className="fa-regular fa-arrow-left me-1"></i> Quay lại
            </Button>
          </>
        )}
        <div className="d-flex justify-content-center align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal >
  );
};
