import React from 'react';
import { useDispatch } from 'react-redux';
import { TableProps } from 'antd/es/table';
import clsx from 'clsx';

import * as actionsModal from '@/redux/modal/Actions';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IProjectProcessStepExecution, StepType, WorkItemStatus, ProjectPhase } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { useStepExecutionViewTable } from './useStepExecutionViewTable';

interface StepExecutionViewTableProps {
  searchData?: SearchData;
  projectProcessExecutionId?: string;
  stepType?: StepType;
  stepTypes?: StepType[];
  phase?: ProjectPhase;
  title?: string;
}

const getStepTypeName = (stepType?: StepType, stepTypeName?: string): string => {
  if (stepTypeName) return stepTypeName;
  
  switch (stepType) {
    case StepType.PreFeasibilityReport:
      return 'Báo cáo nghiên cứu tiền khả thi';
    case StepType.InvestmentPolicyProposal:
      return 'Báo cáo đề xuất chủ trương đầu tư';
    case StepType.SurveyTask:
      return 'Nhiệm vụ khảo sát';
    case StepType.FeasibilityReport:
      return 'Báo cáo nghiên cứu khả thi';
    case StepType.BasicDesignPreparation:
      return 'Hồ sơ thiết kế cơ sở - Lập hồ sơ';
    case StepType.BasicDesignAppraisal:
      return 'Hồ sơ thiết kế cơ sở - Thẩm định';
    default:
      return 'Không xác định';
  }
};

const getStatusLabel = (status?: WorkItemStatus): string => {
  switch (status) {
    case WorkItemStatus.Pending:
      return 'Chờ xử lý';
    case WorkItemStatus.InProgress:
      return 'Đang xử lý';
    case WorkItemStatus.Completed:
      return 'Hoàn thành';
    case WorkItemStatus.Cancelled:
      return 'Hủy bỏ';
    default:
      return '-';
  }
};

const getStatusBadgeClass = (status?: WorkItemStatus): string => {
  switch (status) {
    case WorkItemStatus.Pending:
      return 'badge-light-warning';
    case WorkItemStatus.InProgress:
      return 'badge-light-info';
    case WorkItemStatus.Completed:
      return 'badge-light-success';
    case WorkItemStatus.Cancelled:
      return 'badge-light-danger';
    default:
      return 'badge-light-secondary';
  }
};

export const StepExecutionViewTable: React.FC<StepExecutionViewTableProps> = ({
  searchData,
  projectProcessExecutionId,
  stepType,
  stepTypes,
  phase,
  title,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useStepExecutionViewTable({ searchData, projectProcessExecutionId, stepType, stepTypes, phase });

  const handleView = (record: IProjectProcessStepExecution): void => {
    dispatch(actionsModal.setDataModalViewStepExecution({ ...record, readOnly: true }));
    dispatch(actionsModal.setModalVisibleViewStepExecution(true));
  };

  const allColumns: TableProps<IProjectProcessStepExecution>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Loại bước',
      dataIndex: 'stepType',
      key: 'stepType',
      width: 250,
      render: (stepType, record) => getStepTypeName(stepType, record.stepTypeName),
    },
    {
      title: 'Tên bước',
      dataIndex: 'stepName',
      key: 'stepName',
      width: 300,
    },
    {
      title: 'Người được phân công',
      dataIndex: 'assignedUserFullName',
      key: 'assignedUserFullName',
      width: 250,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      className: 'text-center',
      render: (status) => {
        return (
          <div className={clsx('badge fw-bolder', getStatusBadgeClass(status))}>
            {getStatusLabel(status)}
          </div>
        );
      },
    },
    {
      width: 150,
      title: 'Thao tác',
      key: 'actions',
      className: 'text-center',
      render: (text, record) => {
        return (
          <div className="d-flex justify-content-center">
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
              onClick={() => handleView(record)}
              title="Xem chi tiết"
            >
              <i className="fa-regular fa-eye"></i>
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {title && (
        <div className="px-3 py-2 border-bottom border-secondary border-bottom-solid">
          <h4 className="fw-bold text-header-td fs-5 mb-0">{title}</h4>
        </div>
      )}
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IProjectProcessStepExecution>
            dataSource={data}
            columns={allColumns}
            isPagination={true}
            pageSize={pageSize}
            count={totalCount}
            offset={currentPage}
            setOffset={setCurrentPage}
            setPageSize={setPageSize}
            loading={loading}
            rowKey="id"
          />
        </div>
      </div>
    </>
  );
};
