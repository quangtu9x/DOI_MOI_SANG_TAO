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
import { IProjectOperationMaintenance, MaintenanceType } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { deleteProjectOperationMaintenance } from '@/services/projectOperationMaintenance.service';
import { useProjectOperationMaintenanceTable } from './useProjectOperationMaintenanceTable';

interface ProjectOperationMaintenanceTableProps {
  searchData?: SearchData;
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

export const ProjectOperationMaintenanceTable: React.FC<ProjectOperationMaintenanceTableProps> = ({
  searchData,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectOperationMaintenanceTable({ searchData });

  const handleAction = async (
    type: string,
    record: IProjectOperationMaintenance
  ): Promise<void> => {
    try {
      switch (type) {
        case 'edit':
          dispatch(actionsModal.setDataModal(record));
          dispatch(actionsModal.setModalVisible(true));
          break;
        case 'view':
          dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisible(true));
          break;
        case 'delete':
          await deleteProjectOperationMaintenance(record.id!);
          toast.success('Xóa thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling action:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const columns: TableProps<IProjectOperationMaintenance>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      render: (text: string, record: IProjectOperationMaintenance) => {
        const code = record.projectCode || '';
        const name = record.projectName || text || '';
        if (code && name) {
          return `${code} - ${name}`;
        }
        if (name) return name;
        if (code) return code;
        // Nếu không có name/code, hiển thị projectId
        if (record.projectId) {
          return record.projectId;
        }
        return '-';
      },
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 200,
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
      title: 'Ngày bảo trì',
      dataIndex: 'operationDate',
      key: 'operationDate',
      width: 200,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      width: 150,
      title: 'Thao tác',
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
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
              onClick={() => handleAction('edit', record)}
              title="Sửa"
            >
              <i className="fa-regular fa-pen-to-square"></i>
            </a>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa thông tin vận hành và bảo trì này?"
              onConfirm={() => handleAction('delete', record)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm" title="Xóa">
                <i className="fa-regular fa-trash"></i>
              </a>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IProjectOperationMaintenance>
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
