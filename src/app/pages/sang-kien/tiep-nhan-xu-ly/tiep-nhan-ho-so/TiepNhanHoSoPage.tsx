import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { TiepNhanHoSoTable } from './components/TiepNhanHoSoTable';
import { ICauHinhXuLyHoSoSangKien, IResult, TrangThaiHoSoSangKien, UserType } from '@/models';
import { useAuth } from '@/app/modules/auth';
import clsx from 'clsx';
import { requestGET } from '@/utils/baseAPI';

type TiepNhanHoSoTableHandle = {
  handleBulkAction: (type: 'approve' | 'reject' | 'requestInfo') => void;
};

const statusTabs = [
  { label: 'Chờ tiếp nhận', value: TrangThaiHoSoSangKien.ChoTiepNhan },
  { label: 'Đã tiếp nhận', value: TrangThaiHoSoSangKien.DaTiepNhan },
];

const overdueOptions = [
  { label: 'Tất cả hồ sơ', value: 'all' },
  { label: 'Quá hạn tiếp nhận', value: 'receive' },
  { label: 'Có quá hạn bất kỳ', value: 'any' },
] as const;

type OverdueFilterValue = (typeof overdueOptions)[number]['value'];

export const TiepNhanHoSoPage = () => {
  const { currentUser } = useAuth();
  const userType = currentUser?.type;
  const [configLoading, setConfigLoading] = useState(false);
  const [xuLyConfig, setXuLyConfig] = useState<ICauHinhXuLyHoSoSangKien | null>(null);
  const [overdueFilter, setOverdueFilter] = useState<OverdueFilterValue>('all');
  const [searchData, setSearchData] = useState<SearchData | undefined>({
    trangThai: TrangThaiHoSoSangKien.ChoTiepNhan,
    capQuanLyCode: userType === UserType.Admin ? 'CAP_THANH_PHO' : 'CAP_CO_SO',
    layTheoDonViDuocYeuCau: true
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const tableRef = useRef<TiepNhanHoSoTableHandle>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setConfigLoading(true);
        const response = await requestGET<IResult<ICauHinhXuLyHoSoSangKien>>('HoSoSangKiens/cau-hinh-xu-ly');
        if (response?.data?.succeeded && response?.data?.data) {
          setXuLyConfig(response.data.data);
        } else {
          setXuLyConfig(null);
        }
      } catch {
        setXuLyConfig(null);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleBulkAction = (type: 'approve' | 'reject' | 'requestInfo') => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bản ghi để thực hiện thao tác!');
      return;
    }
    if (tableRef.current) {
      tableRef.current.handleBulkAction(type);
    }
  };

  const handleStatusTabChange = (trangThai: TrangThaiHoSoSangKien): void => {
    setSearchData(prev => ({ ...prev, trangThai }));
    setSelectedRowKeys([]);
  };

  const handleOverdueFilterChange = (value: OverdueFilterValue): void => {
    setOverdueFilter(value);
    setSearchData(prev => ({
      ...prev,
      quaHanTiepNhan: value === 'receive' ? true : undefined,
      quaHanTong: value === 'any' ? true : undefined,
    }));
    setSelectedRowKeys([]);
  };

  const isPendingTab = searchData?.trangThai === TrangThaiHoSoSangKien.ChoTiepNhan;

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Tiếp nhận hồ sơ'}</h3>
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
                <div className="d-flex">
                  {isPendingTab && (
                    <>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleBulkAction('approve')}
                      >
                        <i className="fa-regular fa-circle-check me-1"></i>
                        Tiếp nhận
                      </button>
                      <button
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => handleBulkAction('reject')}
                      >
                        <i className="fa-regular fa-ban me-1"></i>
                        Từ chối
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleBulkAction('requestInfo')}
                      >
                        <i className="fa-regular fa-file-circle-exclamation me-1"></i>
                        Yêu cầu bổ sung
                      </button>
                    </>
                  )}
                </div>
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
                        searchData?.trangThai === tab.value && 'active'
                      )}
                      onClick={() => handleStatusTabChange(tab.value)}
                    >
                      {tab.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 mb-2 text-muted fs-7">
              {configLoading
                ? 'Đang tải cấu hình xử lý hồ sơ...'
                : `Cấu hình hiện tại: Thời hạn tiếp nhận ${xuLyConfig?.thoiHanTiepNhanNgay ?? 5} ngày; thời hạn kiểm duyệt công nhận ${xuLyConfig?.thoiHanKiemDuyetCongNhanNgay ?? 30} ngày; số người tiếp nhận được cấu hình ${xuLyConfig?.nguoiTiepNhanUserIds?.length ?? 0}.`}
            </div>
          </div>
          <TiepNhanHoSoTable
            ref={tableRef}
            searchData={searchData}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
          />
        </div>
      </Content >
    </>
  );
};

