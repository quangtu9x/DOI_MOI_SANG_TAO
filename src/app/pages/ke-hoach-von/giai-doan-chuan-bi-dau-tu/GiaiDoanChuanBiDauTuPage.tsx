import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { DecisionType } from '@/models';
import { StepExecutionTable } from './components/StepExecutionTable';
import { StepExecutionDetailModal } from './components/StepExecutionDetailModal';
import { ProjectDecisionTable } from './components/ProjectDecisionTable';
import { ProjectDecisionModal } from './components/ProjectDecisionModal';

type TabType = 'bao-cao-nghien-cuu-tien-kha-thi' | 'bao-cao-de-xuat-chu-truong' | 'quyet-dinh-chu-truong' | 'quyet-dinh-dau-tu';

export const GiaiDoanChuanBiDauTuPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<TabType>('bao-cao-nghien-cuu-tien-kha-thi');

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => { 
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleAddDecision = (type: DecisionType): void => {
    dispatch(actionsModal.setDataModalCapBon({ readOnly: false, type }));
    dispatch(actionsModal.setModalVisibleCapBon(true));
  };

  const handleAddStepExecution = (): void => {
    dispatch(actionsModal.setDataModalCapBa({ readOnly: false }));
    dispatch(actionsModal.setModalVisibleCapBa(true));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bao-cao-nghien-cuu-tien-kha-thi':
        return (
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Quản lý thông tin bước thực hiện báo cáo nghiên cứu tiền khả thi dự án</h5>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddStepExecution}
              >
                <i className="fa-regular fa-plus me-2"></i>
                Thêm mới
              </button>
            </div>
            <StepExecutionTable 
              searchData={searchData}
            />
          </div>
        );
      case 'bao-cao-de-xuat-chu-truong':
        return (
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Quản lý thông tin bước thực hiện báo cáo đề xuất chủ trương đầu tư dự án</h5>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddStepExecution}
              >
                <i className="fa-regular fa-plus me-2"></i>
                Thêm mới
              </button>
            </div>
            <StepExecutionTable 
              searchData={searchData}
            />
          </div>
        );
      case 'quyet-dinh-chu-truong':
        return (
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Quản lý thông tin Quyết định chủ trương đầu tư dự án</h5>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAddDecision(DecisionType.InvestmentPolicy)}
              >
                <i className="fa-regular fa-plus me-2"></i>
                Thêm quyết định
              </button>
            </div>
            <ProjectDecisionTable searchData={searchData} decisionType={DecisionType.InvestmentPolicy} />
          </div>
        );
      case 'quyet-dinh-dau-tu':
        return (
          <div className="card-body">
            <h5 className="mb-3">2. Lập, thẩm định, quyết định đầu tư dự án</h5>
            
            <div className="mb-5">
              <h6 className="mb-3">2.1. Nhiệm vụ khảo sát</h6>
              <StepExecutionTable searchData={searchData} />
            </div>

            <div className="mb-5">
              <h6 className="mb-3">2.2. Báo cáo nghiên cứu khả thi dự án</h6>
              <StepExecutionTable searchData={searchData} />
            </div>

            <div className="mb-5">
              <h6 className="mb-3">2.3. Hồ sơ thiết kế cơ sở (2 bước)</h6>
              <StepExecutionTable searchData={searchData} />
            </div>

            <div className="mb-5">
              <h6 className="mb-3">2.4. Báo cáo kinh tế kỹ thuật</h6>
              <StepExecutionTable searchData={searchData} />
            </div>

            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">2.5. Quyết định đầu tư dự án</h6>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAddDecision(DecisionType.InvestmentDecision)}
                >
                  <i className="fa-regular fa-plus me-2"></i>
                  Thêm quyết định
                </button>
              </div>
              <ProjectDecisionTable searchData={searchData} decisionType={DecisionType.InvestmentDecision} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
              {'Giai đoạn chuẩn bị đầu tư'}
            </h3>
          </div>

          {/* Main Tabs */}
          <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold">
            <li className="nav-item mt-2">
              <button
                className={`nav-link text-active-primary me-10 ${
                  activeTab === 'bao-cao-nghien-cuu-tien-kha-thi' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('bao-cao-nghien-cuu-tien-kha-thi')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: '2px' }}
              >
                Quản lý thông tin bước thực hiện báo cáo nghiên cứu tiền khả thi dự án
              </button>
            </li>
            <li className="nav-item mt-2">
              <button
                className={`nav-link text-active-primary ms-0 me-10 ${
                  activeTab === 'bao-cao-de-xuat-chu-truong' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('bao-cao-de-xuat-chu-truong')}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                Quản lý thông tin bước thực hiện báo cáo đề xuất chủ trương đầu tư dự án
              </button>
            </li>
            <li className="nav-item mt-2">
              <button
                className={`nav-link text-active-primary ms-0 me-10 ${
                  activeTab === 'quyet-dinh-chu-truong' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('quyet-dinh-chu-truong')}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                Quản lý thông tin Quyết định chủ trương đầu tư dự án
              </button>
            </li>
            <li className="nav-item mt-2">
              <button
                className={`nav-link text-active-primary ms-0 me-10 ${
                  activeTab === 'quyet-dinh-dau-tu' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('quyet-dinh-dau-tu')}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                2. Lập, thẩm định, quyết định đầu tư dự án
              </button>
            </li>
          </ul>

          {/* Toolbar */}
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <div className="card-toolbar d-flex align-items-center flex-grow-1">
              <div className="btn-group me-2 flex-grow-1">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm"
                  value={searchData?.keyword || ''}
                  onChange={handleKeywordChange}
                />
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>

        {/* Modals */}
        <StepExecutionDetailModal />
        <ProjectDecisionModal />
      </Content>
    </>
  );
};
