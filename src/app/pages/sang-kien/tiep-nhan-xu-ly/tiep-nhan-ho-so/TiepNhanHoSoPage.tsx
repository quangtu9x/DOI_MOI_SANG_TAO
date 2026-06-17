import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { TiepNhanHoSoTable } from './components/TiepNhanHoSoTable';
import { TrangThaiHoSoSangKien, UserType } from '@/models';
import { useAuth } from '@/app/modules/auth';
import clsx from 'clsx';

type TiepNhanHoSoTableHandle = {
  handleBulkAction: (type: 'approve' | 'reject' | 'requestInfo') => void;
};

const statusTabs = [
  { label: 'Chờ tiếp nhận', value: TrangThaiHoSoSangKien.ChoTiepNhan },
  { label: 'Đã tiếp nhận', value: TrangThaiHoSoSangKien.DaTiepNhan },
];

export const TiepNhanHoSoPage = () => {
  const { currentUser } = useAuth();
  const userType = currentUser?.type;
  const [searchData, setSearchData] = useState<SearchData | undefined>({
    trangThai: TrangThaiHoSoSangKien.ChoTiepNhan,
    capQuanLyCode: userType === UserType.Admin ? 'CAP_THANH_PHO' : 'CAP_CO_SO',
    layTheoDonViDuocYeuCau: true
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const tableRef = useRef<TiepNhanHoSoTableHandle>(null);

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

