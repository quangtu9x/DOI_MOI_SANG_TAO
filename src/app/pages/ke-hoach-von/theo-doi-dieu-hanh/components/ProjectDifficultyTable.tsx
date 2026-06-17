/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import {
  IProjectDifficulty,
  ProjectDifficultyType,
  ProjectDifficultyLevel,
  ResolutionStatus,
  ProjectStatus,
  ProjectPhase,
} from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { useProjectDifficultyTable } from './useProjectDifficultyTable';

const STORAGE_KEY = 'project_difficulty_column_config';

interface ColumnConfig {
  key: string;
  title: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'projectCode', title: 'Mã dự án', visible: true },
  { key: 'projectName', title: 'Tên dự án', visible: true },
  { key: 'title', title: 'Tiêu đề', visible: true },
  { key: 'type', title: 'Loại khó khăn', visible: true },
  { key: 'level', title: 'Mức độ', visible: true },
  { key: 'occurredDate', title: 'Ngày phát sinh', visible: true },
  { key: 'resolutionStatus', title: 'Trạng thái xử lý', visible: true },
  { key: 'resolvedDate', title: 'Ngày xử lý', visible: false },
  { key: 'resolutionResult', title: 'Kết quả xử lý', visible: false },
  { key: 'content', title: 'Nội dung', visible: false },
  { key: 'note', title: 'Ghi chú', visible: false },
];

interface ProjectDifficultyTableProps {
  searchData?: SearchData;
}

const getTypeLabel = (type?: ProjectDifficultyType): string => {
  switch (type) {
    case ProjectDifficultyType.Technical:
      return 'Kỹ thuật';
    case ProjectDifficultyType.Financial:
      return 'Tài chính';
    case ProjectDifficultyType.Legal:
      return 'Pháp lý';
    case ProjectDifficultyType.Other:
      return 'Khác';
    default:
      return 'Không xác định';
  }
};

const getTypeBadgeClass = (type?: ProjectDifficultyType): string => {
  switch (type) {
    case ProjectDifficultyType.Technical:
      return 'badge-light-info';
    case ProjectDifficultyType.Financial:
      return 'badge-light-warning';
    case ProjectDifficultyType.Legal:
      return 'badge-light-danger';
    case ProjectDifficultyType.Other:
      return 'badge-light-secondary';
    default:
      return 'badge-light-secondary';
  }
};

const getLevelLabel = (level?: ProjectDifficultyLevel): string => {
  switch (level) {
    case ProjectDifficultyLevel.Low:
      return 'Thấp';
    case ProjectDifficultyLevel.Medium:
      return 'Trung bình';
    case ProjectDifficultyLevel.High:
      return 'Cao';
    case ProjectDifficultyLevel.Critical:
      return 'Nghiêm trọng';
    default:
      return 'Không xác định';
  }
};

const getLevelBadgeClass = (level?: ProjectDifficultyLevel): string => {
  switch (level) {
    case ProjectDifficultyLevel.Low:
      return 'badge-light-success';
    case ProjectDifficultyLevel.Medium:
      return 'badge-light-info';
    case ProjectDifficultyLevel.High:
      return 'badge-light-warning';
    case ProjectDifficultyLevel.Critical:
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

const getResolutionStatusBadgeClass = (status?: ResolutionStatus): string => {
  switch (status) {
    case ResolutionStatus.Pending:
      return 'badge-light-secondary';
    case ResolutionStatus.InProgress:
      return 'badge-light-warning';
    case ResolutionStatus.Resolved:
      return 'badge-light-success';
    case ResolutionStatus.Unresolved:
      return 'badge-light-danger';
    default:
      return 'badge-light-secondary';
  }
};

export const ProjectDifficultyTable: React.FC<ProjectDifficultyTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectDifficultyTable({ searchData });
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const random = useSelector((state: RootState) => state.global.random);
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  useEffect(() => {
    const loadColumnConfig = (): void => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ColumnConfig[];
          setColumnConfig(parsed);
        }
      } catch (error) {
        console.error('Error loading column config:', error);
      }
    };
    loadColumnConfig();
  }, [random]);

  const handleAction = async (type: string, record: IProjectDifficulty): Promise<void> => {
    try {
      switch (type) {
        case 'view':
          dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisible(true));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling action:', error);
    }
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
      title: 'Mã dự án',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
    },
    {
      title: 'Tên dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Loại khó khăn',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      className: 'text-center',
      render: (type) => {
        return (
          <div className={clsx('badge fw-bolder', getTypeBadgeClass(type))}>
            {getTypeLabel(type)}
          </div>
        );
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      className: 'text-center',
      render: (level) => {
        return (
          <div className={clsx('badge fw-bolder', getLevelBadgeClass(level))}>
            {getLevelLabel(level)}
          </div>
        );
      },
    },
    {
      title: 'Ngày phát sinh',
      dataIndex: 'occurredDate',
      key: 'occurredDate',
      width: 120,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Trạng thái xử lý',
      dataIndex: 'resolutionStatus',
      key: 'resolutionStatus',
      width: 150,
      className: 'text-center',
      render: (status) => {
        return (
          <div className={clsx('badge fw-bolder', getResolutionStatusBadgeClass(status))}>
            {getResolutionStatusLabel(status)}
          </div>
        );
      },
    },
    {
      title: 'Ngày xử lý',
      dataIndex: 'resolvedDate',
      key: 'resolvedDate',
      width: 120,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Kết quả xử lý',
      dataIndex: 'resolutionResult',
      key: 'resolutionResult',
      width: 200,
      render: (value) =>
        value ? (
          <div
            style={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={value}
          >
            {value}
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      render: (value) =>
        value ? (
          <div
            style={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={value}
          >
            {value}
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 200,
      render: (value) =>
        value ? (
          <div
            style={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={value}
          >
            {value}
          </div>
        ) : (
          '-'
        ),
    },
    {
      width: 100,
      title: 'Thao tác',
      key: 'actions',
      className: 'text-center',
      render: (text, record) => {
        return (
          <div className="d-flex justify-content-center gap-2">
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
              onClick={() => handleAction('view', record)}
              title="Xem chi tiết"
            >
              <i className="fa-regular fa-eye"></i>
            </a>
          </div>
        );
      },
    },
  ];

  const columns = useMemo(() => {
    const visibleKeys = new Set(
      columnConfig.filter(col => col.visible).map(col => col.key)
    );
    return allColumns.filter(
      col => col.key === 'index' || col.key === 'actions' || visibleKeys.has(col.key as string)
    );
  }, [columnConfig]);

  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IProjectDifficulty>
            dataSource={data}
            columns={columns}
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
