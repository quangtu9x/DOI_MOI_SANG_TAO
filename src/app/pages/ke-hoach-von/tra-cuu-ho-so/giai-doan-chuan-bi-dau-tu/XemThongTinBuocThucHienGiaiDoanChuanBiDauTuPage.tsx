import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Select } from 'antd';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { StepType, ProjectPhase, DecisionType } from '@/models/ke-hoach-von';
import { StepExecutionViewTable } from './components/StepExecutionViewTable';
import { DecisionViewTable } from './components/DecisionViewTable';
import { StepExecutionViewModal } from './components/StepExecutionViewModal';
import { DecisionViewModal } from './components/DecisionViewModal';

type TableType =
  | 'preFeasibilityReport'
  | 'investmentPolicyProposal'
  | 'investmentPolicyDecision'
  | 'surveyTask'
  | 'feasibilityReport'
  | 'basicDesignPreparation'
  | 'basicDesignAppraisal'
  | 'investmentDecision';

const tableOptions = [
  { value: 'preFeasibilityReport', label: 'Báo cáo nghiên cứu tiền khả thi dự án' },
  { value: 'investmentPolicyProposal', label: 'Báo cáo đề xuất chủ trương đầu tư dự án' },
  { value: 'investmentPolicyDecision', label: 'Quyết định chủ trương đầu tư dự án' },
  { value: 'surveyTask', label: 'Nhiệm vụ khảo sát' },
  { value: 'feasibilityReport', label: 'Báo cáo nghiên cứu khả thi dự án' },
  { value: 'basicDesignPreparation', label: 'Hồ sơ thiết kế cơ sở - Lập hồ sơ' },
  { value: 'basicDesignAppraisal', label: 'Hồ sơ thiết kế cơ sở - Thẩm định' },
  { value: 'investmentDecision', label: 'Quyết định đầu tư dự án' },
];

export const XemThongTinBuocThucHienGiaiDoanChuanBiDauTuPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [projectProcessExecutionId, setProjectProcessExecutionId] = useState<string | undefined>(undefined);
  const [selectedTable, setSelectedTable] = useState<TableType>('preFeasibilityReport');

  useEffect(() => {
    // Lấy projectId từ URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdParam = urlParams.get('projectId');
    const projectProcessExecutionIdParam = urlParams.get('projectProcessExecutionId');
    
    if (projectIdParam) {
      setProjectId(projectIdParam);
    }
    if (projectProcessExecutionIdParam) {
      setProjectProcessExecutionId(projectProcessExecutionIdParam);
    }
  }, []);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleTableChange = (value: TableType): void => {
    setSelectedTable(value);
  };

  const renderSelectedTable = (): React.ReactNode => {
    switch (selectedTable) {
      case 'preFeasibilityReport':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.PreFeasibilityReport}
            phase={ProjectPhase.Preparation}
            title="Báo cáo nghiên cứu tiền khả thi dự án"
          />
        );
      case 'investmentPolicyProposal':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.InvestmentPolicyProposal}
            phase={ProjectPhase.Preparation}
            title="Báo cáo đề xuất chủ trương đầu tư dự án"
          />
        );
      case 'investmentPolicyDecision':
        return (
          <DecisionViewTable
            searchData={searchData}
            projectId={projectId}
            decisionType={DecisionType.InvestmentPolicy}
            title="Quyết định chủ trương đầu tư dự án"
          />
        );
      case 'surveyTask':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.SurveyTask}
            phase={ProjectPhase.Preparation}
            title="Nhiệm vụ khảo sát"
          />
        );
      case 'feasibilityReport':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.FeasibilityReport}
            phase={ProjectPhase.Preparation}
            title="Báo cáo nghiên cứu khả thi dự án"
          />
        );
      case 'basicDesignPreparation':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.BasicDesignPreparation}
            phase={ProjectPhase.Preparation}
            title="Hồ sơ thiết kế cơ sở - Lập hồ sơ"
          />
        );
      case 'basicDesignAppraisal':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.BasicDesignAppraisal}
            phase={ProjectPhase.Preparation}
            title="Hồ sơ thiết kế cơ sở - Thẩm định"
          />
        );
      case 'investmentDecision':
        return (
          <DecisionViewTable
            searchData={searchData}
            projectId={projectId}
            decisionType={DecisionType.InvestmentDecision}
            title="Quyết định đầu tư dự án"
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
              Xem thông tin các bước thực hiện của dự án ở Giai đoạn chuẩn bị đầu tư
            </h3>
            <div className="card-toolbar d-flex align-items-center gap-2">
              <div className="w-300px">
                <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn loại thông tin cần xem"
                  value={selectedTable}
                  onChange={handleTableChange}
                  options={tableOptions}
                />
              </div>
              <div className="btn-group me-2 w-250px">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm"
                  onChange={handleKeywordChange}
                />
              </div>
            </div>
          </div>

          {/* Hiển thị bảng được chọn */}
          {renderSelectedTable()}
        </div>
      </Content>

      {/* Modals */}
      <StepExecutionViewModal />
      <DecisionViewModal />
    </>
  );
};
