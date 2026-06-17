/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { ICapitalAllocation, CapitalAllocationType } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { deleteCapitalAllocation } from '@/services/capitalAllocation.service';
import { useCapitalAllocationTable } from './useCapitalAllocationTable';
import { formatNumber } from '@/utils/utils';
import dayjs from 'dayjs';

interface CapitalAllocationTableProps {
  searchData?: SearchData;
}

const getAllocationTypeLabel = (type: CapitalAllocationType): string => {
  switch (type) {
    case CapitalAllocationType.Initial:
      return 'Phân bổ ban đầu';
    case CapitalAllocationType.Adjustment:
      return 'Điều chỉnh';
    case CapitalAllocationType.Supplement:
      return 'Bổ sung';
    default:
      return 'Không xác định';
  }
};

const getAllocationTypeBadgeClass = (type: CapitalAllocationType): string => {
  switch (type) {
    case CapitalAllocationType.Initial:
      return 'badge-light-primary';
    case CapitalAllocationType.Adjustment:
      return 'badge-light-warning';
    case CapitalAllocationType.Supplement:
      return 'badge-light-info';
    default:
      return 'badge-light-secondary';
  }
};

export const CapitalAllocationTable: React.FC<CapitalAllocationTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useCapitalAllocationTable({ searchData });
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const handleAction = async (type: string, record: ICapitalAllocation): Promise<void> => {
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
          await deleteCapitalAllocation(record.id!);
          toast.success('Xóa thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const columns: TableProps<ICapitalAllocation>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Kế hoạch vốn hàng năm',
      dataIndex: 'annualCapitalPlanName',
      key: 'annualCapitalPlanName',
      width: 200,
      render: (text: string, record: ICapitalAllocation) => {
        const code = record.annualCapitalPlanCode || '';
        const name = record.annualCapitalPlanName || '';
        if (code && name) {
          return `${code} - ${name}`;
        }
        if (name) return name;
        if (code) return code;
        return '-';
      },
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      render: (text: string, record: ICapitalAllocation) => {
        const code = record.projectCode || '';
        const name = record.projectName || '';
        if (code && name) {
          return `${code} - ${name}`;
        }
        if (name) return name;
        if (code) return code;
        return '-';
      },
    },
    {
      title: 'Chủ đầu tư',
      dataIndex: 'projectOwnerName',
      key: 'projectOwnerName',
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: 'Số tiền phân bổ (VNĐ)',
      dataIndex: 'allocatedAmount',
      key: 'allocatedAmount',
      width: 150,
      className: 'text-end',
      render: (value: number) => (value ? formatNumber(value) : '-'),
    },
    {
      title: 'Loại phân bổ',
      dataIndex: 'allocationType',
      key: 'allocationType',
      width: 150,
      className: 'text-center',
      render: (type: CapitalAllocationType) => {
        if (type === null || type === undefined) return '-';
        return (
          <div className={clsx('badge fw-bolder', getAllocationTypeBadgeClass(type))}>
            {getAllocationTypeLabel(type)}
          </div>
        );
      },
    },
    {
      title: 'Ngày phân bổ',
      dataIndex: 'allocationDate',
      key: 'allocationDate',
      width: 150,
      className: 'text-center',
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      width: 150,
      title: 'Thao tác',
      className: 'text-center',
      fixed: 'right',
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
              description="Bạn có chắc chắn muốn xóa phân bổ vốn này?"
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
          <TDTable<ICapitalAllocation>
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
