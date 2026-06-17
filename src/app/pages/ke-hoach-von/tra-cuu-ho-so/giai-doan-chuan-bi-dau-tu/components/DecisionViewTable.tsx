import React from 'react';
import { useDispatch } from 'react-redux';
import { TableProps } from 'antd/es/table';
import clsx from 'clsx';

import * as actionsModal from '@/redux/modal/Actions';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IProjectDecision, DecisionType } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { useProjectDecisionTable } from '@/app/pages/ke-hoach-von/giai-doan-chuan-bi-dau-tu/components/useProjectDecisionTable';

interface DecisionViewTableProps {
  searchData?: SearchData;
  projectId?: string;
  decisionType?: DecisionType;
  title?: string;
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

export const DecisionViewTable: React.FC<DecisionViewTableProps> = ({
  searchData,
  projectId,
  decisionType,
  title,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectDecisionTable({ searchData, projectId, decisionType });

  const handleView = (record: IProjectDecision): void => {
    dispatch(actionsModal.setDataModalViewDecision({ ...record, readOnly: true }));
    dispatch(actionsModal.setModalVisibleViewDecision(true));
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
      width: 100,
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
