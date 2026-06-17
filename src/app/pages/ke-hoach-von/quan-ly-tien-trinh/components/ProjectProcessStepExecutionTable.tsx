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
import { IProjectProcessStepExecution, WorkItemStatus } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { deleteProjectProcessStepExecution } from '@/services/projectProcessStepExecution.service';
import { useProjectProcessStepExecutionTable } from './useProjectProcessStepExecutionTable';

interface ProjectProcessStepExecutionTableProps {
  searchData?: SearchData;
}

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
      return 'Không xác định';
  }
};

const getStatusBadgeClass = (status?: WorkItemStatus): string => {
  switch (status) {
    case WorkItemStatus.Pending:
      return 'badge-light-secondary';
    case WorkItemStatus.InProgress:
      return 'badge-light-warning';
    case WorkItemStatus.Completed:
      return 'badge-light-success';
    case WorkItemStatus.Cancelled:
      return 'badge-light-danger';
    default:
      return 'badge-light-secondary';
  }
};

export const ProjectProcessStepExecutionTable: React.FC<ProjectProcessStepExecutionTableProps> = ({
  searchData,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectProcessStepExecutionTable({ searchData });

  const handleAction = async (
    type: string,
    record: IProjectProcessStepExecution
  ): Promise<void> => {
    try {
      switch (type) {
        case 'edit':
          dispatch(actionsModal.setDataModalCapBa(record));
          dispatch(actionsModal.setModalVisibleCapBa(true));
          break;
        case 'assign':
          dispatch(actionsModal.setDataModalCapBa({ ...record, assignMode: true }));
          dispatch(actionsModal.setModalVisibleCapBa(true));
          break;
        case 'view':
          dispatch(actionsModal.setDataModalCapBa({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisibleCapBa(true));
          break;
        case 'delete':
          await deleteProjectProcessStepExecution(record.id!);
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
      title: 'Bước quy trình',
      dataIndex: 'projectProcessStepName',
      key: 'projectProcessStepName',
      width: 200,
    },
    {
      title: 'Người được phân công',
      dataIndex: 'assignedUserFullName',
      key: 'assignedUserFullName',
      width: 200,
      render: (text, record) => text || record.assignedUserName || '-',
    },
    {
      title: 'Ngày phân công',
      dataIndex: 'assignedDate',
      key: 'assignedDate',
      width: 120,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Ngày kết thúc dự kiến',
      dataIndex: 'expectedEndDate',
      key: 'expectedEndDate',
      width: 150,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Ngày kết thúc thực tế',
      dataIndex: 'actualEndDate',
      key: 'actualEndDate',
      width: 150,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
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
      title: 'Hoàn thành',
      dataIndex: 'isCompleted',
      key: 'isCompleted',
      width: 100,
      className: 'text-center',
      render: (isCompleted) => {
        return (
          <div
            className={clsx(
              'badge fw-bolder',
              isCompleted ? 'badge-light-success' : 'badge-light-warning'
            )}
          >
            {isCompleted ? 'Có' : 'Chưa'}
          </div>
        );
      },
    },
    {
      title: 'Kết quả',
      dataIndex: 'result',
      key: 'result',
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
      width: 150,
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
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
              onClick={() => handleAction('assign', record)}
              title="Phân công cán bộ"
            >
              <i className="fa-regular fa-user-plus"></i>
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
              description="Bạn có chắc chắn muốn xóa thực hiện bước này?"
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
