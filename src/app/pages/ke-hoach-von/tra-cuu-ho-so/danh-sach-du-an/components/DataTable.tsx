import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IProject, ProjectStatus, ProjectPhase } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { formatNumber } from '@/utils/utils';
import { useDataTable } from './useDataTable';
import ChiTietModal from './ChiTietModal';

const STORAGE_KEY = 'tra_cuu_project_column_config';

interface ColumnConfig {
  key: string;
  title: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'code', title: 'Mã dự án', visible: true },
  { key: 'name', title: 'Tên dự án', visible: true },
  { key: 'projectTypeName', title: 'Loại dự án', visible: false },
  { key: 'projectGroupName', title: 'Nhóm dự án', visible: false },
  { key: 'investorName', title: 'Chủ đầu tư', visible: true },
  { key: 'organizationUnitName', title: 'Đơn vị quản lý', visible: false },
  { key: 'contractorName', title: 'Nhà thầu', visible: false },
  { key: 'investmentCapitalSourceName', title: 'Nguồn vốn đầu tư', visible: false },
  { key: 'provinceName', title: 'Tỉnh/Thành phố', visible: true },
  { key: 'wardName', title: 'Phường/Xã', visible: false },
  { key: 'address', title: 'Địa chỉ', visible: true },
  { key: 'totalInvestment', title: 'Tổng mức đầu tư', visible: true },
  { key: 'allocatedCapital', title: 'Vốn đã phân bổ', visible: true },
  { key: 'disbursedCapital', title: 'Vốn đã giải ngân', visible: true },
  { key: 'startDate', title: 'Ngày bắt đầu', visible: false },
  { key: 'expectedEndDate', title: 'Ngày kết thúc dự kiến', visible: false },
  { key: 'actualEndDate', title: 'Ngày kết thúc thực tế', visible: false },
  { key: 'status', title: 'Trạng thái', visible: true },
  { key: 'currentPhase', title: 'Giai đoạn', visible: true },
  { key: 'description', title: 'Mô tả', visible: false },
  { key: 'objectives', title: 'Mục tiêu', visible: false },
  { key: 'scope', title: 'Phạm vi', visible: false },
  { key: 'content', title: 'Nội dung', visible: false },
  { key: 'expectedResults', title: 'Kết quả mong đợi', visible: false },
  { key: 'note', title: 'Ghi chú', visible: false },
];

interface DataTableProps {
  searchData?: SearchData;
}

const getStatusLabel = (status?: ProjectStatus): string => {
  switch (status) {
    case ProjectStatus.Draft:
      return 'Nháp';
    case ProjectStatus.Planning:
      return 'Đang lập kế hoạch';
    case ProjectStatus.Approved:
      return 'Đã phê duyệt';
    case ProjectStatus.Executing:
      return 'Đang thực hiện';
    case ProjectStatus.Suspended:
      return 'Tạm dừng';
    case ProjectStatus.Completed:
      return 'Hoàn thành';
    case ProjectStatus.Cancelled:
      return 'Hủy bỏ';
    default:
      return 'Không xác định';
  }
};

const getStatusBadgeClass = (status?: ProjectStatus): string => {
  switch (status) {
    case ProjectStatus.Draft:
      return 'badge-light-secondary';
    case ProjectStatus.Planning:
      return 'badge-light-info';
    case ProjectStatus.Approved:
      return 'badge-light-success';
    case ProjectStatus.Executing:
      return 'badge-light-warning';
    case ProjectStatus.Suspended:
      return 'badge-light-danger';
    case ProjectStatus.Completed:
      return 'badge-light-primary';
    case ProjectStatus.Cancelled:
      return 'badge-light-dark';
    default:
      return 'badge-light-secondary';
  }
};

const getPhaseLabel = (phase?: ProjectPhase): string => {
  switch (phase) {
    case ProjectPhase.Preparation:
      return 'Chuẩn bị đầu tư';
    case ProjectPhase.Implementation:
      return 'Thực hiện đầu tư';
    case ProjectPhase.Completion:
      return 'Kết thúc đầu tư';
    case ProjectPhase.PostInvestment:
      return 'Sau đầu tư';
    default:
      return 'Không xác định';
  }
};

export const DataTable: React.FC<DataTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useDataTable({ searchData });
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const random = useSelector((state: RootState) => state.global.random);
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  useEffect(() => {
    const loadColumnConfig = (): void => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ColumnConfig[];
          setColumnConfig(parsed);
        }
      } catch (error) {
        console.error('Error loading column config:', error);
      }
    };
    loadColumnConfig();
  }, [random]);

  const handleAction = (type: string, record: IProject): void => {
    if (type === 'chi-tiet') {
      dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
      dispatch(actionsModal.setModalVisible(true));
    }
  };

  const allColumns: TableProps<IProject>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Mã dự án',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Tên dự án',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại dự án',
      dataIndex: 'projectTypeName',
      key: 'projectTypeName',
      width: 150,
    },
    {
      title: 'Nhóm dự án',
      dataIndex: 'projectGroupName',
      key: 'projectGroupName',
      width: 150,
    },
    {
      title: 'Chủ đầu tư',
      dataIndex: 'investorName',
      key: 'investorName',
      width: 150,
    },
    {
      title: 'Đơn vị quản lý',
      dataIndex: 'organizationUnitName',
      key: 'organizationUnitName',
      width: 150,
    },
    {
      title: 'Nhà thầu',
      dataIndex: 'contractorName',
      key: 'contractorName',
      width: 150,
    },
    {
      title: 'Nguồn vốn đầu tư',
      dataIndex: 'investmentCapitalSourceName',
      key: 'investmentCapitalSourceName',
      width: 150,
    },
    {
      title: 'Tỉnh/Thành phố',
      dataIndex: 'provinceName',
      key: 'provinceName',
      width: 120,
    },
    {
      title: 'Phường/Xã',
      dataIndex: 'wardName',
      key: 'wardName',
      width: 120,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: value =>
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
      title: 'Tổng mức đầu tư',
      dataIndex: 'totalInvestment',
      key: 'totalInvestment',
      width: 150,
      className: 'text-end',
      render: value => (value ? formatNumber(value) : '-'),
    },
    {
      title: 'Vốn đã phân bổ',
      dataIndex: 'allocatedCapital',
      key: 'allocatedCapital',
      width: 150,
      className: 'text-end',
      render: value => (value ? formatNumber(value) : '-'),
    },
    {
      title: 'Vốn đã giải ngân',
      dataIndex: 'disbursedCapital',
      key: 'disbursedCapital',
      width: 150,
      className: 'text-end',
      render: value => (value ? formatNumber(value) : '-'),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: value => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Ngày kết thúc dự kiến',
      dataIndex: 'expectedEndDate',
      key: 'expectedEndDate',
      width: 150,
      render: value => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Ngày kết thúc thực tế',
      dataIndex: 'actualEndDate',
      key: 'actualEndDate',
      width: 150,
      render: value => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Giai đoạn',
      dataIndex: 'currentPhase',
      key: 'currentPhase',
      width: 150,
      className: 'text-center',
      render: phase => getPhaseLabel(phase),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      className: 'text-center',
      render: status => (
        <div className={clsx('badge fw-bolder', getStatusBadgeClass(status))}>
          {getStatusLabel(status)}
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: value =>
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
      title: 'Mục tiêu',
      dataIndex: 'objectives',
      key: 'objectives',
      width: 200,
      render: value =>
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
      title: 'Phạm vi',
      dataIndex: 'scope',
      key: 'scope',
      width: 200,
      render: value =>
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
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      render: value =>
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
      title: 'Kết quả mong đợi',
      dataIndex: 'expectedResults',
      key: 'expectedResults',
      width: 200,
      render: value =>
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
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 200,
      render: value =>
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
      width: 100,
      title: 'Thao tác',
      key: 'actions',
      className: 'text-center',
      fixed: 'right',
      render: (text, record) => (
        <div className="d-flex justify-content-center gap-2">
          <a
            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
            onClick={() => handleAction('chi-tiet', record)}
            title="Xem chi tiết"
          >
            <i className="fa-regular fa-eye"></i>
          </a>
        </div>
      ),
    },
  ];

  const columns = useMemo(() => {
    const visibleKeys = new Set(columnConfig.filter(col => col.visible).map(col => col.key));
    return allColumns.filter(
      col => col.key === 'index' || col.key === 'actions' || visibleKeys.has(col.key as string)
    );
  }, [columnConfig, currentPage, pageSize]);

  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IProject>
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
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>
      {modalVisible ? <ChiTietModal /> : null}
    </>
  );
};

