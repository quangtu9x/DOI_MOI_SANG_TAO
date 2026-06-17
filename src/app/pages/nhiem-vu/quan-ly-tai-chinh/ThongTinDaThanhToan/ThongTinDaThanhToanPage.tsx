import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { ThongTinDaThanhToanTable } from './components/ThongTinDaThanhToanTable';
import { ThongTinDaThanhToanModal } from './ThongTinDaThanhToanModal';

export const ThongTinDaThanhToanPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const modalVisibleCapMot = useSelector((state: RootState) => state.modal.modalVisibleCapMot);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleAddNew = (): void => {
    dispatch(actionsModal.setDataModalCapMot({ readOnly: false }));
    dispatch(actionsModal.setModalVisibleCapMot(true));
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Thông tin đã thanh toán'}</h3>
            <div className="card-toolbar">
              <div className="btn-group me-2 w-250px">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm"
                  onChange={handleKeywordChange}
                />
              </div>
              <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNew}>
                <span>
                  <i className="fa-regular fa-plus me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            </div>
          </div>
          <ThongTinDaThanhToanTable searchData={searchData} />
        </div>
      </Content>
      {modalVisibleCapMot ? <ThongTinDaThanhToanModal /> : null}
    </>
  );
};
