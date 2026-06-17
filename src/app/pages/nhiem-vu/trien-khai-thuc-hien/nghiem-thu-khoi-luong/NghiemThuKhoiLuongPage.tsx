import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { NghiemThuKhoiLuongTable, NghiemThuKhoiLuongTableHandle } from './components/NghiemThuKhoiLuongTable';

export const NghiemThuKhoiLuongPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const tableRef = useRef<NghiemThuKhoiLuongTableHandle>(null);

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

  const handleBulkAction = (type: 'approve' | 'reject'): void => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bản ghi để thực hiện thao tác!');
      return;
    }

    tableRef.current?.handleBulkAction(type);
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Thông tin Phê duyệt khối lượng CV hoàn thành'}</h3>
            <div className="card-toolbar">
              <div className="d-flex align-items-center">
                <div className="btn-group me-2 w-250px">
                  <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
                </div>
                <button className="btn btn-success btn-sm py-2 me-2" onClick={() => handleBulkAction('approve')}>
                  <span>
                    <i className="fa-regular fa-circle-check me-2"></i>
                    <span>Phê duyệt</span>
                  </span>
                </button>
                <button className="btn btn-danger btn-sm py-2 me-2" onClick={() => handleBulkAction('reject')}>
                  <span>
                    <i className="fa-regular fa-ban me-2"></i>
                    <span>Từ chối</span>
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
          <NghiemThuKhoiLuongTable
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

