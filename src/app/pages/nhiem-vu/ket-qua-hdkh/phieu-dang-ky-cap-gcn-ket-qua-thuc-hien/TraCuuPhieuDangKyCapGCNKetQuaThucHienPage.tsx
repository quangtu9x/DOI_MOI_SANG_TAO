import React, { useState } from 'react';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { PhieuDangKyCapGCNKetQuaThucHienTable } from './components/PhieuDangKyCapGCNKetQuaThucHienTable';
import { buildExportPayload, exportList, printList } from '../exportPrintListHelpers';

const EXPORT_ENDPOINT = 'PhieuDangKyCapGCNKetQuaThucHiens/export';
const PRINT_TITLE = 'Danh sách phiếu đăng ký cấp GCN kết quả thực hiện đề tài, nhiệm vụ KH cơ sở';

export const TraCuuPhieuDangKyCapGCNKetQuaThucHienPage = () => {
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    try {
      await exportList(EXPORT_ENDPOINT, buildExportPayload(searchData));
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      await printList(EXPORT_ENDPOINT, buildExportPayload(searchData), PRINT_TITLE);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Tra cứu phiếu đăng ký cấp GCN kết quả thực hiện đề tài, nhiệm vụ KH cơ sở'}</h3>
            <div className="card-toolbar">
              <div className="d-flex align-items-center">
                <div className="btn-group me-2 w-250px">
                  <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
                </div>
                <button className="btn btn-success btn-sm py-2 me-2" onClick={handleExport} disabled={isExporting}>
                  <span>
                    <i className={`fa-regular ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                    <span>Xuất danh sách</span>
                  </span>
                </button>
                <button className="btn btn-primary btn-sm py-2" onClick={handlePrint} disabled={isPrinting}>
                  <span>
                    <i className={`fa-regular ${isPrinting ? 'fa-spinner fa-spin' : 'fa-print'} me-2`}></i>
                    <span>In danh sách</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <PhieuDangKyCapGCNKetQuaThucHienTable searchData={searchData} readOnly={true} />
        </div>
      </Content>
    </>
  );
};
