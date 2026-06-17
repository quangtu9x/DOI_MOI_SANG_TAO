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
import { IAnnualCapitalPlan, CapitalPlanStatus } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { deleteAnnualCapitalPlan } from '@/services/annualCapitalPlan.service';
import { useAnnualCapitalPlanTable } from './useAnnualCapitalPlanTable';
import { formatNumber } from '@/utils/utils';

interface AnnualCapitalPlanTableProps {
  searchData?: SearchData;
  onPlanSelect?: (plan: IAnnualCapitalPlan | null) => void;
  selectedPlanId?: string | null;
}

const getStatusLabel = (status: CapitalPlanStatus): string => {
  switch (status) {
    case CapitalPlanStatus.Draft:
      return 'Nháp';
    case CapitalPlanStatus.Submitted:
      return 'Đã nộp';
    case CapitalPlanStatus.Approved:
      return 'Đã phê duyệt';
    case CapitalPlanStatus.Rejected:
      return 'Từ chối';
    case CapitalPlanStatus.Executing:
      return 'Đang thực hiện';
    case CapitalPlanStatus.Completed:
      return 'Hoàn thành';
    default:
      return 'Không xác định';
  }
};

const getStatusBadgeClass = (status: CapitalPlanStatus): string => {
  switch (status) {
    case CapitalPlanStatus.Draft:
      return 'badge-light-secondary';
    case CapitalPlanStatus.Submitted:
      return 'badge-light-info';
    case CapitalPlanStatus.Approved:
      return 'badge-light-success';
    case CapitalPlanStatus.Rejected:
      return 'badge-light-danger';
    case CapitalPlanStatus.Executing:
      return 'badge-light-warning';
    case CapitalPlanStatus.Completed:
      return 'badge-light-primary';
    default:
      return 'badge-light-secondary';
  }
};

export const AnnualCapitalPlanTable: React.FC<AnnualCapitalPlanTableProps> = ({
  searchData,
  onPlanSelect,
  selectedPlanId,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useAnnualCapitalPlanTable({ searchData });
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const handleAction = async (type: string, record: IAnnualCapitalPlan): Promise<void> => {
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
          await deleteAnnualCapitalPlan(record.id!);
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

  const columns: TableProps<IAnnualCapitalPlan>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tên kế hoạch',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mã kế hoạch',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      className: 'text-center',
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
      width: 100,
      className: 'text-center',
    },
    {
      title: 'Tổng vốn (VNĐ)',
      dataIndex: 'totalCapital',
      key: 'totalCapital',
      className: 'text-center',
      render: (text) => formatNumber(text),
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
              description="Bạn có chắc chắn muốn xóa kế hoạch vốn này?"
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
          <TDTable<IAnnualCapitalPlan>
            dataSource={data}
            columns={columns}
            isPagination={true}
            pageSize={pageSize}
            count={totalCount}
            offset={currentPage}
            setOffset={setCurrentPage}
            setPageSize={setPageSize}
            loading={loading}
            rowSelection={
              onPlanSelect
                ? {
                  type: 'radio',
                  selectedRowKeys: selectedPlanId ? [selectedPlanId] : [],
                  onSelect: (record) => {
                    onPlanSelect(record);
                  },
                }
                : undefined
            }
            rowKey="id"
          />
        </div>
      </div>
    </>
  );
};
