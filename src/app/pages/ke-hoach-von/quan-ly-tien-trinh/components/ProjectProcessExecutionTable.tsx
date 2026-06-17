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
import { IProjectProcessExecution } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { deleteProjectProcessExecution } from '@/services/projectProcessExecution.service';
import { useProjectProcessExecutionTable } from './useProjectProcessExecutionTable';

interface ProjectProcessExecutionTableProps {
  searchData?: SearchData;
}

export const ProjectProcessExecutionTable: React.FC<ProjectProcessExecutionTableProps> = ({
  searchData,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectProcessExecutionTable({ searchData });

  const handleAction = async (type: string, record: IProjectProcessExecution): Promise<void> => {
    try {
      switch (type) {
        case 'edit':
          dispatch(actionsModal.setDataModalCapHai(record));
          dispatch(actionsModal.setModalVisibleCapHai(true));
          break;
        case 'view':
          dispatch(actionsModal.setDataModalCapHai({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisibleCapHai(true));
          break;
        case 'steps':
          dispatch(actionsModal.setDataModalCapHai({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisibleCapHai(true));
          break;
        case 'delete':
          await deleteProjectProcessExecution(record.id!);
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

  const allColumns: TableProps<IProjectProcessExecution>['columns'] = [
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
      width: '30%',
      render: (text, record) => {
        const projectCode = record.projectCode || '';
        const projectName = text || '';
        if (projectCode && projectName) {
          return `${projectCode} - ${projectName}`;
        }
        return projectName || projectCode || '-';
      },
    },
    {
      title: 'Quy trình',
      dataIndex: 'projectProcessName',
      key: 'projectProcessName',
      width: '30%',
      render: (text, record) => text || record.projectProcessCode || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isCompleted',
      key: 'isCompleted',
      width: '15%',
      className: 'text-center',
      render: (isCompleted) => {
        return (
          <div
            className={clsx(
              'badge fw-bolder',
              isCompleted ? 'badge-light-success' : 'badge-light-warning'
            )}
          >
            {isCompleted ? 'Hoàn thành' : 'Đang thực hiện'}
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
              onClick={() => handleAction('steps', record)}
              title="Xem các bước thực hiện"
            >
              <i className="fa-solid fa-list-check"></i>
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
              description="Bạn có chắc chắn muốn xóa áp dụng quy trình này?"
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
          <TDTable<IProjectProcessExecution>
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
