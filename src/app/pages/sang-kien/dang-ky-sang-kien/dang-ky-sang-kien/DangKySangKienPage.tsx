import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { DangKySangKienTable } from './components/DangKySangKienTable';
import { useAuth } from '@/app/modules/auth';

export const DangKySangKienPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useAuth();
  const userType = currentUser?.type;
  const [searchData, setSearchData] = useState<SearchData | undefined>({
    capQuanLyCode: 'CAP_THANH_PHO',
  }
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const tableRef = useRef<any>(null);

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

  const handleBulkAction = (type: 'withdraw' | 'submit') => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bản ghi để thực hiện thao tác!');
      return;
    }
    if (tableRef.current) {
      tableRef.current.handleBulkAction(type);
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Đăng ký xét sáng kiến cấp tỉnh'}</h3>
            <div className="card-toolbar">
              <div className="d-flex align-items-center">
                <div className="btn-group w-250px me-2">
                  <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
                </div>
                <button className="btn btn-success btn-sm py-2 me-2" onClick={() => handleBulkAction('submit')}>
                  <span>
                    <i className="fa-regular fa-paper-plane me-2"></i>
                    <span className="">Nộp sáng kiến</span>
                  </span>
                </button>
                <button className="btn btn-warning btn-sm py-2 me-2" onClick={() => handleBulkAction('withdraw')}>
                  <span>
                    <i className="fa-regular fa-rotate-left me-2"></i>
                    <span className="">Thu hồi</span>
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
          </div>
          <DangKySangKienTable
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

