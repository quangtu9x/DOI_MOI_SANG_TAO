/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useDispatch } from 'react-redux';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import {
  IProjectDifficulty,
  DifficultyType,
  DifficultyLevel,
  ResolutionStatus,
} from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { deleteProjectDifficulty } from '@/services/projectDifficulty.service';
import {
  useProjectDifficultyTable,
  ProjectDifficultyMode,
} from './useProjectDifficultyTable';

interface ProjectDifficultyTableProps {
  searchData?: SearchData;
  mode?: ProjectDifficultyMode;
}

const getTypeLabel = (type?: DifficultyType): string => {
  // comment: nhãn loại khó khăn
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
  // comment: nhãn mức độ khó khăn
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
  // comment: màu badge theo mức độ khó khăn
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
  // comment: nhãn trạng thái xử lý
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
  // comment: màu badge theo trạng thái xử lý
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

export const ProjectDifficultyTable: React.FC<ProjectDifficultyTableProps> = ({
  searchData,
  mode = 'list',
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectDifficultyTable({ searchData, mode });

  const handleAction = async (type: string, record: IProjectDifficulty): Promise<void> => {
    // comment: xử lý xem/sửa/xóa/cập nhật kết quả khó khăn
    try {
      switch (type) {
        case 'edit':
          dispatch(actionsModal.setDataModalCapMot({ ...record, mode: 'list', readOnly: false }));
          dispatch(actionsModal.setModalVisibleCapMot(true));
          break;
        case 'view':
          dispatch(actionsModal.setDataModalCapMot({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisibleCapMot(true));
          break;
        case 'resolve':
          dispatch(
            actionsModal.setDataModalCapMot({
              ...record,
              mode: 'resolve',
              readOnly: false,
            })
          );
          dispatch(actionsModal.setModalVisibleCapMot(true));
          break;
        case 'delete':
          await deleteProjectDifficulty(record.id!);
          toast.success('Xóa khó khăn, vướng mắc thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling project difficulty action:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const allColumns: TableProps<IProjectDifficulty>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 220,
      render: (value) =>
        value ? (
          <div
            style={{
              maxWidth: 220,
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
      title: 'Ngày phát sinh',
      dataIndex: 'occurredDate',
      key: 'occurredDate',
      width: 130,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
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
      render: (text, record) => (
        <div className="d-flex justify-content-center gap-2">
          <a
            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
            onClick={() => handleAction('view', record)}
            title="Xem chi tiết"
          >
            <i className="fa-regular fa-eye" />
          </a>
          {mode === 'list' && (
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
              onClick={() => handleAction('edit', record)}
              title="Chỉnh sửa"
            >
              <i className="fa-regular fa-pen-to-square" />
            </a>
          )}
          {mode === 'resolve' && (
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
              onClick={() => handleAction('resolve', record)}
              title="Cập nhật kết quả xử lý"
            >
              <i className="fa-regular fa-pen-to-square" />
            </a>
          )}
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa bản ghi này?"
            onConfirm={() => handleAction('delete', record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <a
              className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
              title="Xóa"
            >
              <i className="fa-regular fa-trash" />
            </a>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
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
  );
};

