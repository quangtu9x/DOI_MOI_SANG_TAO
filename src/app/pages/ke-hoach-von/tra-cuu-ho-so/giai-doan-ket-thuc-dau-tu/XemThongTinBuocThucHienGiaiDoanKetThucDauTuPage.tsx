import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Select } from 'antd';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { StepType, ProjectPhase } from '@/models/ke-hoach-von';
import { StepExecutionViewTable } from './components/StepExecutionViewTable';
import { ProjectOperationMaintenanceViewTable } from './components/ProjectOperationMaintenanceViewTable';
import { StepExecutionViewModal } from './components/StepExecutionViewModal';
import { ProjectOperationMaintenanceViewModal } from './components/ProjectOperationMaintenanceViewModal';

type TableType = 'paymentSettlement' | 'operationMaintenance';

const tableOptions = [
  { value: 'paymentSettlement', label: 'Thanh toán, quyết toán dự án' },
  { value: 'operationMaintenance', label: 'Vận hành và bảo trì sản phẩm của dự án' },
];

export const XemThongTinBuocThucHienGiaiDoanKetThucDauTuPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [projectProcessExecutionId, setProjectProcessExecutionId] = useState<string | undefined>(undefined);
  const [selectedTable, setSelectedTable] = useState<TableType>('paymentSettlement');

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
      case 'paymentSettlement':
        return (
          <StepExecutionViewTable
            searchData={searchData}
            projectProcessExecutionId={projectProcessExecutionId}
            stepType={StepType.PaymentSettlement}
            phase={ProjectPhase.Completion}
            title="Thanh toán, quyết toán dự án"
          />
        );
      case 'operationMaintenance':
        return (
          <ProjectOperationMaintenanceViewTable
            searchData={searchData}
            projectId={projectId}
            title="Vận hành và bảo trì sản phẩm của dự án"
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
              Xem thông tin các bước thực hiện của dự án ở Giai đoạn kết thúc đầu tư
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
      <ProjectOperationMaintenanceViewModal />
    </>
  );
};
