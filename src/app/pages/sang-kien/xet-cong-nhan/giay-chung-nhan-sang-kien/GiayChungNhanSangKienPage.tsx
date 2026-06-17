import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { GiayChungNhanSangKienTable } from './components/GiayChungNhanSangKienTable';
import { requestDownloadFile } from '@/utils/baseAPI';
import { saveBlobAsFile } from '@/utils/utils';
import { IGiayChungNhanSangKien } from '@/models';

export const GiayChungNhanSangKienPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<IGiayChungNhanSangKien[]>([]);
  const [isExportingGiayChungNhan, setIsExportingGiayChungNhan] = useState(false);
  const [isExportingChiTiet, setIsExportingChiTiet] = useState(false);
  const isExporting = isExportingGiayChungNhan || isExportingChiTiet;

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleAddNew = (): void => {
    dispatch(actionsModal.setDataModal({ readOnly: false }));
    dispatch(actionsModal.setModalVisible(true));
  };

  const handleExport = async (type: 'giay-chung-nhan' | 'chi-tiet'): Promise<void> => {
    if (selectedRows.length === 0) {
      toast.warning('Vui lòng chọn một giấy chứng nhận để xuất file!');
      return;
    }

    if (selectedRows.length > 1) {
      toast.warning('Vui lòng chỉ chọn một giấy chứng nhận!');
      return;
    }

    try {
      if (type === 'chi-tiet') {
        setIsExportingChiTiet(true);
      } else {
        setIsExportingGiayChungNhan(true);
      }

      const endpoint = type === 'chi-tiet' ? 'GiayChungNhanSangKiens/export-chi-tiet' : 'GiayChungNhanSangKiens/export-giay-chung-nhan';
      const response = await requestDownloadFile(endpoint, {
        giayChungNhanSangKienId: selectedRows[0].id,
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
      if (type === 'chi-tiet') {
        setIsExportingChiTiet(false);
      } else {
        setIsExportingGiayChungNhan(false);
      }
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Giấy chứng nhận sáng kiến'}</h3>
            <div className="card-toolbar">
              <div className="btn-group me-2 w-250px">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
              </div>
              <button className="btn btn-success btn-sm py-2 me-2" onClick={() => handleExport('giay-chung-nhan')} disabled={isExporting}>
                <span>
                  <i className={`fa-regular ${isExportingGiayChungNhan ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                  <span>Xuất giấy chứng nhận</span>
                </span>
              </button>
              <button className="btn btn-success btn-sm py-2 me-2" onClick={() => handleExport('chi-tiet')} disabled={isExporting}>
                <span>
                  <i className={`fa-regular ${isExportingChiTiet ? 'fa-spinner fa-spin' : 'fa-file-lines'} me-2`}></i>
                  <span>Xuất chi tiết</span>
                </span>
              </button>
              <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNew}>
                <span>
                  <i className="fa-regular fa-plus me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            </div>
          </div>
          <GiayChungNhanSangKienTable
            searchData={searchData}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            setSelectedRows={setSelectedRows}
          />
        </div>
      </Content>
    </>
  );
};

