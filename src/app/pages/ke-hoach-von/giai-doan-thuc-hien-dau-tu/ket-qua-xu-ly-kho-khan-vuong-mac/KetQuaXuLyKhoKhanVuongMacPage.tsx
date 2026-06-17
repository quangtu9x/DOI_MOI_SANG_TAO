import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { ProjectDifficultyTable, ProjectDifficultyModal } from '../tinh-hinh-thuc-hien-du-an-kho-khan-vuong-mac/components';

export const KetQuaXuLyKhoKhanVuongMacPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleAddStepExecution = (): void => {
    // comment: mở modal cập nhật kết quả xử lý khó khăn, vướng mắc
    dispatch(actionsModal.setDataModalCapMot({ readOnly: false, mode: 'resolve' }));
    dispatch(actionsModal.setModalVisibleCapMot(true));
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
              Quản lý kết quả xử lý các khó khăn, vướng mắc trong quá trình thực hiện dự án
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
              <button className="btn btn-primary btn-sm py-2" onClick={handleAddStepExecution}>
                <i className="fa-regular fa-plus me-2"></i>
                Thêm mới
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <ProjectDifficultyTable searchData={searchData} mode="resolve" />
          </div>
        </div>
      </Content>
      <ProjectDifficultyModal />
    </>
  );
};
