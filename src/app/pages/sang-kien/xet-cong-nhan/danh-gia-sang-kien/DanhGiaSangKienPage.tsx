import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Dropdown, MenuProps } from 'antd';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { DanhGiaSangKienTable, DanhGiaSangKienTableRef } from './components/DanhGiaSangKienTable';

export const DanhGiaSangKienPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const tableRef = useRef<DanhGiaSangKienTableRef>(null);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleEvaluation = (): void => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Vui lòng chọn một hồ sơ sáng kiến để đánh giá!');
      return;
    }
    if (selectedRowKeys.length > 1) {
      toast.warning('Vui lòng chỉ chọn một hồ sơ sáng kiến để thực hiện đánh giá!');
      return;
    }
    
    // Find the record in table (assuming we can get it from tableRef or just use the ID)
    if (tableRef.current) {
        tableRef.current.handleAction('evaluate', selectedRowKeys[0]);
    }
  };

  const handleExport = (fileType: 'word' | 'excel' | 'pdf'): void => {
    if (tableRef.current) {
      tableRef.current.handleExport(fileType);
    }
  };

  const exportItems: MenuProps['items'] = [
    {
      key: 'word',
      label: 'Xuất Word',
      icon: <i className="fa-regular fa-file-word"></i>,
      onClick: () => handleExport('word'),
    },
    {
      key: 'excel',
      label: 'Xuất Excel',
      icon: <i className="fa-regular fa-file-excel"></i>,
      onClick: () => handleExport('excel'),
    },
    {
      key: 'pdf',
      label: 'Xuất PDF',
      icon: <i className="fa-regular fa-file-pdf"></i>,
      onClick: () => handleExport('pdf'),
    },
  ];

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Đánh giá sáng kiến'}</h3>
            <div className="card-toolbar">
              <div className="d-flex align-items-center">
                <div className="btn-group w-250px me-2">
                    <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
                </div>
                <button className="btn btn-primary btn-sm py-2" onClick={handleEvaluation}>
                    <span>
                    <i className="fa-regular fa-star me-2"></i>
                    <span className="">Đánh giá</span>
                    </span>
                </button>
                <Dropdown menu={{ items: exportItems }} trigger={['click']}>
                  <button className="btn btn-success btn-sm py-2 ms-2" onClick={e => e.preventDefault()}>
                    <span>
                      <i className="fa-regular fa-download me-2"></i>
                      <span className="">Xuất phiếu đánh giá</span>
                      <i className="fa-regular fa-chevron-down ms-2"></i>
                    </span>
                  </button>
                </Dropdown>
              </div>
            </div>
          </div>
          <DanhGiaSangKienTable 
            ref={tableRef}
            searchData={searchData} 
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
          />
        </div>
      </Content>
    </>
  );
};

