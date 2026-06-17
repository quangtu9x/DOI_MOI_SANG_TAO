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
import { IProjectContract, ContractStatus } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { deleteProjectContract } from '@/services/projectContract.service';
import { useProjectContractTable } from './useProjectContractTable';

interface ProjectContractTableProps {
  searchData?: SearchData;
}

const getStatusLabel = (status?: ContractStatus): string => {
  // comment: ánh xạ enum trạng thái hợp đồng sang nhãn hiển thị
  switch (status) {
    case ContractStatus.Draft:
      return 'Nháp';
    case ContractStatus.Signed:
      return 'Đã ký';
    case ContractStatus.Executing:
      return 'Đang thực hiện';
    case ContractStatus.Completed:
      return 'Đã hoàn thành';
    case ContractStatus.Terminated:
      return 'Đã chấm dứt';
    default:
      return 'Không xác định';
  }
};

const getStatusBadgeClass = (status?: ContractStatus): string => {
  // comment: ánh xạ enum trạng thái hợp đồng sang màu badge
  switch (status) {
    case ContractStatus.Draft:
      return 'badge-light-secondary';
    case ContractStatus.Signed:
      return 'badge-light-info';
    case ContractStatus.Executing:
      return 'badge-light-warning';
    case ContractStatus.Completed:
      return 'badge-light-success';
    case ContractStatus.Terminated:
      return 'badge-light-danger';
    default:
      return 'badge-light-secondary';
  }
};

export const ProjectContractTable: React.FC<ProjectContractTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectContractTable({ searchData });

  const handleAction = async (type: string, record: IProjectContract): Promise<void> => {
    // comment: xử lý các action xem/sửa/xóa hợp đồng
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
        case 'delete':
          await deleteProjectContract(record.id!);
          toast.success('Xóa hợp đồng thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling contract action:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const allColumns: TableProps<IProjectContract>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Số hợp đồng',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      width: 140,
    },
    {
      title: 'Nhà thầu',
      dataIndex: 'contractorName',
      key: 'contractorName',
      width: 200,
      render: (text: string, record: IProjectContract) => {
        const code = record.contractorCode || '';
        const name = record.contractorName || '';
        if (code && name) {
          return `${code} - ${name}`;
        }
        if (name) return name;
        if (code) return code;
        return '-';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      className: 'text-center',
      render: (status) => (
        <div className={clsx('badge fw-bolder', getStatusBadgeClass(status))}>
          {getStatusLabel(status)}
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
          <a
            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
            onClick={() => handleAction('edit', record)}
            title="Chỉnh sửa"
          >
            <i className="fa-regular fa-pen-to-square" />
          </a>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa hợp đồng này?"
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
        <TDTable<IProjectContract>
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

