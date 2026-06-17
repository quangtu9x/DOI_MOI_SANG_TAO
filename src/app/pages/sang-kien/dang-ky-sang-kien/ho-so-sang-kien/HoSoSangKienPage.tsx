import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { HoSoSangKienTable } from './components/HoSoSangKienTable';
import { TrangThaiHoSoSangKien } from '@/models';
import clsx from 'clsx';

type HoSoSangKienTableHandle = {
  handleBulkAction: (type: 'submit') => void;
};

const statusTabs = [
  { label: 'Đang soạn thảo', value: TrangThaiHoSoSangKien.DangSoanThao },
  { label: 'Chờ tiếp nhận', value: TrangThaiHoSoSangKien.ChoTiepNhan },
  { label: 'Yêu cầu bổ sung', value: TrangThaiHoSoSangKien.YeuCauBoSung },
  { label: 'Đã tiếp nhận', value: TrangThaiHoSoSangKien.DaTiepNhan },
  { label: 'Từ chối tiếp nhận', value: TrangThaiHoSoSangKien.TuChoiTiepNhan },
  { label: 'Đang thẩm định', value: TrangThaiHoSoSangKien.DangThamDinh },
  { label: 'Được công nhận', value: TrangThaiHoSoSangKien.DuocCongNhan },
  { label: 'Không công nhận', value: TrangThaiHoSoSangKien.KhongCongNhan },
];

export const HoSoSangKienPage = () => {
  const [searchData, setSearchData] = useState<SearchData | undefined>({
    trangThai: TrangThaiHoSoSangKien.DangSoanThao,
    capQuanLyCode: 'CAP_THANH_PHO',
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const tableRef = useRef<HoSoSangKienTableHandle>(null);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleBulkAction = (type: 'submit') => {
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

  const showSubmitButton = searchData?.trangThai === TrangThaiHoSoSangKien.DangSoanThao || searchData?.trangThai === TrangThaiHoSoSangKien.YeuCauBoSung;

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Quản lý hồ sơ sáng kiến'}</h3>
            <div className="card-toolbar">
              <div className="d-flex align-items-center">
                <div className="btn-group me-2 w-250px">
                  <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
                </div>
                {showSubmitButton && (
                  <button className="btn btn-success btn-sm py-2 me-2" onClick={() => handleBulkAction('submit')}>
                    <span>
                      <i className="fa-regular fa-paper-plane me-2"></i>
                      <span className="">Nộp sáng kiến</span>
                    </span>
                  </button>
                )}
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
          <HoSoSangKienTable
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

