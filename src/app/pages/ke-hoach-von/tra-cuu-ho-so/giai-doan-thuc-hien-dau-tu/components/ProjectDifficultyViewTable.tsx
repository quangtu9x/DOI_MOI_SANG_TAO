import React from 'react';
import { useDispatch } from 'react-redux';
import { TableProps } from 'antd/es/table';
import clsx from 'clsx';

import * as actionsModal from '@/redux/modal/Actions';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import {
  IProjectDifficulty,
  DifficultyType,
  DifficultyLevel,
  ResolutionStatus,
} from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { useProjectDifficultyViewTable } from './useProjectDifficultyViewTable';

interface ProjectDifficultyViewTableProps {
  searchData?: SearchData;
  projectId?: string;
  title?: string;
}

const getTypeLabel = (type?: DifficultyType): string => {
  switch (type) {
    case DifficultyType.Technical:
      return 'Kỹ thuật';
    case DifficultyType.Financial:
      return 'Tài chính';
    case DifficultyType.Legal:
      return 'Pháp lý';
    case DifficultyType.Other:
      return 'Khác';
    default:
      return 'Không xác định';
  }
};

const getLevelLabel = (level?: DifficultyLevel): string => {
  switch (level) {
    case DifficultyLevel.Low:
      return 'Thấp';
    case DifficultyLevel.Medium:
      return 'Trung bình';
    case DifficultyLevel.High:
      return 'Cao';
    case DifficultyLevel.Critical:
      return 'Nghiêm trọng';
    default:
      return 'Không xác định';
  }
};

const getLevelBadgeClass = (level?: DifficultyLevel): string => {
  switch (level) {
    case DifficultyLevel.Low:
      return 'badge-light-success';
    case DifficultyLevel.Medium:
      return 'badge-light-info';
    case DifficultyLevel.High:
      return 'badge-light-warning';
    case DifficultyLevel.Critical:
      return 'badge-light-danger';
    default:
      return 'badge-light-secondary';
  }
};

const getResolutionStatusLabel = (status?: ResolutionStatus): string => {
  switch (status) {
    case ResolutionStatus.Pending:
      return 'Chờ xử lý';
    case ResolutionStatus.InProgress:
      return 'Đang xử lý';
    case ResolutionStatus.Resolved:
      return 'Đã xử lý';
    case ResolutionStatus.Unresolved:
      return 'Không thể xử lý';
    default:
      return 'Không xác định';
  }
};

const getResolutionBadgeClass = (status?: ResolutionStatus): string => {
  switch (status) {
    case ResolutionStatus.Pending:
      return 'badge-light-secondary';
    case ResolutionStatus.InProgress:
      return 'badge-light-info';
    case ResolutionStatus.Resolved:
      return 'badge-light-success';
    case ResolutionStatus.Unresolved:
      return 'badge-light-danger';
    default:
      return 'badge-light-secondary';
  }
};

export const ProjectDifficultyViewTable: React.FC<ProjectDifficultyViewTableProps> = ({
  searchData,
  projectId,
  title,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectDifficultyViewTable({ searchData, projectId });

  const handleView = (record: IProjectDifficulty): void => {
    dispatch(actionsModal.setDataModalViewDifficulty({ ...record, readOnly: true }));
    dispatch(actionsModal.setModalVisibleViewDifficulty(true));
  };

  const allColumns: TableProps<IProjectDifficulty>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (value) => getTypeLabel(value),
    },
    {
      title: 'Mức độ',
      dataIndex: 'level',
      key: 'level',
      width: 130,
      className: 'text-center',
      render: (level) => (
        <div className={clsx('badge fw-bolder', getLevelBadgeClass(level))}>
          {getLevelLabel(level)}
        </div>
      ),
    },
    {
      title: 'Tình trạng xử lý',
      dataIndex: 'resolutionStatus',
      key: 'resolutionStatus',
      width: 150,
      className: 'text-center',
      render: (status) => (
        <div className={clsx('badge fw-bolder', getResolutionBadgeClass(status))}>
          {getResolutionStatusLabel(status)}
        </div>
      ),
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
          <TDTable<IProjectDifficulty>
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
