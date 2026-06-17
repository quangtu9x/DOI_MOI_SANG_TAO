import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { Form } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { Collapse } from 'react-bootstrap';

import { AppDispatch, RootState } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { KetQuaSangKienTable } from './components/KetQuaSangKienTable';
import { KetQuaSangKienResultTable } from './components/KetQuaSangKienResultTable';
import { KetQuaSangKienDetailModal } from './components/KetQuaSangKienDetailModal';
import { HoSoSangKienDetailModal } from '@/app/pages/sang-kien/dang-ky-sang-kien/ho-so-sang-kien/components/HoSoSangKienDetailModal';
import { NhanXetHoSoModal } from '@/app/pages/sang-kien/tiep-nhan-xu-ly/tiep-nhan-ho-so/components/NhanXetHoSoModal';
import { requestDownloadFile, requestPOST } from '@/utils/baseAPI';
import { saveBlobAsFile } from '@/utils/utils';
import { IHoSoSangKien, IKetQuaSangKien, IPaginationResponse } from '@/models';
import { TDSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';

type ActiveTab = 'thong-tin' | 'ket-qua';

const resultTabs: { label: string; value: ActiveTab }[] = [
  { label: 'Thông tin sáng kiến', value: 'thong-tin' },
  { label: 'Kết quả sáng kiến', value: 'ket-qua' },
];

export const KetQuaSangKienPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const [activeTab, setActiveTab] = useState<ActiveTab>('thong-tin');
  const [hoSoSearchData, setHoSoSearchData] = useState<SearchData | undefined>(undefined);
  const [ketQuaSearchData, setKetQuaSearchData] = useState<SearchData | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<IHoSoSangKien[]>([]);
  const [selectedResultRowKeys, setSelectedResultRowKeys] = useState<React.Key[]>([]);
  const [selectedResultRows, setSelectedResultRows] = useState<IKetQuaSangKien[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultRecord, setResultRecord] = useState<IKetQuaSangKien | null>(null);
  const [initialResultHoSoIds, setInitialResultHoSoIds] = useState<string[]>([]);
  const [showHoSoModal, setShowHoSoModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [nhanXetRecord, setNhanXetRecord] = useState<IHoSoSangKien | null>(null);
  const [nhanXetVisible, setNhanXetVisible] = useState(false);
  const [form] = Form.useForm();

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const keyword = e.target.value;
    if (activeTab === 'ket-qua') {
      setKetQuaSearchData(prev => ({ ...prev, keyword }));
    } else {
      setHoSoSearchData(prev => ({ ...prev, keyword }));
    }
  };

  const openResultModal = (record?: IKetQuaSangKien | null, hoSoIds: string[] = []) => {
    setResultRecord(record ?? null);
    setInitialResultHoSoIds(hoSoIds);
    setResultModalVisible(true);
  };

  const handleAddResultFromHoSo = (): void => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một hồ sơ sáng kiến để thêm kết quả!');
      return;
    }

    openResultModal(null, selectedRowKeys.map(String));
  };

  const handleEditHoSo = (record: IHoSoSangKien): void => {
    setShowHoSoModal(true);
    dispatch(actionsModal.setDataModal({ ...record, preserveTrangThaiOnSave: true }));
    dispatch(actionsModal.setModalVisible(true));
  };

  const handleNhanXetHoSo = (record: IHoSoSangKien): void => {
    setNhanXetRecord(record);
    setNhanXetVisible(true);
  };

  const closeNhanXetModal = (): void => {
    setNhanXetVisible(false);
    setNhanXetRecord(null);
  };

  const handleExportResult = async (): Promise<void> => {
    if (selectedResultRows.length === 0) {
      toast.warning('Vui lòng chọn một kết quả sáng kiến để xuất file!');
      return;
    }
    if (selectedResultRows.length > 1) {
      toast.warning('Vui lòng chỉ chọn một kết quả sáng kiến!');
      return;
    }

    try {
      setIsExporting(true);
      const selectedResult = selectedResultRows[0];
      const hoSoId = selectedResult.hoSoSangKienIds?.[0] ?? selectedResult.hoSoSangKiens?.[0]?.id ?? selectedResult.hoSoSangKienId;
      if (!hoSoId) {
        toast.warning('Kết quả sáng kiến chưa có hồ sơ để xuất file!');
        return;
      }

      const response = await requestDownloadFile('HoSoSangKiens/export-ket-qua', {
        hoSoId,
      });
      if (response?.status === 200) {
        saveBlobAsFile(response);
      } else {
        toast.error('Xuất dữ liệu thất bại!');
      }
    } catch (error) {
      console.log('Failed:', error);
      toast.error('Có lỗi xảy ra!');
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters = (): boolean => {
    return !!(hoSoSearchData?.dotXetSangKienId || hoSoSearchData?.linhVucId || hoSoSearchData?.donViDuocYeuCauId || hoSoSearchData?.diemTrungBinhTu);
  };

  const handleClearFilters = (): void => {
    form.resetFields();
    setHoSoSearchData(prev => ({
      ...prev,
      dotXetSangKienId: null,
      linhVucId: null,
      donViDuocYeuCauId: null,
      diemTrungBinhTu: null,
    }));
  };

  const renderHoSoFilters = () => (
    <Collapse in={showFilter}>
      <div className="row">
        <div className="col-xl-12 col-lg-12">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid">
            <Form form={form} autoComplete="off">
              <div className="row">
                <div className="col-xl-3 col-lg-3">
                  <Form.Item label="Theo đợt" name="dotXetSangKien">
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>('DotXetSangKiens/search', {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword,
                        });
                        return (
                          res.data?.data?.map(item => ({
                            ...item,
                            label: item?.ten,
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                      onChange={(value, current: any) => setHoSoSearchData(prev => ({ ...prev, dotXetSangKienId: value ? current?.id : null }))}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item label="Lĩnh vực" name="linhVuc">
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>('Categories/search', {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword,
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
                      onChange={(value, current: any) => setHoSoSearchData(prev => ({ ...prev, linhVucId: value ? current?.id : null }))}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item label="Đơn vị" name="donViDuocYeuCau">
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>('OrganizationUnits/search', {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword,
                        });
                        return (
                          res.data?.data?.map(item => ({
                            ...item,
                            label: item?.name,
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                      onChange={(value, current: any) => setHoSoSearchData(prev => ({ ...prev, donViDuocYeuCauId: value ? current?.id : null }))}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Item label="Điểm trung bình" name="diemTrungBinhTu">
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      placeholder="Chọn"
                      fetchOptions={async () => [
                        { value: 80, label: '>= 80' },
                        { value: 85, label: '>= 85' },
                        { value: 90, label: '>= 90' },
                        { value: 95, label: '>= 95' },
                      ]}
                      onChange={(value, current: any) => setHoSoSearchData(prev => ({ ...prev, diemTrungBinhTu: value ? current?.value : null }))}
                    />
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </Collapse>
  );

  return (
    <Content>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">Kết quả sáng kiến</h3>
          <div className="card-toolbar">
            <div className="d-flex align-items-center">
              <div className="btn-group w-250px me-2">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
              </div>
              {activeTab === 'thong-tin' ? (
                <>
                  <button className="btn btn-secondary btn-sm py-2 text-hover-primary me-2" onClick={() => setShowFilter(!showFilter)}>
                    <i className="fa-regular fa-filter me-2 text-dark"></i>
                    Bộ lọc
                  </button>
                  <AnimatePresence>
                    {hasActiveFilters() && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20, duration: 0.15 } }}
                        exit={{ opacity: 0, scale: 0.5, transition: { type: 'tween', ease: 'easeIn', duration: 0.25 } }}
                        className="btn btn-secondary btn-sm py-2 text-hover-danger me-2"
                        onClick={handleClearFilters}
                        title="Xóa tất cả bộ lọc"
                      >
                        <i className="fas fa-times me-2"></i>
                        Xóa bộ lọc
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <button className="btn btn-primary btn-sm py-2" onClick={handleAddResultFromHoSo}>
                    <i className="fa-regular fa-plus me-2"></i>
                    Thêm vào kết quả
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-success btn-sm py-2 me-2" onClick={handleExportResult} disabled={isExporting}>
                    <i className={`fa-regular ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                    Xuất kết quả
                  </button>
                  <button className="btn btn-primary btn-sm py-2" onClick={() => openResultModal()}>
                    <i className="fa-regular fa-plus me-2"></i>
                    Thêm kết quả
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="card-header border-bottom p-3 pb-0">
          <div className="card-toolbar">
            <ul className="nav flex-wrap">
              {resultTabs.map(tab => (
                <li className="nav-item" key={tab.value}>
                  <a
                    className={clsx(
                      'nav-link btn btn-color-muted btn-active btn-active-light-primary fw-bold px-4 me-1 fs-6',
                      activeTab === tab.value && 'active'
                    )}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setSelectedRowKeys([]);
                      setSelectedRows([]);
                      setSelectedResultRowKeys([]);
                      setSelectedResultRows([]);
                    }}
                  >
                    {tab.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {activeTab === 'thong-tin' && renderHoSoFilters()}
        {activeTab === 'thong-tin' ? (
          <KetQuaSangKienTable
            searchData={hoSoSearchData}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            setSelectedRows={setSelectedRows}
            onEditHoSo={handleEditHoSo}
            onNhanXetHoSo={handleNhanXetHoSo}
          />
        ) : (
          <KetQuaSangKienResultTable
            searchData={ketQuaSearchData}
            selectedRowKeys={selectedResultRowKeys}
            setSelectedRowKeys={setSelectedResultRowKeys}
            setSelectedRows={setSelectedResultRows}
            onEdit={record => openResultModal(record)}
          />
        )}
      </div>
      <KetQuaSangKienDetailModal
        visible={resultModalVisible}
        record={resultRecord}
        initialHoSoIds={initialResultHoSoIds}
        initialHoSos={selectedRows}
        onClose={() => {
          setResultModalVisible(false);
          setResultRecord(null);
          setInitialResultHoSoIds([]);
          setSelectedRowKeys([]);
          setSelectedRows([]);
        }}
      />
      <NhanXetHoSoModal
        record={nhanXetRecord}
        visible={nhanXetVisible}
        onClose={closeNhanXetModal}
        onSuccess={() => {
          closeNhanXetModal();
          dispatch(actionsGlobal.setRandom());
        }}
      />
      {showHoSoModal && modalVisible ? <HoSoSangKienDetailModal /> : null}
    </Content>
  );
};
