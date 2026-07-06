import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/redux/Store';
import * as actionsGlobal from '@/redux/global/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { TongHopHoSoTable } from './components/TongHopHoSoTable';
import { IPaginationResponse, TrangThaiHoSoSangKien } from '@/models';
import { Form } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { Collapse } from 'react-bootstrap';
import { TDSelect } from '@/app/components';
import { requestDownloadFile, requestPOST } from '@/utils/baseAPI';
import { saveBlobAsFile } from '@/utils/utils';
import { CATEGORY_GROUP_CODE } from '@/data';
import { TransferHoiDongModal } from './components/TransferHoiDongModal';
import { CapNhatDiemTrungBinhModal } from './components/CapNhatDiemTrungBinhModal';
import { IHoSoSangKien } from '@/models';
import clsx from 'clsx';
import { CauHinhXuLyHoSoModal } from './components/CauHinhXuLyHoSoModal';

type TongHopHoSoTab = 'chuaChuyenHoiDong' | 'daChuyenHoiDong';

const statusTabs: { label: string; value: TongHopHoSoTab }[] = [
  { label: 'Chưa chuyển hội đồng', value: 'chuaChuyenHoiDong' },
  { label: 'Đã chuyển hội đồng', value: 'daChuyenHoiDong' },
];

const overdueOptions = [
  { label: 'Tất cả hồ sơ', value: 'all' },
  { label: 'Quá hạn kiểm duyệt', value: 'review' },
  { label: 'Có quá hạn bất kỳ', value: 'any' },
] as const;

type OverdueFilterValue = (typeof overdueOptions)[number]['value'];

const getTabSearchStatus = (tab: TongHopHoSoTab) =>
  tab === 'chuaChuyenHoiDong'
    ? {
        trangThai: TrangThaiHoSoSangKien.DaTiepNhan,
        trangThais: undefined,
      }
    : {
        trangThai: undefined,
        trangThais: [TrangThaiHoSoSangKien.DangThamDinh, TrangThaiHoSoSangKien.DuocCongNhan],
      };

export const TongHopHoSoPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<TongHopHoSoTab>('chuaChuyenHoiDong');
  const [overdueFilter, setOverdueFilter] = useState<OverdueFilterValue>('all');
  const [searchData, setSearchData] = useState<SearchData | undefined>({
    capQuanLyCode: 'CAP_THANH_PHO',
    ...getTabSearchStatus('chuaChuyenHoiDong'),
  });
  const [showFilter, setShowFilter] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<IHoSoSangKien[]>([]);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [diemModalVisible, setDiemModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const hasActiveFilters = (): boolean => {
    return !!(searchData?.linhVucId);
  };

  const handleClearFilters = (): void => {
    form.resetFields();
    setSearchData(prev => ({
      ...prev,
      linhVucId: null,
    }));
  };

  const handleTransferToHoiDong = () => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một hồ sơ!');
      return;
    }
    setTransferModalVisible(true);
  };

  const handleStatusTabChange = (tab: TongHopHoSoTab): void => {
    setActiveTab(tab);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    setOverdueFilter('all');
    setSearchData(prev => ({
      ...prev,
      ...getTabSearchStatus(tab),
      quaHanKiemDuyetCongNhan: undefined,
      quaHanTong: undefined,
    }));
  };

  const handleOverdueFilterChange = (value: OverdueFilterValue): void => {
    setOverdueFilter(value);
    setSearchData(prev => ({
      ...prev,
      quaHanKiemDuyetCongNhan: value === 'review' ? true : undefined,
      quaHanTong: value === 'any' ? true : undefined,
    }));
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  const handleUpdateDiemTrungBinh = () => {
    if (selectedRows.length === 0) {
      toast.warning('Vui lòng chọn một hồ sơ để cập nhật điểm trung bình!');
      return;
    }

    if (selectedRows.length > 1) {
      toast.warning('Vui lòng chỉ chọn một hồ sơ!');
      return;
    }

    setDiemModalVisible(true);
  };

  const handleExportDaChuyenHoiDong = async (): Promise<void> => {
    try {
      setIsExporting(true);
      const response = await requestDownloadFile('HoSoSangKiens/export-tong-hop-hoi-dong', {
        ...searchData,
        ...getTabSearchStatus('daChuyenHoiDong'),
      });

      if (response?.status === 200) {
        saveBlobAsFile(response);
      } else {
        toast.error('Xuất dữ liệu thất bại!');
      }
    } catch (error) {
      console.error('Export tong hop hoi dong error:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  const isChuaChuyenHoiDongTab = activeTab === 'chuaChuyenHoiDong';

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Tổng hợp hồ sơ'}</h3>
            <div className="card-toolbar">
              <div className="d-flex align-items-center">
                <div className="btn-group w-250px me-2">
                  <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
                </div>
                <div className="btn-group w-250px me-2">
                  <select className="form-select form-select-sm" value={overdueFilter} onChange={e => handleOverdueFilterChange(e.target.value as OverdueFilterValue)}>
                    {overdueOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-secondary btn-sm py-2 text-hover-primary me-2" onClick={() => setShowFilter(!showFilter)}>
                  <span>
                    <i className="fa-regular fa-filter me-2 text-dark"></i>
                    <span className="">Bộ lọc</span>
                  </span>
                </button>
                <button className="btn btn-info btn-sm py-2 me-2" onClick={() => setShowConfigModal(true)}>
                  <span>
                    <i className="fa-regular fa-sliders me-2"></i>
                    <span className="">Cấu hình xử lý</span>
                  </span>
                </button>
                {isChuaChuyenHoiDongTab ? (
                  <button className="btn btn-primary btn-sm py-2" onClick={handleTransferToHoiDong}>
                    <span>
                      <i className="fa-regular fa-share me-2"></i>
                      <span className="">Chuyển hội đồng</span>
                    </span>
                  </button>
                ) : (
                  <>
                    <button className="btn btn-success btn-sm py-2 me-2" onClick={handleExportDaChuyenHoiDong} disabled={isExporting}>
                      <span>
                        <i className={`fa-regular ${isExporting ? 'fa-spinner fa-spin' : 'fa-file-export'} me-2`}></i>
                        <span className="">Xuất danh sách</span>
                      </span>
                    </button>
                    <button className="btn btn-primary btn-sm py-2" onClick={handleUpdateDiemTrungBinh}>
                      <span>
                        <i className="fa-regular fa-pen-to-square me-2"></i>
                        <span className="">Cập nhật điểm TB</span>
                      </span>
                    </button>
                  </>
                )}
                <AnimatePresence>
                  {hasActiveFilters() && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        transition: {
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                          duration: 0.15,
                        }
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.5,
                        transition: {
                          type: 'tween',
                          ease: 'easeIn',
                          duration: 0.25,
                        }
                      }}
                      className="btn btn-secondary btn-sm py-2 text-hover-danger ms-2"
                      onClick={handleClearFilters}
                      title="Xóa tất cả bộ lọc"
                    >
                      <span>
                        <i className="fas fa-times me-2"></i>
                        <span className="">Xóa bộ lọc</span>
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="card-header border-bottom p-3 pb-0">
            <div className="card-toolbar">
              <ul className="nav flex-wrap">
                {statusTabs.map(tab => (
                  <li className="nav-item" key={tab.value}>
                    <a
                      className={clsx(
                        'nav-link btn btn-color-muted btn-active btn-active-light-primary fw-bold px-4 me-1 fs-6',
                        activeTab === tab.value && 'active'
                      )}
                      onClick={() => handleStatusTabChange(tab.value)}
                    >
                      {tab.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Collapse in={showFilter}>
            <div className='row'>
              <div className='col-xl-12 col-lg-12'>
                <div className='px-3 py-3 border-bottom border-secondary border-bottom-solid '>
                  <Form form={form} autoComplete='off'>
                    <div className='row'>
                      <div className="col-xl-3 col-lg-3">
                        <Form.Item label="Lĩnh vực" name="linhVuc">
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
                                setSearchData(prev => ({
                                  ...prev,
                                  linhVucId: current.id,
                                }));
                              } else {
                                setSearchData(prev => ({
                                  ...prev,
                                  linhVucId: null,
                                }));
                              }
                            }}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </Form>
                </div>
              </div>

            </div>
          </Collapse>
          <TongHopHoSoTable
            searchData={searchData}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            setSelectedRows={setSelectedRows}
            selectionType={isChuaChuyenHoiDongTab ? 'checkbox' : 'radio'}
          />
        </div>
      </Content >
      {transferModalVisible && (
        <TransferHoiDongModal
          show={transferModalVisible}
          selectedIds={selectedRowKeys}
          onClose={() => setTransferModalVisible(false)}
          onSuccess={() => {
            setSelectedRowKeys([]);
            setSelectedRows([]);
            dispatch(actionsGlobal.setRandom());
          }}
        />
      )}
      <CapNhatDiemTrungBinhModal
        record={selectedRows[0] ?? null}
        visible={diemModalVisible}
        onClose={() => setDiemModalVisible(false)}
        onSuccess={() => {
          setDiemModalVisible(false);
          setSelectedRowKeys([]);
          setSelectedRows([]);
          dispatch(actionsGlobal.setRandom());
        }}
      />
      <CauHinhXuLyHoSoModal
        visible={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSaved={() => {
          dispatch(actionsGlobal.setRandom());
        }}
      />
    </>
  );
};

