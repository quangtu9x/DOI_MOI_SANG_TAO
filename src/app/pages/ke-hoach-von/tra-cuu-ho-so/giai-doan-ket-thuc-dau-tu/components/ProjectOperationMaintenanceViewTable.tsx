import React from 'react';
import { useDispatch } from 'react-redux';
import { TableProps } from 'antd/es/table';
import clsx from 'clsx';

import * as actionsModal from '@/redux/modal/Actions';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IProjectOperationMaintenance, MaintenanceType } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { useProjectOperationMaintenanceViewTable } from './useProjectOperationMaintenanceViewTable';

interface ProjectOperationMaintenanceViewTableProps {
  searchData?: SearchData;
  projectId?: string;
  title?: string;
}

const getMaintenanceTypeLabel = (type?: MaintenanceType): string => {
  switch (type) {
    case MaintenanceType.Operation:
      return 'Vận hành';
    case MaintenanceType.Maintenance:
      return 'Bảo trì';
    case MaintenanceType.Repair:
      return 'Sửa chữa';
    default:
      return '-';
  }
};

const getMaintenanceTypeBadgeClass = (type?: MaintenanceType): string => {
  switch (type) {
    case MaintenanceType.Operation:
      return 'badge-light-primary';
    case MaintenanceType.Maintenance:
      return 'badge-light-info';
    case MaintenanceType.Repair:
      return 'badge-light-warning';
    default:
      return 'badge-light-secondary';
  }
};

export const ProjectOperationMaintenanceViewTable: React.FC<ProjectOperationMaintenanceViewTableProps> = ({
  searchData,
  projectId,
  title,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectOperationMaintenanceViewTable({ searchData, projectId });

  const handleView = (record: IProjectOperationMaintenance): void => {
    dispatch(actionsModal.setDataModalViewOperationMaintenance({ ...record, readOnly: true }));
    dispatch(actionsModal.setModalVisibleViewOperationMaintenance(true));
  };

  const allColumns: TableProps<IProjectOperationMaintenance>['columns'] = [
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
      width: 300,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      className: 'text-center',
      render: (type) => {
        return (
          <div className={clsx('badge fw-bolder', getMaintenanceTypeBadgeClass(type))}>
            {getMaintenanceTypeLabel(type)}
          </div>
        );
      },
    },
    {
      title: 'Ngày vận hành/bảo trì',
      dataIndex: 'operationDate',
      key: 'operationDate',
      width: 150,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
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
          <TDTable<IProjectOperationMaintenance>
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
