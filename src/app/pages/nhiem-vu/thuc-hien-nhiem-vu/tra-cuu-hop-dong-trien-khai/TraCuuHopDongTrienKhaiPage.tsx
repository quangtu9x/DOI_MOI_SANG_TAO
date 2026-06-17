import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { requestDownloadFile } from '@/utils/baseAPI';
import { saveBlobAsFile } from '@/utils/utils';
import { HopDongTrienKhaiTable } from '../hop-dong-trien-khai/components/HopDongTrienKhaiTable';

export const TraCuuHopDongTrienKhaiPage = () => {
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleExport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      const response = await requestDownloadFile('HopDongTrienKhais/export', {
        pageNumber: 1,
        pageSize: 0,
        ...(searchData ?? {}),
      });
      if (response?.status === 200) {
        saveBlobAsFile(response);
      } else {
        toast.error('Xuất dữ liệu thất bại!');
      }
    } catch (error) {
      console.error('Export hop dong trien khai failed:', error);
      toast.error('Có lỗi xảy ra!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Tra cứu Hợp đồng triển khai nhiệm vụ KHCN'}</h3>
            <div className="card-toolbar">
              <div className="d-flex align-items-center">
                <div className="btn-group me-2 w-250px">
                  <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
                </div>
                <button
                  className="btn btn-success btn-sm py-2"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <span>
                    <i className={`fa-regular ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                    <span>Xuất danh sách</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <HopDongTrienKhaiTable searchData={searchData} readOnly />
        </div>
      </Content>
    </>
  );
};
