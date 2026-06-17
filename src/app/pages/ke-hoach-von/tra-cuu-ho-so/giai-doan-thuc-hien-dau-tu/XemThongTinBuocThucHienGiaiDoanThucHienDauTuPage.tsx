import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Select } from 'antd';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { StepType, ProjectPhase } from '@/models/ke-hoach-von';
import { StepExecutionViewTable } from './components/StepExecutionViewTable';
import { ProjectDifficultyViewTable } from './components/ProjectDifficultyViewTable';
import { StepExecutionViewModal } from './components/StepExecutionViewModal';
import { ProjectDifficultyViewModal } from './components/ProjectDifficultyViewModal';

type TableType =
  | 'detailedDesignPreparation'
  | 'detailedDesignAppraisal'
  | 'biddingContractorSelection'
  | 'projectDifficulty'
  | 'productTesting'
  | 'trialOperation'
  | 'acceptanceHandover';

const tableOptions = [
  { value: 'detailedDesignPreparation', label: 'Hồ sơ thiết kế chi tiết và dự toán - Lập hồ sơ' },
  { value: 'detailedDesignAppraisal', label: 'Hồ sơ thiết kế chi tiết và dự toán - Thẩm định' },
  { value: 'biddingContractorSelection', label: 'Đấu thầu, lựa chọn nhà thầu' },
  { value: 'projectDifficulty', label: 'Các khó khăn, vướng mắc trong quá trình thực hiện dự án' },
  { value: 'productTesting', label: 'Kiểm thử sản phẩm của dự án' },
  { value: 'trialOperation', label: 'Vận hành thử sản phẩm của dự án' },
  { value: 'acceptanceHandover', label: 'Nghiệm thu, bàn giao sản phẩm của dự án' },
];

export const XemThongTinBuocThucHienGiaiDoanThucHienDauTuPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [projectProcessExecutionId, setProjectProcessExecutionId] = useState<string | undefined>(undefined);
  const [selectedTable, setSelectedTable] = useState<TableType>('detailedDesignPreparation');

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
      case 'detailedDesignPreparation':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.DetailedDesignPreparation}
            phase={ProjectPhase.Implementation}
            title="Hồ sơ thiết kế chi tiết và dự toán - Lập hồ sơ"
          />
        );
      case 'detailedDesignAppraisal':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.DetailedDesignAppraisal}
            phase={ProjectPhase.Implementation}
            title="Hồ sơ thiết kế chi tiết và dự toán - Thẩm định"
          />
        );
      case 'biddingContractorSelection':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.BiddingContractorSelection}
            phase={ProjectPhase.Implementation}
            title="Đấu thầu, lựa chọn nhà thầu"
          />
        );
      case 'projectDifficulty':
        return (
          <ProjectDifficultyViewTable
            searchData={searchData}
            projectId={projectId}
            title="Các khó khăn, vướng mắc trong quá trình thực hiện dự án"
          />
        );
      case 'productTesting':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.ProductTesting}
            phase={ProjectPhase.Implementation}
            title="Kiểm thử sản phẩm của dự án"
          />
        );
      case 'trialOperation':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.TrialOperation}
            phase={ProjectPhase.Implementation}
            title="Vận hành thử sản phẩm của dự án"
          />
        );
      case 'acceptanceHandover':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.AcceptanceHandover}
            phase={ProjectPhase.Implementation}
            title="Nghiệm thu, bàn giao sản phẩm của dự án"
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
              Xem thông tin các bước thực hiện của dự án ở Giai đoạn thực hiện đầu tư
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
      <ProjectDifficultyViewModal />
    </>
  );
};
