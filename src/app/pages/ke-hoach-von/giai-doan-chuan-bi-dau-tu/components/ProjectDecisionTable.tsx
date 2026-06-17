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
import { IProjectDecision, DecisionType } from '@/models';
import { TDTable } from '@/app/components';
import { deleteProjectDecision } from '@/services/projectDecision.service';
import { useProjectDecisionTable } from './useProjectDecisionTable';

interface ProjectDecisionTableProps {
  searchData?: SearchData;
  projectId?: string;
  decisionType?: DecisionType;
}

const getDecisionTypeLabel = (type?: DecisionType): string => {
  switch (type) {
    case DecisionType.InvestmentPolicy:
      return 'Quyết định chủ trương đầu tư';
    case DecisionType.InvestmentDecision:
      return 'Quyết định đầu tư';
    default:
      return 'Không xác định';
  }
};

export const ProjectDecisionTable: React.FC<ProjectDecisionTableProps> = ({
  searchData,
  projectId,
  decisionType,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectDecisionTable({ searchData, projectId, decisionType });

  const handleAction = async (type: string, record: IProjectDecision): Promise<void> => {
    try {
      switch (type) {
        case 'edit':
          dispatch(actionsModal.setDataModalCapBon(record));
          dispatch(actionsModal.setModalVisibleCapBon(true));
          break;
        case 'view':
          dispatch(actionsModal.setDataModalCapBon({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisibleCapBon(true));
          break;
        case 'delete':
          await deleteProjectDecision(record.id!);
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

  const allColumns: TableProps<IProjectDecision>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Loại quyết định',
      dataIndex: 'type',
      key: 'type',
      width: 200,
      render: (type) => getDecisionTypeLabel(type),
    },
    {
      title: 'Số quyết định',
      dataIndex: 'decisionNumber',
      key: 'decisionNumber',
      width: 150,
    },
    {
      title: 'Ngày quyết định',
      dataIndex: 'decisionDate',
      key: 'decisionDate',
      width: 120,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Người/Đơn vị ra quyết định',
      dataIndex: 'decisionMaker',
      key: 'decisionMaker',
      width: 200,
    },
    {
      title: 'Đã phê duyệt',
      dataIndex: 'isApproved',
      key: 'isApproved',
      width: 120,
      className: 'text-center',
      render: (isApproved) => {
        return (
          <div
            className={clsx(
              'badge fw-bolder',
              isApproved ? 'badge-light-success' : 'badge-light-warning'
            )}
          >
            {isApproved ? 'Có' : 'Chưa'}
          </div>
        );
      },
    },
    {
      title: 'Ngày phê duyệt',
      dataIndex: 'approvedDate',
      key: 'approvedDate',
      width: 120,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
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
              onClick={() => handleAction('edit', record)}
              title="Sửa"
            >
              <i className="fa-regular fa-pen-to-square"></i>
            </a>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa quyết định này?"
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
          <TDTable<IProjectDecision>
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
