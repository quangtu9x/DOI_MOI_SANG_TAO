import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Checkbox } from 'antd';

import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { NotificationContentTable } from './components/NotificationContentTable';

export const NotificationContentPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value || undefined,
    }));
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      code: e.target.value || undefined,
    }));
  };

  const handleIsActiveChange = (e: any) => {
    setSearchData(prev => ({
      ...prev,
      isActive: e.target.checked ? true : undefined,
    }));
  };

  const handleAddNew = (): void => {
    dispatch(actionsModal.setDataModal({ readOnly: false }));
    dispatch(actionsModal.setModalVisible(true));
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Quản lý nội dung thông báo'}</h3>
            <div className="card-toolbar d-flex align-items-center gap-3 flex-wrap">
              <div className="btn-group me-2 w-250px">
                <input 
                  type="text" 
                  className="form-control form-control-sm" 
                  placeholder="Nhập từ khoá tìm kiếm" 
                  onChange={handleKeywordChange} 
                />
              </div>
              <div className="btn-group me-2 w-200px">
                <input 
                  type="text" 
                  className="form-control form-control-sm" 
                  placeholder="Nhập mã thông báo" 
                  onChange={handleCodeChange} 
                />
              </div>
              <div className="d-flex align-items-center me-2">
                <Checkbox onChange={handleIsActiveChange}>Chỉ hiển thị hoạt động</Checkbox>
              </div>
              <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNew}>
                <span>
                  <i className="fa-regular fa-plus me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            </div>
          </div>
          <NotificationContentTable searchData={searchData} />
        </div>
      </Content>
    </>
  );
};
