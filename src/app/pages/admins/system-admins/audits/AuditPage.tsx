import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { AuditTable } from './components/AuditTable';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';

export const AuditPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };


  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Nhật ký thao tác hệ thống'}</h3>
            <div className="card-toolbar">
              <div className="btn-group me-2 w-250px">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
              </div>
            </div>
          </div>
          <AuditTable searchData={searchData} />
        </div>
      </Content>
    </>
  );
};

