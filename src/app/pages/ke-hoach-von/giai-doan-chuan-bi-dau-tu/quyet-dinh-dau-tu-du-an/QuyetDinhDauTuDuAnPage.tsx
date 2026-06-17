import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { DecisionType } from '@/models';
import { QuyetDinhDauTuDuAnTable } from './components/QuyetDinhDauTuDuAnTable';
import { QuyetDinhChuTruongDauTuModal } from '../quyet-dinh-chu-truong-dau-tu/components/QuyetDinhChuTruongDauTuModal';

export const QuyetDinhDauTuDuAnPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleAddDecision = (): void => {
    dispatch(actionsModal.setDataModalCapBon({ readOnly: false, type: DecisionType.InvestmentDecision }));
    dispatch(actionsModal.setModalVisibleCapBon(true));
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
              Quản lý thông tin Quyết định đầu tư dự án
            </h3>
            <div className="card-toolbar">
              <div className="btn-group me-2 flex-grow-1">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm"
                  value={searchData?.keyword || ''}
                  onChange={handleKeywordChange}
                />
              </div>
              <button className="btn btn-primary btn-sm py-2" onClick={handleAddDecision}>
                <i className="fa-regular fa-plus me-2"></i>
                Thêm quyết định
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <QuyetDinhDauTuDuAnTable searchData={searchData} />
          </div>
        </div>
      </Content>
      <QuyetDinhChuTruongDauTuModal />
    </>
  );
};
